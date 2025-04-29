import { App, ItemView, WorkspaceLeaf, TFile, Notice, Menu, Component } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import CardNote from "./components/CardNote";
import { Icon } from "./components/Icon";
import Sidebar from "./components/Sidebar";
import { DefaultFilterScheme, FilterScheme, SidebarBtnIndex, SidebarContent } from "./components/SideBarContent";
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

  const [filterSchemes, setFilterSchemes] = useState<FilterScheme[]>(plugin.settings.filterSchemes);
  const [curFilterScheme, setCurFilterScheme] = useState<FilterScheme>(DefaultFilterScheme);

  const [notes, setNotes] = useState<TFile[]>([]);
  const [contents, setContents] = useState<{ file: TFile, content: string }[]>([]);

  const [refreshFlag, setRefreshFlag] = useState(0);

  const [totalNotesNum, setTotalNotesNum] = useState(0);
  const [totalTagsNum, setTotalTagsNum] = useState(0);
  const [heatmapValues, setHeatmapValues] = useState<HeatmapData[]>([]);
  const [sidebarBtnIndex, setSidebarBtnIndex] = useState<SidebarBtnIndex>({ type: 'allNotes' });

  const withinDateRange = (time: number, dateRange: { from: string; to: string }) => {
    const from = dateRange.from.length > 0 ? (new Date(dateRange.from).getTime()) : undefined;
    const to = dateRange.to.length > 0 ? (new Date(dateRange.to).getTime()) : undefined;

    if (!from && !to) return true;
    if (from && !to) return time >= from;
    if (!from && to) return time <= to;
    return time >= from! && time <= to!;
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
        (pre, cur) => pre.set(cur, pre.has(cur) ? pre.get(cur)! + 1 : 1),
        new Map<string, number>());
    return Array
      .from(valueMap.entries())
      .map(([key, value]) => {
        return { date: key, count: value };
      }); // 第一层转换
  }

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 700 ? 'normal' : 'hide');
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
      withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, curFilterScheme.dateRange)
    );
    filtered.sort((a, b) => sortType === 'created' ? b.stat.ctime - a.stat.ctime : b.stat.mtime - a.stat.mtime);
    setNotes(filtered);
    setAllTags(getAllTags(filtered));

  }, [refreshFlag, sortType, curFilterScheme, app.vault.getFiles().length]);

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

  const handleClickAllNotes = () => {
    if (sidebarBtnIndex.type == 'allNotes') return;
    setSidebarBtnIndex({ type: 'allNotes' });
    setCurFilterScheme(DefaultFilterScheme);
    // setRefreshFlag(f => f + 1);
  };

  const handleClickFilterScheme = (index: number) => {
    if (sidebarBtnIndex.type == 'filterScheme' && sidebarBtnIndex.index == index) return;
    setSidebarBtnIndex({ type: 'filterScheme', index: index });
    setCurFilterScheme(filterSchemes[index]);
    setRefreshFlag(f => f + 1);
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
  const mainBoardRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if (mainBoardRef.current) {
    //   const { width } = mainBoardRef.current.getBoundingClientRect();
    //   const cardWidth = 500;
    //   setColCount(width >= cardWidth * 2 ? 2 : 1);
    // }
    const element = mainBoardRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const cardWidth = 300;
      console.log('width', width);
      setColCount(width >= cardWidth * 2 ? 2 : 1);
    });

    observer.observe(element);
    return () => observer.unobserve(element); // 清理
  }, []); // 空依赖数组表示仅在挂载时运行
  // React.useEffect(() => {
  //   const updateCol = () => {
  //     // 获取主内容区宽度（减去侧边栏宽度）
  //     let mainWidth = window.innerWidth;
  //     const sidebarEl = document.querySelector('.sidebar-container');
  //     if (sidebarEl && showSidebar === 'normal') {
  //       console.log('sidebarEl', (sidebarEl as HTMLElement).offsetWidth);
  //       mainWidth -= (sidebarEl as HTMLElement).offsetWidth;
  //     }
  //     const cardWidth = 500;
  //     setColCount(mainWidth >= cardWidth * 2 ? 2 : 1);
  //   };
  //   updateCol();
  //   window.addEventListener('resize', updateCol);
  //   return () => window.removeEventListener('resize', updateCol);
  // }, [showSidebar]);

  // 卡片筛选
  let filtered = contents;
  if (curFilterScheme?.keyword?.trim()) {
    filtered = filtered.filter(({ content }) => content.toLowerCase().includes(curFilterScheme!.keyword!.trim().toLowerCase()));
  }
  if (curFilterScheme?.tagFilter?.or?.length > 0) {
    filtered = filtered.filter(({ file }) => {
      const fileTags: string[] = app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? [];
      return curFilterScheme!.tagFilter!.or!.some((andTags) => andTags.every((andTag) => {
        return fileTags.some((fileTag) => fileTag.startsWith(andTag));
      }));
    });
  }
  if (curFilterScheme?.tagFilter?.not?.length > 0) {
    filtered = filtered.filter(({ file }) => {
      const tags = app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? [];
      return !curFilterScheme!.tagFilter!.not!.some((tag) => tags.includes(tag));
    });
  }

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
  const pinned = filtered
    .filter(({ file }) => pinnedFiles.indexOf(file.path) != -1)
    .concat(filtered.filter(({ file }) => pinnedFiles.indexOf(file.path) == -1)); //[...filtered];

  const cardNodes = pinned.map(({ file, content }) => (
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


  const sidebarContent = (() => {
    return <SidebarContent
      allTags={allTags}
      app={app}
      notesNum={totalNotesNum}
      tagsNum={totalTagsNum}
      heatmapValues={heatmapValues}
      sidebarBtnIndex={sidebarBtnIndex}
      onClickAllNotesBtn={handleClickAllNotes}
      onClickFilterScheme={handleClickFilterScheme}
      filterSchemes={filterSchemes}
      setFilterScheme={(fs) => {
        if (filterSchemes.filter(f => f.id == fs.id).length == 0) {
          setFilterSchemes([...filterSchemes, fs]);
          plugin.settings.filterSchemes = [...filterSchemes, fs];
        } else {
          const updatedFilterSchemes = filterSchemes.map((s) => s.id == fs.id ? fs : s);
          setFilterSchemes(updatedFilterSchemes);
          plugin.settings.filterSchemes = updatedFilterSchemes;
        }
        plugin.saveSettings();
        if (curFilterScheme.id == fs.id) {
          setCurFilterScheme(fs);
        }
      }}
      deleteFilterScheme={(id) => {
        const updatedFilterSchemes = filterSchemes.filter((s) => s.id != id);
        setFilterSchemes(updatedFilterSchemes);
        plugin.settings.filterSchemes = updatedFilterSchemes;
        plugin.saveSettings();
      }}
      pinFilterScheme={(id) => {
        // const updated = pinnedFilterSchemes.map((id, i) => i == id? {...s, isPinned: true} : s);
        // setPinnedFilterSchemes(updated);
        // plugin.settings.pinnedFilterSchemes = updated;
      }}
    />;
  })();

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto', marginRight: 'auto', maxWidth: '980' }}>
      {showSidebar != 'normal' && <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}>{sidebarContent}</Sidebar>}
      {showSidebar == 'normal' && sidebarContent}
      <div className="card-dashboard-container" style={{ flex: 1 }} ref={mainBoardRef}>
        <div className="card-dashboard-header-container">
          <div className="card-dashboard-header-title" style={{ display: "flex", alignItems: "center" }}>
            <button style={{
              marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
              display: showSidebar == 'normal' ? 'none' : 'inline-flex', alignItems: 'center'
            }}
              onClick={() => setShowSidebar('show')}
              title="展开侧边栏"
            ><Icon name="menu" /></button>
            <h4>{curFilterScheme.name}</h4>
          </div>
          <div className="card-dashboard-header-searchbar">
            <Icon name="search" />
            <input
              type="text"
              placeholder="关键字"
              value={curFilterScheme.keyword}
              onChange={e => {
                const newKeyword = e.target.value;
                setCurFilterScheme(prev => ({ ...prev, keyword: newKeyword }));
              }}
              style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 6, marginTop: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: "flex", alignItems: 'center' }}>
            <span style={{ padding: '12px 6px', color: 'var(--text-muted)', fontSize: 'var(--font-smaller)' }}>共 {cardNodes.length} 条笔记</span>
            {cardNodes.length > 0 && <button style={{ marginLeft: '6px', padding: '0 6px', background: 'transparent' }}
              children={<Icon name="arrow-down-wide-narrow" />}
              onClick={(e) => sortMenu(e.nativeEvent, sortType, setSortType)}
            />}
          </div>
          <button onClick={() => plugin.addCardNote()} style={{ padding: '4px 12px' }}>添加笔记</button>
        </div>
        <div className="card-dashboard-cards" style={{ display: 'flex', gap: 16 }}>
          {columns.map((col, idx) => (
            <div key={idx} style={{ flex: 1, minWidth: 0 }}>{col}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

