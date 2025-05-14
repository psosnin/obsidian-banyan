import { App, ItemView, WorkspaceLeaf, TFile, Notice, Menu, Platform } from "obsidian";
import BanyanPlugin from "./main";
import { StrictMode, useEffect, useState, useRef, useCallback } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import CardNote from "./cards/CardNote";
import { Icon } from "./components/Icon";
import Sidebar from "./sidebar/Sidebar";
import { DefaultFilterSchemeID, FilterScheme, getDefaultFilterScheme, SearchFilterScheme, SearchFilterSchemeID } from "./models/FilterScheme";
import { SidebarContent } from "./sidebar/SideBarContent";
import { getHeatmapValues, HeatmapData } from "./components/Heatmap";
import { Searchbar } from "./searchbar/Searchbar";
import EmptyStateCard from "./cards/EmptyStateCard";
import { getFilesTags } from "./utils/tagUtils";
import { ViewScheme } from "./models/ViewScheme";
import { ViewSelectModal } from "./sidebar/viewScheme/ViewSelectModal";
import { createFileWatcher } from './utils/fileWatcher';
import { openDeleteConfirmModal } from "./components/ConfirmModal";
import AddNoteView from "./cards/AddNoteView";
import { getAllCardFiles } from "./utils/fileUtils";

export const CARD_DASHBOARD_VIEW_TYPE = "dashboard-view";

export class CardDashboard extends ItemView {
  root: Root | null = null;
  plugin: BanyanPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: BanyanPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CARD_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Banyan";
  }

  getIcon(): string {
    return 'wallet-cards';
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <CardDashboardView plugin={this.plugin} app={this.app} />
      </StrictMode>
    );
    return;
  }

  async onClose() {
    this.root?.unmount();
  }
}

const CardDashboardView = ({ plugin, app }: { plugin: BanyanPlugin, app: App }) => {

  const [showSidebar, setShowSidebar] = useState<'normal' | 'hide' | 'show'>(Platform.isMobile ? 'hide' : 'normal');

  const dir = plugin.settings.cardsDirectory;

  const [sortType, setSortType] = useState<'created' | 'modified'>(plugin.settings.sortType || 'created');

  const [allTags, setAllTags] = useState<string[]>([]);

  const [filterSchemes, setFilterSchemes] = useState<FilterScheme[]>(plugin.settings.filterSchemes);
  const [viewSchemes, setViewSchemes] = useState<ViewScheme[]>(plugin.settings.viewSchemes);
  const [curScheme, setCurScheme] = useState<FilterScheme | ViewScheme>(getDefaultFilterScheme(plugin.settings.filterSchemes));

  const [allContents, setAllContents] = useState<{ file: TFile, content: string }[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<{ file: TFile, content: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const notesPerPage = 10; // 每页显示的笔记数量
  const [curSchemeNotesLength, setCurSchemeNotesLength] = useState(0);

  const [colCount, setColCount] = useState(1);

  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const [totalNotesNum, setTotalNotesNum] = useState(0);
  const [totalTagsNum, setTotalTagsNum] = useState(0);
  const [heatmapValues, setHeatmapValues] = useState<HeatmapData[]>([]);

  const [refreshFlag, setRefreshFlag] = useState(0);
  // const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });

  // 文件监听逻辑
  useEffect(() => {
    const watcher = createFileWatcher(plugin);
    const unsubscribe = watcher.onChange(({ type, file }) => {
      if (type === 'delete') {
        // 当文件被删除时，从视图中移除该文件
        const newSchemes = viewSchemes.map(scheme => {
          const newFiles = scheme.files.filter((fileID) => fileID !== file.getID());
          const newPinned = scheme.pinned.filter((fileID) => fileID !== file.getID());
          return { ...scheme, files: newFiles, pinned: newPinned };
        });
        setViewSchemes(newSchemes);
        if (curScheme.type == 'ViewScheme') {
          const newScheme = newSchemes.filter(scheme => scheme.id == curScheme.id).first();
          if (newScheme) {
            setCurScheme(newScheme);
          }
        }
      }
    });
    return () => {
      unsubscribe();
      watcher.dispose();
    };
  }, [app]);

  // 加载所有文件并获取内容
  useEffect(() => {
    if (!dir) return;
    setIsLoading(true);

    // 获取所有符合目录条件的文件
    const files = getAllCardFiles(plugin);

    setTotalNotesNum(files.length);
    setTotalTagsNum(getFilesTags(app, files).length);
    setHeatmapValues(getHeatmapValues(files));

    // 应用日期范围和视图筛选
    let filtered = files;
    if (curScheme.type == 'FilterScheme') {
      filtered = filtered.filter((file: TFile) => withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, curScheme.dateRange));
    }
    if (curScheme.type == 'ViewScheme') {
      filtered = filtered.filter((file: TFile) => curScheme.files.includes(file.getID()));
    }

    // 排序
    filtered.sort((a, b) => sortType === 'created' ? b.stat.ctime - a.stat.ctime : b.stat.mtime - a.stat.mtime);

    setAllTags(getFilesTags(app, filtered));

    // 加载所有文件内容
    Promise.all(filtered.map(async (file: TFile) => {
      const content = await app.vault.cachedRead(file);
      return { file, content };
    }))
      .then(allLoadedContents => {
        setAllContents(allLoadedContents);
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error loading notes content:", error);
        new Notice('加载笔记内容时出错');
        setIsLoading(false);
      });
  }, [sortType, curScheme, refreshFlag, getAllCardFiles(plugin).length, dir]); // Add dir dependency

  // 根据筛选条件和分页设置显示的笔记
  useEffect(() => {
    if (allContents.length === 0) {
      setDisplayedNotes([]);
      return;
    }

    // 应用关键词和标签筛选
    let filtered = allContents;
    if (curScheme.type === 'FilterScheme') {
      if (curScheme.keyword.trim()) {
        const keyword = curScheme.keyword.trim().toLowerCase();
        filtered = filtered.filter(({ content }) => content.toLowerCase().includes(keyword));
      }
      if (curScheme.tagFilter.or.length > 0) {
        filtered = filtered.filter(({ file }) => {
          const fileTags: string[] = file.getTags(app);
          return curScheme.tagFilter.or.some((andTags) => andTags.every((andTag) => {
            return fileTags.some((fileTag) => fileTag.startsWith(andTag));
          }));
        });
      }
      if (curScheme.tagFilter.not.length > 0) {
        filtered = filtered.filter(({ file }) => {
          const fileTags = file.getTags(app);
          return !curScheme.tagFilter.not.some((tag) => fileTags.some((fileTag: string) => fileTag.startsWith(tag)));
        });
      }
    }

    setCurSchemeNotesLength(filtered.length);
    // 应用分页
    const endIndex = currentPage * notesPerPage;
    setDisplayedNotes(filtered.slice(0, endIndex));
  }, [allContents, currentPage, curScheme, app.metadataCache]);

  useEffect(() => {
    plugin.settings.viewSchemes = viewSchemes;
    plugin.saveSettings();
  }, [viewSchemes]);

  useEffect(() => {
    plugin.settings.filterSchemes = filterSchemes;
    plugin.saveSettings();
  }, [filterSchemes]);

  // 加载更多笔记（增加页码）
  const loadMoreNotes = useCallback(() => {
    if (isLoading) return;
    setCurrentPage(prevPage => prevPage + 1);
  }, [isLoading]);

  // Infinite scroll effect
  const observer = useRef<IntersectionObserver>(null);
  const lastCardElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreNotes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, loadMoreNotes]);

  React.useEffect(() => {
    const updateCol = () => {
      if (Platform.isMobile) {
        setShowSidebar('hide');
        setColCount(1);
        return;
      }
      if (!dashboardRef.current) return;
      const containerWidth = dashboardRef.current.clientWidth;
      // const containerHeight = dashboardRef.current.clientHeight;
      // // 获取可视区域的宽高
      // const viewportWidth = window.visualViewport?.width || window.innerWidth;
      // const viewportHeight = window.visualViewport?.height || window.innerHeight;
      // setPanelSize({ width: Math.floor(viewportWidth), height: Math.floor(viewportHeight) });
      const _showSidebar = containerWidth >= 900 ? 'normal' : 'hide';
      setShowSidebar(_showSidebar);
      const cardsColumns = plugin.settings.cardsColumns;
      if (cardsColumns == 1) {
        setColCount(1);
        return;
      }
      const mainWidth = containerWidth - (_showSidebar == 'normal' ? 400 : 0);
      const cardWidth = 600;
      const cardsPadding = 24;
      const widthFor2Cols = cardWidth + cardsPadding + cardWidth;
      const cnt = mainWidth >= widthFor2Cols ? 2 : 1;
      setColCount(cnt);
    };

    // 初始化时执行一次
    updateCol();

    // 使用ResizeObserver监听主容器尺寸变化
    const resizeObserver = new ResizeObserver(updateCol);
    if (dashboardRef.current) {
      resizeObserver.observe(dashboardRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 卡片删除
  const handleDelete = async (file: TFile) => {
    openDeleteConfirmModal({
      app,
      description: `确定要将此笔记移至系统回收站吗？`,
      onConfirm: async () => {
        await app.vault.trash(file, true);
        new Notice('笔记已移至系统回收站');
      }
    });
  };

  // 卡片双击打开
  const handleOpen = (file: TFile) => {
    app.workspace.openLinkText(file.path, '', false);
  };

  const handleBatchImportToView = () => {
    const modal = new ViewSelectModal(app, {
      viewSchemes: viewSchemes,
      onSelect: (scheme) => {
        const temp = new Set<number>([...scheme.files, ...displayedNotes.map(({ file }) => file.getID())]);
        const newFiles = Array.from(temp);
        const newScheme = { ...scheme, files: newFiles };
        const newSchemes = viewSchemes.map(scheme => scheme.id == newScheme.id ? newScheme : scheme);
        setViewSchemes(newSchemes);
      }
    });
    modal.open();
  };

  const handleImportToView = (file: TFile) => {
    const modal = new ViewSelectModal(app, {
      viewSchemes: viewSchemes,
      onSelect: (scheme) => {
        if (scheme.files.includes(file.getID())) {
          new Notice('笔记已存在于该视图中');
          return;
        }
        const newFiles = [...scheme.files, file.getID()];
        const newScheme = { ...scheme, files: newFiles };
        const newSchemes = viewSchemes.map(s => s.id == newScheme.id ? newScheme : s);
        setViewSchemes(newSchemes);
      }
    });
    modal.open();
  }

  const handleRemoveFromView = (file: TFile) => {
    if (curScheme.type !== 'ViewScheme') return; // 按理说UI层已经保障了只有ViewScheme时才会有这个按钮
    const newFiles = [...curScheme.files.filter((fileID) => fileID !== file.getID())];
    const newPinned = [...curScheme.pinned.filter((fileID) => fileID !== file.getID())];
    const newScheme = { ...curScheme, files: newFiles, pinned: newPinned };
    const newSchemes = viewSchemes.map(scheme => scheme.id == newScheme.id ? newScheme : scheme);
    setViewSchemes(newSchemes);
    setCurScheme(newScheme);
  }

  // 卡片置顶
  const handlePin = (file: TFile, isPinned: boolean) => {
    // 使用文件的创建时间戳作为唯一标识符，而非文件路径
    const fileId = file.getID();
    const newPinned = [...curScheme.pinned.filter(p => p !== fileId)].concat(isPinned ? [fileId] : []);
    const noticeStr = isPinned ? '已置顶' : '已取消置顶';
    const newScheme = { ...curScheme, pinned: newPinned };
    if (newScheme.type === 'ViewScheme') {
      const newSchemes = viewSchemes.map(scheme => scheme.id == newScheme.id ? newScheme : scheme);
      setViewSchemes(newSchemes);
    } else {
      const newSchemes = filterSchemes.map(scheme => {
        if (scheme.id == newScheme.id) {
          return newScheme;
        }
        if (newScheme.id == SearchFilterSchemeID && scheme.id == DefaultFilterSchemeID) { // 「搜索」的置顶其实要给到「默认」
          return { ...getDefaultFilterScheme(filterSchemes), pinned: newPinned };
        }
        return scheme;
      });
      setFilterSchemes(newSchemes);
    }
    setCurScheme(newScheme)
    new Notice(noticeStr);
  };

  // 渲染卡片时优先显示置顶
  const pinnedNotes = displayedNotes
    .filter(({ file }) => curScheme.pinned.includes(file.getID()))
    .concat(displayedNotes.filter(({ file }) => !curScheme.pinned.includes(file.getID())));

  const cardNodes = pinnedNotes.map(({ file }, index) => {
    // Attach ref to the last card for intersection observer
    const isLastCard = index === pinnedNotes.length - 1;
    return (
      <div ref={isLastCard ? lastCardElementRef : null} key={file.getID()}>
        <CardNote
          sortType={sortType}
          file={file}
          tags={file.getTags(app)}
          app={app}
          showTitle={plugin.settings.showTitle}
          onDelete={handleDelete}
          onOpen={handleOpen}
          setPin={handlePin}
          isPinned={curScheme.pinned.includes(file.getID())}
          isInView={curScheme.type === 'ViewScheme'}
          onImportToView={handleImportToView}
          onRemoveFromView={handleRemoveFromView}
        />
      </div>
    );
  });

  // 瀑布流布局
  const getColumns = (cards: React.JSX.Element[], colCount: number) => {
    const cols: React.JSX.Element[][] = Array.from({ length: colCount }, () => []);
    cards.forEach((card, idx) => {
      cols[idx % colCount].push(card);
    });
    return cols;
  };
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
      onClickDate={(date) => {
        setCurScheme({ ...SearchFilterScheme, name: date, dateRange: { from: date, to: date } });
      }}
      onClickAddNote={() => plugin.addCardNote()}
      onClickRandomNote={() => plugin.openRandomNote()}

      curFilterSchemeID={curScheme.type == 'FilterScheme' ? curScheme.id : undefined}
      onClickFilterScheme={(index) => {
        if (curScheme === filterSchemes[index]) return;
        setCurScheme(filterSchemes[index]);
      }}
      filterSchemes={filterSchemes}
      onFilterDragEnd={(newSchemes) => {
        setFilterSchemes(newSchemes);
      }}
      setFilterScheme={(fs) => {
        if (filterSchemes.filter(f => f.id == fs.id).length == 0) {
          setFilterSchemes([...filterSchemes, fs]);
        } else {
          const updatedFilterSchemes = filterSchemes.map((s) => s.id == fs.id ? fs : s);
          setFilterSchemes(updatedFilterSchemes);
        }
        if (curScheme.type === 'FilterScheme' && curScheme.id == fs.id) {
          setCurScheme(fs);
        }
      }}
      deleteFilterScheme={(id) => {
        const updatedFilterSchemes = filterSchemes.filter((s) => s.id != id);
        setFilterSchemes(updatedFilterSchemes);
      }}

      viewSchemes={viewSchemes}
      curViewSchemeID={curScheme.type === 'ViewScheme' ? curScheme.id : undefined}
      onClickViewScheme={(index) => {
        if (curScheme === viewSchemes[index]) return;
        setCurScheme(viewSchemes[index]);
      }}
      setViewScheme={(vs) => {
        if (viewSchemes.filter(v => v.id == vs.id).length == 0) {
          setViewSchemes([...viewSchemes, vs]);
        } else {
          const updated = viewSchemes.map((v) => v.id == vs.id ? vs : v);
          setViewSchemes(updated);
        }
        if (curScheme.type === 'ViewScheme' && curScheme.id == vs.id) {
          setCurScheme(vs);
        }
      }}
      onViewDragEnd={(newSchemes) => {
        setViewSchemes(newSchemes);
      }}
      deleteViewScheme={(id) => {
        const updatedViewSchemes = viewSchemes.filter((s) => s.id != id);
        setViewSchemes(updatedViewSchemes);
      }}
    />;
  })();

  return (
    <div className="dashboard-container" ref={dashboardRef} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
      {showSidebar != 'normal' && <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}>{sidebarContent}</Sidebar>}
      {showSidebar == 'normal' && sidebarContent}
      {/* <div className="dashboard-size-display">
        {panelSize.width} x {panelSize.height}
      </div> */}
      <div className="main-container">
        <div className="main-header-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-small)' }}>
          <div className="main-header-title" style={{ display: "flex", alignItems: "center" }}>
            <button style={{
              background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
              display: showSidebar == 'normal' ? 'none' : 'inline-flex', alignItems: 'center'
            }}
              onClick={() => setShowSidebar('show')}
              title="展开侧边栏"
            ><Icon name="menu" /></button>
            {curScheme.id === DefaultFilterSchemeID && <div className="main-header-title-content">{curScheme.name}</div>}
            {curScheme.id !== DefaultFilterSchemeID &&
              <div style={{ display: "flex" }}>
                <div className="main-header-title-content main-header-title-content-clickable" onClick={() => {
                  setCurScheme(getDefaultFilterScheme(filterSchemes));
                }}>{getDefaultFilterScheme(filterSchemes).name}</div>
                <div className="main-header-title-separator">{'/'}</div>
                <div className="main-header-title-content">{curScheme.name}</div>
              </div>}
          </div>
          <Searchbar allTags={allTags} setCurFilterScheme={setCurScheme} />
        </div>
        {!Platform.isMobile && <div style={{ marginTop: 16 }}><AddNoteView app={app} plugin={plugin} onAdd={() => setRefreshFlag(f => f + 1)} /></div>}
        <div className="main-subheader-container" style={{ marginBottom: 6, marginTop: 0, marginRight: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: "flex", alignItems: 'center' }}>
            <span style={{ padding: '12px 6px', color: 'var(--text-muted)', fontSize: 'var(--font-smaller)' }}>已加载 {displayedNotes.length} / {curSchemeNotesLength} 条笔记</span>
            {cardNodes.length > 0 && <button style={{ marginLeft: '6px', padding: '0 6px', background: 'transparent' }}
              children={<Icon name="arrow-down-wide-narrow" />}
              onClick={(e) => sortMenu(e.nativeEvent, sortType, setSortType)}
            />}
          </div>
          <div className="main-subheader-btn-section" style={{ display: "flex", gap: 8 }}>
            {curScheme.type != 'ViewScheme' && curScheme.id != DefaultFilterSchemeID && cardNodes.length > 0 && <button onClick={handleBatchImportToView} style={{ padding: '4px 0', backgroundColor: 'transparent', color: 'var(--interactive-accent)' }}>批量添加到视图</button>}
          </div>
        </div>
        <div className="main-cards" style={{ display: 'flex', gap: 16, }}>
          {cardNodes.length === 0 ? (
            <EmptyStateCard isSearch={curScheme.type == 'FilterScheme' && curScheme.id !== DefaultFilterSchemeID} />
          ) : (
            columns.map((col, idx) => (
              <div className="main-cards-column" key={idx}>{col}</div>
            ))
          )}
        </div>
        {/* Add loading and end-of-list indicators here */}
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          {isLoading && <div>加载中...</div>}
          {!isLoading && displayedNotes.length >= curSchemeNotesLength && cardNodes.length > 0 && <div>你已经到底部了</div>}
        </div>
      </div>
    </div>
  );
}

const withinDateRange = (time: number, dateRange: { from: string; to: string }) => {
  const fromDate = dateRange.from.length > 0 ? (new Date(dateRange.from)) : undefined;
  const toDate = dateRange.to.length > 0 ? (new Date(dateRange.to)) : undefined;
  if (toDate) toDate.setDate(toDate.getDate() + 1); // 要加一天，因为 toDate 是包含的

  const from = fromDate ? fromDate.setHours(0, 0, 0, 0) : undefined;
  const to = toDate ? toDate.setHours(0, 0, 0, 0) : undefined;

  if (!from && !to) return true;
  if (from && !to) return time >= from;
  if (!from && to) return time <= to;
  return time >= from! && time <= to!;
}

