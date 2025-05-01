import { App, ItemView, WorkspaceLeaf, TFile, Notice, Menu, Component } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState, useRef, useCallback } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import CardNote from "./cards/CardNote";
import { Icon } from "./components/Icon";
import Sidebar from "./sidebar/Sidebar";
import { DefaultFilterScheme, FilterScheme } from "./models/FilterScheme";
import { SidebarContent } from "./sidebar/SideBarContent";
import { HeatmapData } from "./components/Heatmap";
import { Searchbar } from "./searchbar/Searchbar";
import EmptyStateCard from "./cards/EmptyStateCard";
import { getAllTags } from "./utils/tagUtils";

export const CARD_DASHBOARD_VIEW_TYPE = "dashboard-view";

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
  const [allFilteredNotes, setAllFilteredNotes] = useState<TFile[]>([]); // Store all filtered notes before pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const notesPerPage = 20;

  const [refreshFlag, setRefreshFlag] = useState(0);

  const [totalNotesNum, setTotalNotesNum] = useState(0);
  const [totalTagsNum, setTotalTagsNum] = useState(0);
  const [heatmapValues, setHeatmapValues] = useState<HeatmapData[]>([]);

  const withinDateRange = (time: number, dateRange: { from: string; to: string }) => {
    const from = dateRange.from.length > 0 ? (new Date(dateRange.from).getTime()) : undefined;
    const to = dateRange.to.length > 0 ? (new Date(dateRange.to).getTime()) : undefined;

    if (!from && !to) return true;
    if (from && !to) return time >= from;
    if (!from && to) return time <= to;
    return time >= from! && time <= to!;
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
    setTotalTagsNum(getAllTags(app,files).length);
    setHeatmapValues(getHeatmapValues(files));
    const filtered = files.filter((file: TFile) =>
      withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, curFilterScheme.dateRange)
    );
    filtered.sort((a, b) => sortType === 'created' ? b.stat.ctime - a.stat.ctime : b.stat.mtime - a.stat.mtime);
    setAllFilteredNotes(filtered); // Store all filtered notes
    setNotes(filtered.slice(0, notesPerPage)); // Load initial page
    setCurrentPage(1); // Reset page number on filter/sort change
    setAllTags(getAllTags(app, filtered));

  }, [refreshFlag, sortType, curFilterScheme, app.vault.getFiles().length, dir]); // Add dir dependency

  const loadMoreNotes = useCallback(async () => {
    if (isLoading || notes.length >= allFilteredNotes.length) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const nextNotes = allFilteredNotes.slice(0, nextPage * notesPerPage);

    // Fetch content for the newly added notes only
    const notesToFetchContent = nextNotes.slice(notes.length);
    try {
      const newContents = await Promise.all(notesToFetchContent.map(async (file: TFile) => {
        const content = await app.vault.cachedRead(file);
        return { file, content };
      }));
      setNotes(nextNotes);
      setContents(prevContents => [...prevContents, ...newContents]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more notes content:", error);
      new Notice('加载更多笔记时出错');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, notes, allFilteredNotes, currentPage, notesPerPage, app.vault]);

  // Initial content load for the first page
  useEffect(() => {
    if (notes.length === 0) {
      setContents([]);
      return;
    }
    // Only load content if contents array is empty (initial load or filter change)
    if (contents.length === 0 && notes.length > 0) {
      setIsLoading(true);
      Promise.all(notes.map(async (file: TFile) => {
        const content = await app.vault.cachedRead(file);
        return { file, content };
      })).then(initialContents => {
        setContents(initialContents);
        setIsLoading(false);
      }).catch(error => {
        console.error("Error loading initial notes content:", error);
        new Notice('加载初始笔记时出错');
        setIsLoading(false);
      });
    }
  }, [notes]); // Dependency only on notes for initial load

  // Infinite scroll effect
  const observer = useRef<IntersectionObserver>(null);
  const lastCardElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && notes.length < allFilteredNotes.length) {
        loadMoreNotes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, loadMoreNotes, notes.length, allFilteredNotes.length]);

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
    if (curFilterScheme.id == DefaultFilterScheme.id) return;
    setCurFilterScheme(DefaultFilterScheme);
  };

  const handleClickFilterScheme = (index: number) => {
    if (curFilterScheme.id == filterSchemes[index].id) return;
    setCurFilterScheme(filterSchemes[index]);
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

  React.useEffect(() => {
    const updateCol = () => {
      // 获取主内容区宽度（减去侧边栏宽度）
      let mainWidth = window.innerWidth;
      const sidebarEl = document.querySelector('#sidebar') as HTMLElement;
      if (sidebarEl && showSidebar === 'normal') {
        const padding = 80;
        mainWidth -= sidebarEl.offsetWidth + padding;
      }
      const cardWidth = 600;
      const cardsPadding = 24
      const widthFor2Cards = cardWidth * 2 + cardsPadding;
      setColCount(mainWidth >= widthFor2Cards ? 2 : 1);
    };
    updateCol();
    window.addEventListener('resize', updateCol);
    return () => window.removeEventListener('resize', updateCol);
  }, [showSidebar]);

  // 卡片筛选 - Apply filtering to all notes before pagination
  let filteredForDisplay = contents;
  if (curFilterScheme?.keyword?.trim()) {
    const keyword = curFilterScheme.keyword.trim().toLowerCase();
    filteredForDisplay = filteredForDisplay.filter(({ content }) => content.toLowerCase().includes(keyword));
  }
  if (curFilterScheme.tagFilter.or.length > 0) {
    filteredForDisplay = filteredForDisplay.filter(({ file }) => {
      const fileTags: string[] = app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? [];
      return curFilterScheme.tagFilter.or.some((andTags) => andTags.every((andTag) => {
        return fileTags.some((fileTag) => fileTag.startsWith(andTag));
      }));
    });
  }
  if (curFilterScheme.tagFilter.not.length > 0) {
    filteredForDisplay = filteredForDisplay.filter(({ file }) => {
      const fileTags = app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? [];
      return !curFilterScheme.tagFilter.not.some((tag) => fileTags.some((fileTag: string) => fileTag.startsWith(tag)));
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
  const pinnedAndFiltered = filteredForDisplay
    .filter(({ file }) => pinnedFiles.includes(file.path))
    .concat(filteredForDisplay.filter(({ file }) => !pinnedFiles.includes(file.path)));

  const cardNodes = pinnedAndFiltered.map(({ file, content }, index) => {
    // Attach ref to the last card for intersection observer
    const isLastCard = index === pinnedAndFiltered.length - 1;
    return (
      <div ref={isLastCard ? lastCardElementRef : null} key={file.path}>
        <CardNote
          sortType={sortType}
          file={file}
          tags={app.metadataCache.getFileCache(file)?.frontmatter?.tags ?? []}
          content={content}
          app={app}
          component={component}
          onDelete={handleDelete}
          onOpen={handleOpen}
          setPin={handlePin}
          isPinned={pinnedFiles.includes(file.path)}
        />
      </div>
    );
  });
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
      curFilterSchemeID={curFilterScheme.id}
      onClickAllNotesBtn={handleClickAllNotes}
      onClickFilterScheme={handleClickFilterScheme}
      filterSchemes={filterSchemes}
      onDragEnd={(newSchemes) => {
        setFilterSchemes(newSchemes);
        plugin.settings.filterSchemes = newSchemes;
        plugin.saveSettings();
      }}      
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
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
      {showSidebar != 'normal' && <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}>{sidebarContent}</Sidebar>}
      {showSidebar == 'normal' && sidebarContent}
      <div className="main-container" style={{ display: 'inline-block' }} ref={mainBoardRef}>
        <div className="main-header-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="main-header-title" style={{ display: "flex", alignItems: "center" }}>
            <button style={{
              marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
              display: showSidebar == 'normal' ? 'none' : 'inline-flex', alignItems: 'center'
            }}
              onClick={() => setShowSidebar('show')}
              title="展开侧边栏"
            ><Icon name="menu" /></button>
            {curFilterScheme.id == DefaultFilterScheme.id && <div className="main-header-title-content">{curFilterScheme.name}</div>}
            {curFilterScheme.id != DefaultFilterScheme.id && <div style={{ display: "flex" }}>
              <div className="main-header-title-content main-header-title-content-clickable" onClick={() => {
                setCurFilterScheme(DefaultFilterScheme);
              }}>{DefaultFilterScheme.name}</div>
              <div className="main-header-title-separator">{'/'}</div>
              <div className="main-header-title-content">{curFilterScheme.name}</div>
            </div>}
          </div>
          <Searchbar allTags={allTags} setCurFilterScheme={setCurFilterScheme} />
        </div>
        <div className="main-subheader-container" style={{ marginBottom: 6, marginRight: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: "flex", alignItems: 'center' }}>
            <span style={{ padding: '12px 6px', color: 'var(--text-muted)', fontSize: 'var(--font-smaller)' }}>共 {cardNodes.length} 条笔记</span>
            {cardNodes.length > 0 && <button style={{ marginLeft: '6px', padding: '0 6px', background: 'transparent' }}
              children={<Icon name="arrow-down-wide-narrow" />}
              onClick={(e) => sortMenu(e.nativeEvent, sortType, setSortType)}
            />}
          </div>
          <button onClick={() => plugin.addCardNote()} style={{ padding: '4px 12px' }}>添加笔记</button>
        </div>
        <div className="main-cards" style={{ display: 'flex', gap: 16, }}>
          {cardNodes.length === 0 ? (
            <EmptyStateCard isSearch={curFilterScheme.id != DefaultFilterScheme.id} />
          ) : (
            columns.map((col, idx) => (
              <div className="main-cards-column" key={idx}>{col}</div>
            ))
          )}
        </div>
        {/* Add loading and end-of-list indicators here */}
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          {isLoading && <div>加载中...</div>}
          {!isLoading && notes.length >= allFilteredNotes.length && cardNodes.length > 0 && <div>你已经到底部了</div>}
        </div>
      </div>
    </div>
  );
}

