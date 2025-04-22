import { App, ItemView, WorkspaceLeaf, TFile, normalizePath, Notice, MarkdownRenderer, Menu, setIcon } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { FilterView } from "./components/FilterView";
import CardNote from "./components/CardNote";

export const CARD_DASHBOARD_VIEW_TYPE = "card-dashboard-view";

export class CardDashboard extends ItemView {
  root: Root | null = null;
  plugin: MyPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CARD_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ted Note Way";
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <this._CardDashboardView />
      </StrictMode>
    );
    return;
  }

  async onClose() {
    this.root?.unmount();
  }

  _CardDashboardView = () => {

    const [noteType, setNoteType] = useState<'card' | 'context'>(this.plugin.settings.noteType || 'card');

    const dir = () => noteType === 'card' ? this.plugin.settings.cardsDirectory : this.plugin.settings.notesDirectory;

    const [sortType, setSortType] = useState<'created' | 'modified'>(this.plugin.settings.sortType || 'created');

    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagFilterValue, setTagFilterValue] = useState<{ and: string[][]; not: string[] }>({ and: [[]], not: [] });

    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

    const [keyword, setKeyword] = useState<string>('');

    const [notes, setNotes] = useState<TFile[]>([]);
    const [contents, setContents] = useState<{ file: TFile, content: string }[]>([]);

    const [refreshFlag, setRefreshFlag] = useState(0);

    useEffect(() => {
      // 事件监听函数
      const onVaultChange = (file: TFile) => {
        if (file.path.startsWith(dir()) && file.extension === "md") {
          setRefreshFlag(f => f + 1);
        }
      };
      this.app.vault.on('create', onVaultChange);
      this.app.vault.on('delete', onVaultChange);
      this.app.vault.on('modify', onVaultChange);
      return () => {
        this.app.vault.off('create', onVaultChange);
        this.app.vault.off('delete', onVaultChange);
        this.app.vault.off('modify', onVaultChange);
      };
    }, [noteType]);

    const withinDateRange = (time: number, dateRange: { from: string; to: string }) => {
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime();
      if (!from && !to) return true;
      if (from && !to) return time >= from;
      if (!from && to) return time <= to;
      return time >= from && time <= to;
    }

    useEffect(() => {
      if (!dir()) return;
      const files = this.app.vault.getMarkdownFiles();
      const filtered = files.filter((file: TFile) =>
        file.path.startsWith(dir())
        && withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, dateRange)
      );
      // 排序
      if (sortType === 'created') {
        filtered.sort((a, b) => b.stat.ctime - a.stat.ctime);
      } else if (sortType === 'modified') {
        filtered.sort((a, b) => b.stat.mtime - a.stat.mtime);
      }
      setNotes(filtered);
      // 标签收集
      const tagSet = new Set<string>();
      filtered.forEach((file: TFile) => {
        const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (properties?.tags) {
          if (Array.isArray(properties.tags)) {
            properties.tags.forEach((tag: string) => tagSet.add(tag));
          } else if (typeof properties.tags === 'string') {
            tagSet.add(properties.tags);
          }
        }
      });
      setAllTags(Array.from(tagSet));
    }, [refreshFlag, noteType, sortType, dateRange, this.app.vault.getFiles().length]);

    useEffect(() => {
      if (notes.length === 0) {
        setContents([]);
        return;
      }
      Promise.all(notes.map(async (file: TFile) => {
        const content = await this.app.vault.cachedRead(file);
        return { file, content };
      })).then(setContents);
    }, [notes]);

    // 卡片删除
    const handleDelete = async (file: TFile) => {
      await this.app.vault.delete(file);
      setRefreshFlag(f => f + 1);
      new Notice('笔记已删除');
    };

    // 卡片双击打开
    const handleOpen = (file: TFile) => {
      this.app.workspace.openLinkText(file.path, '', false);
    };

    // 瀑布流布局
    const getColumns = (cards: React.JSX.Element[], colCount: number) => {
      const cols: React.JSX.Element[][] = Array.from({ length: colCount }, () => []);
      cards.forEach((card, idx) => {
        cols[idx % colCount].push(card);
      });
      return cols;
    };

    // 根据窗口宽度自适应列数
    const [colCount, setColCount] = useState(1);
    React.useEffect(() => {
      const updateCol = () => {
        const w = window.innerWidth;
        const cardWidth = 500;
        let cols = 1;
        if (w >= cardWidth * 3) cols = 3;
        else if (w >= cardWidth * 2) cols = 2;
        setColCount(cols);
      };
      updateCol();
      window.addEventListener('resize', updateCol);
      return () => window.removeEventListener('resize', updateCol);
    }, []);

    // 卡片筛选
    let filtered = contents;
    if (keyword.trim()) {
      filtered = filtered.filter(({ content }) => content.toLowerCase().includes(keyword.trim().toLowerCase()));
    }
    // TODO: 标签、日期筛选可复用 ContextDashboardView 逻辑

    // 卡片置顶
    const [pinnedFiles, setPinnedFiles] = useState<string[]>(() => this.plugin.settings.pinnedFiles || []);
    const handlePin = (file: TFile, isPinned: boolean) => {
      if (!isPinned) {
        setPinnedFiles(pinnedFiles.filter(p => p !== file.path));
        new Notice('已取消置顶');
      } else {
        setPinnedFiles([file.path, ...pinnedFiles]);
        new Notice('已置顶');
      }
    };

    useEffect(() => {
      // 保证 pinned 状态和设置同步
      if (JSON.stringify(pinnedFiles) !== JSON.stringify(this.plugin.settings.pinnedFiles)) {
        this.plugin.settings.pinnedFiles = pinnedFiles;
        this.plugin.saveSettings().then(() => {
          console.log('Saved pinned files', pinnedFiles);
        });
      }
    }, [pinnedFiles]);

    // 渲染卡片时优先显示置顶
    const sorted = filtered
      .filter(({ file }) => pinnedFiles.indexOf(file.path) != -1)
      .concat(filtered.filter(({ file }) => pinnedFiles.indexOf(file.path) == -1)); //[...filtered];

    const cardNodes = sorted.map(({ file, content }) => (
      <CardNote
        key={file.path}
        sortType={sortType}
        file={file}
        tags={this.app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? []}
        content={content}
        app={this.app}
        component={this}
        onDelete={handleDelete}
        onOpen={handleOpen}
        setPin={handlePin}
        isPinned={pinnedFiles.contains(file.path)}
      />
    ));
    const columns = getColumns(cardNodes, colCount);

    const sortSwitchButton = (
      sortType: 'created' | 'modified',
      setSortType: (t: 'created' | 'modified') => void) => {
      const ref = React.useRef<HTMLButtonElement>(null);
      useEffect(() => {
        if (ref.current) {
          setIcon(ref.current, "arrow-down-wide-narrow");
        }
      }, []);
      const sortMenu = (
        event: MouseEvent,
        sortType: 'created' | 'modified',
        setSortType: (t: 'created' | 'modified') => void) => {
        const sortMenu = new Menu();
        sortMenu.addItem((item) => {
          item.setTitle("最近创建");
          item.setChecked(sortType === 'created');
          item.onClick(() => {
            setSortType('created');
            this.plugin.settings.sortType = 'created';
            this.plugin.saveSettings();
          });
        });
        sortMenu.addItem((item) => {
          item.setTitle("最近更新");
          item.setChecked(sortType === 'modified');
          item.onClick(() => {
            setSortType('modified');
            this.plugin.settings.sortType = 'modified';
            this.plugin.saveSettings();
          });
        });
        sortMenu.showAtMouseEvent(event);
      };
      return <button className="clickable-icon"
        ref={ref}
        style={{ marginLeft: '12px' }}
        onClick={(e) => sortMenu(e.nativeEvent, sortType, setSortType)}
      />;
    };

    const header = (
      sortType: 'created' | 'modified',
      setSortType: (t: 'created' | 'modified') => void,
      noteType: 'card' | 'context',
      setNoteType: (t: 'card' | 'context') => void) => {

      const noteSwitchButton = (
        noteType: 'card' | 'context',
        setNoteType: (t: 'card' | 'context') => void) => {
        const ref = React.useRef<HTMLButtonElement>(null);
        useEffect(() => {
          if (ref.current) {
            setIcon(ref.current, "chevron-down");
          }
        }, []);
        const noteMenu = (
          event: MouseEvent,
          noteType: 'card' | 'context',
          setNoteType: (t: 'card' | 'context') => void) => {
          const menu = new Menu();
          menu.addItem((item) => {
            item.setTitle("卡片笔记");
            item.setChecked(noteType === 'card');
            item.onClick(() => {
              setNoteType('card');
              this.plugin.settings.noteType = 'card';
              this.plugin.saveSettings();
            });
          });
          menu.addItem((item) => {
            item.setTitle("上下文笔记");
            item.setChecked(noteType === 'context');
            item.onClick(() => {
              setNoteType('context');
              this.plugin.settings.noteType = 'context';
              this.plugin.saveSettings();
            });
          });
          menu.showAtMouseEvent(event);
        };
        return <button className="clickable-icon" style={{ marginRight: '2px' }}
          ref={ref}
          onClick={(e) => noteMenu(e.nativeEvent, noteType, setNoteType)} />;
      }

      const titleSection = () => {
        return <div style={{ display: "flex", alignItems: "center" }}>
          {noteSwitchButton(noteType, setNoteType)}
          <h4 style={{ margin: '0' }}>{noteType == 'card' ? '卡片笔记' : '上下文笔记'}</h4>
          {sortSwitchButton(sortType, setSortType)}
        </div>;
      }

      return <div className="card-dashboard-header-container">
        {titleSection()}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="card-dashboard-header-searchbar">
            <input
              type="text"
              placeholder="关键字"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
            />
          </div>
        </div>
      </div>;
    };

    return (
      <div style={{ padding: 16 }}>
        {/* 标题区域 */}
        {header(sortType, setSortType, noteType, setNoteType)}
        <FilterView
          allTags={allTags}
          tagFilterValue={tagFilterValue}
          setTagFilterValue={setTagFilterValue}
          dir={dir()}
          dateRange={dateRange}
          setDateRange={setDateRange}
          keyword={keyword}
          setKeyword={setKeyword}
        />
        {/* 添加卡片按钮区域 */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => this.plugin.addCardNote()} style={{ padding: '8px 16px' }}>添加笔记</button>
        </div>
        {/* 瀑布流卡片区域 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {columns.map((col, idx) => (
            <div key={idx} style={{ flex: 1, minWidth: 0 }}>{col}</div>
          ))}
        </div>
      </div>
    );
  }
}

