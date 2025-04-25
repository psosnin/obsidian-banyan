import { App, ItemView, WorkspaceLeaf, TFile, Notice, Menu, setIcon, Component } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { FilterView } from "./components/FilterView";
import CardNote from "./components/CardNote";
import { Icon } from "./components/Icon";
import Sidebar from "./components/Sidebar";
import { SidebarContent } from "./components/SideBarContent";
import { HeatmapData } from "./components/Heatmap";

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

  getIcon(): string {
    return 'wallet-cards';
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <CardDashboardView plugin={this.plugin} app={this.app} component={this} />
      </StrictMode>
    );
    return;
  }

  async onClose() {
    this.root?.unmount();
  }
}

const CardDashboardView = ({ plugin, app, component }: { plugin: MyPlugin, app: App, component: Component }) => {

  const [showSidebar, setShowSidebar] = useState<'normal' | 'hide' | 'show'>('normal');

  const dir = plugin.settings.cardsDirectory;

  const [sortType, setSortType] = useState<'created' | 'modified'>(plugin.settings.sortType || 'created');

  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagFilterValue, setTagFilterValue] = useState<{ and: string[][]; not: string[] }>({ and: [[]], not: [] });

  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const [keyword, setKeyword] = useState<string>('');

  const [notes, setNotes] = useState<TFile[]>([]);
  const [contents, setContents] = useState<{ file: TFile, content: string }[]>([]);

  const [refreshFlag, setRefreshFlag] = useState(0);

  const [totalNotesNum, setTotalNotesNum] = useState(0);
  const [totalTagsNum, setTotalTagsNum] = useState(0);
  const [heatmapValues, setHeatmapValues] = useState<HeatmapData[]>([]);

  const withinDateRange = (time: number, dateRange: { from: string; to: string }) => {
    const from = new Date(dateRange.from).getTime();
    const to = new Date(dateRange.to).getTime();
    if (!from && !to) return true;
    if (from && !to) return time >= from;
    if (!from && to) return time <= to;
    return time >= from && time <= to;
  }

  const getAllTags = (files: TFile[]) => {
    const tagSet = new Set<string>();
    files.forEach((file: TFile) => {
      const properties = app.metadataCache.getFileCache(file)?.frontmatter;
      if (properties?.tags) {
        if (Array.isArray(properties.tags)) {
          properties.tags.forEach((tag: string) => tagSet.add(tag));
        } else if (typeof properties.tags === 'string') {
          tagSet.add(properties.tags);
        }
      }
    });
    return Array.from(tagSet);
  }

  const getHeatmapValues = (files: TFile[]) => {
    const valueMap = files
      .map(file => new Date(file.stat.ctime).toISOString().slice(0, 10))
      .reduce<Map<string, number>>(
        (pre, cur) => pre.set(cur, pre.has(cur)? pre.get(cur)! + 1 : 1), 
        new Map<string, number>());
    return Array
      .from(valueMap.entries())
      .map(([key, value]) => {
        return { date: key, count: value };
      }); // 第一层转换
  }

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 700? 'normal' : 'hide');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dir) return;
    const files = app.vault.getMarkdownFiles().filter((file: TFile) => file.path.startsWith(dir));
    setTotalNotesNum(files.length);
    setTotalTagsNum(getAllTags(files).length);
    setHeatmapValues(getHeatmapValues(files));
    const filtered = files.filter((file: TFile) =>
      withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, dateRange)
    );
    filtered.sort((a, b) => sortType === 'created' ? b.stat.ctime - a.stat.ctime : b.stat.mtime - a.stat.mtime);
    setNotes(filtered);
    setAllTags(getAllTags(filtered));
  }, [refreshFlag, sortType, dateRange, app.vault.getFiles().length]);

  useEffect(() => {
    if (notes.length === 0) {
      setContents([]);
      return;
    }
    Promise.all(notes.map(async (file: TFile) => {
      const content = await app.vault.cachedRead(file);
      return { file, content };
    })).then(setContents);
  }, [notes]);

  // 卡片删除
  const handleDelete = async (file: TFile) => {
    await app.vault.delete(file);
    setRefreshFlag(f => f + 1);
    new Notice('笔记已删除');
  };

  // 卡片双击打开
  const handleOpen = (file: TFile) => {
    app.workspace.openLinkText(file.path, '', false);
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
      setColCount(w >= cardWidth * 2 ? 2 : 1);
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
  const [pinnedFiles, setPinnedFiles] = useState<string[]>(() => plugin.settings.pinnedFiles || []);
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
    if (JSON.stringify(pinnedFiles) !== JSON.stringify(plugin.settings.pinnedFiles)) {
      plugin.settings.pinnedFiles = pinnedFiles;
      plugin.saveSettings().then(() => {
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
      tags={app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? []}
      content={content}
      app={app}
      component={component}
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
          plugin.settings.sortType = 'created';
          plugin.saveSettings();
        });
      });
      sortMenu.addItem((item) => {
        item.setTitle("最近更新");
        item.setChecked(sortType === 'modified');
        item.onClick(() => {
          setSortType('modified');
          plugin.settings.sortType = 'modified';
          plugin.saveSettings();
        });
      });
      sortMenu.showAtMouseEvent(event);
    };
    return <button className="clickable-icon"
    children={<Icon name="arrow-down-wide-narrow"/>}  
    style={{ marginLeft: '12px' }}
      onClick={(e) => sortMenu(e.nativeEvent, sortType, setSortType)}
    />;
  };

  const SidebarToggleButton = () => (
    <button
      style={{ marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', 
        display: showSidebar == 'normal' ? 'none' : 'inline-flex', alignItems: 'center' }}
      onClick={() => setShowSidebar('show')}
      title="展开侧边栏"
    >
      <Icon name="menu" />
    </button>
  );

  const header = (
    sortType: 'created' | 'modified',
    setSortType: (t: 'created' | 'modified') => void) => {
    const titleSection = () => {
      return <div style={{ display: "flex", alignItems: "center" }}>
        <SidebarToggleButton />
        <h4>所有笔记</h4>
        {sortSwitchButton(sortType, setSortType)}
      </div>;
    }
    return <div className="card-dashboard-header-container">
      {titleSection()}
      <div className="card-dashboard-header-searchbar">
        <Icon name="search"/>
        <input
          type="text"
          placeholder="关键字"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
        />
      </div>
    </div>;
  };

  return (
    <div style={{ display: 'flex'}}>
      { showSidebar != 'normal' && <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}>
        <SidebarContent notesNum={totalNotesNum} tagsNum={totalTagsNum} heatmapValues={heatmapValues} />
      </Sidebar>}
      { showSidebar == 'normal' && <SidebarContent 
        notesNum={totalNotesNum} 
        tagsNum={totalTagsNum} 
        heatmapValues={heatmapValues} />}
      <div style={{ flex: 1, minWidth: 500}}>
        {/* 标题区域 */}
        {header(sortType, setSortType)}
        <FilterView
          allTags={allTags}
          tagFilterValue={tagFilterValue}
          setTagFilterValue={setTagFilterValue}
          dir={dir}
          dateRange={dateRange}
          setDateRange={setDateRange}
          keyword={keyword}
          setKeyword={setKeyword}
        />
        {/* 添加卡片按钮区域 */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => plugin.addCardNote()} style={{ padding: '8px 16px' }}>添加笔记</button>
        </div>
        {/* 瀑布流卡片区域 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {columns.map((col, idx) => (
            <div key={idx} style={{ flex: 1, minWidth: 0 }}>{col}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

