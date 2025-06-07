import { ItemView, WorkspaceLeaf, Menu, Platform } from "obsidian";
import BanyanPlugin from "src/main";
import { StrictMode, useEffect, useState, useRef, useCallback } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import CardNote from "./cards/CardNote";
import { Icon } from "src/components/Icon";
import Sidebar from "./sidebar/Sidebar";
import { DefaultFilterSchemeID, getDefaultFilterScheme } from "src/models/FilterScheme";
import { SidebarContent } from "./sidebar/SideBarContent";
import { Searchbar } from "./header/searchbar/Searchbar";
import EmptyStateCard from "./cards/EmptyStateCard";
import { ViewSelectModal } from "./sidebar/viewScheme/ViewSelectModal";
import { createFileWatcher } from 'src/utils/fileWatcher';
import AddNoteView from "./header/AddNoteView";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";

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
        <CardDashboardView plugin={this.plugin} />
      </StrictMode>
    );
    return;
  }

  async onClose() {
    this.root?.unmount();
  }
}

const CardDashboardView = ({ plugin }: { plugin: BanyanPlugin }) => {


  const requestData = useCombineStore((state) => state.requestData);
  const updateDisplayFiles = useCombineStore((state) => state.updateDisplayFiles);
  const curSchemeFiles = useCombineStore((state) => state.curSchemeFiles);
  const displayFiles = useCombineStore((state) => state.displayFiles);
  const curScheme = useCombineStore((state) => state.curScheme);
  const filterSchemes = useCombineStore((state) => state.filterSchemes);
  const viewSchemes = useCombineStore((state) => state.viewSchemes);
  const setCurScheme = useCombineStore((state) => state.setCurScheme);
  const updateViewScheme = useCombineStore((state) => state.updateViewScheme);
  const curSchemeNotesLength = useCombineStore((state) => state.curSchemeFiles.length);
  const app = plugin.app;

  const [showSidebar, setShowSidebar] = useState<'normal' | 'hide' | 'show'>(Platform.isMobile ? 'hide' : 'normal');
  const [sortType, setSortType] = useState<'created' | 'modified'>(plugin.settings.sortType || 'created');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const notesPerPage = 10; // 每页显示的笔记数量
  const [colCount, setColCount] = useState(1);
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // 文件监听逻辑
  useEffect(() => {
    const watcher = createFileWatcher(plugin);
    const unsubscribe = watcher.onChange(({ type }) => {
      if (type === 'delete') {
        setRefreshFlag(f => f + 1);
      }
      if (type === 'create' ||  type === 'modify' || type === 'meta-change') {
        setRefreshFlag(f => f + 1);
      }
    });
    return () => {
      unsubscribe();
      watcher.dispose();
    };
  }, [app]);

  useEffect(() => {
    const requestFiles = async () => {
      setIsLoading(true);
      await requestData();
      setCurrentPage(1);
      setIsLoading(false);
    }
    requestFiles();
  }, [sortType, curScheme, refreshFlag, plugin.settings.cardsDirectory]);

  useEffect(() => {
    updateDisplayFiles(currentPage * notesPerPage);
  }, [currentPage, curSchemeFiles]);

  const loadMoreNotes = useCallback(() => {
    if (isLoading) return;
    setCurrentPage(prevPage => prevPage + 1);
  }, [isLoading]);

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

  useEffect(() => {
    const updateCol = () => {
      if (Platform.isMobile) {
        setShowSidebar('hide');
        setColCount(1);
        return;
      }
      if (!dashboardRef.current) return;
      const containerWidth = dashboardRef.current.clientWidth;
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

  const handleBatchImportToView = () => {
    const modal = new ViewSelectModal(app, {
      viewSchemes: viewSchemes,
      onSelect: (scheme) => {
        const temp = new Set<number>([...scheme.files, ...displayFiles.map((f) => f.id)]);
        const newFiles = Array.from(temp);
        const newScheme = { ...scheme, files: newFiles };
        updateViewScheme(newScheme);
      }
    });
    modal.open();
  };

  const cardNodes = displayFiles.map((f, index) => {
    const isLastCard = index === displayFiles.length - 1;
    return (
      <div ref={isLastCard ? lastCardElementRef : null} key={f.id}>
        <CardNote fileInfo={f} />
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

  return (
    <div className="dashboard-container" ref={dashboardRef} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
      {showSidebar != 'normal' && <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}><SidebarContent /></Sidebar>}
      {showSidebar == 'normal' && <SidebarContent />}
      <div className="main-container">
        <div className="main-header-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-small)' }}>
          <div className="main-header-title" style={{ display: "flex", alignItems: "center" }}>
            <button className="clickable-icon" style={{ display: showSidebar == 'normal' ? 'none' : 'inline-flex' }}
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
          <Searchbar />
        </div>
        {!Platform.isMobile && <div style={{ marginTop: 16 }}><AddNoteView app={app} plugin={plugin} onAdd={() => setRefreshFlag(f => f + 1)} /></div>}
        <div className="main-subheader-container" style={{ marginBottom: 6, marginTop: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: "flex", alignItems: 'center' }}>
            <span style={{ padding: '12px 6px', color: 'var(--text-muted)', fontSize: 'var(--font-smaller)' }}>{i18n.t('loaded_notes', { count: `${displayFiles.length}`, total: `${curSchemeNotesLength}` })}</span>
            {cardNodes.length > 0 && <SortFilesButton plugin={plugin} sortType={sortType} setSortType={setSortType} />}
          </div>
          <div className="main-subheader-btn-section" style={{ display: "flex", gap: 8 }}>
            {curScheme.type != 'ViewScheme' && curScheme.id != DefaultFilterSchemeID && cardNodes.length > 0 && <button className="clickable-icon" onClick={handleBatchImportToView} style={{ padding: '4px 12px', color: 'var(--interactive-accent)' }}>批量添加到视图</button>}
          </div>
        </div>
        <div className="main-cards" style={{ display: 'flex', gap: 16, flex: 1 }}>
          {cardNodes.length === 0 ? (
            <EmptyStateCard isSearch={curScheme.type == 'FilterScheme' && curScheme.id !== DefaultFilterSchemeID} />
          ) : (
            columns.map((col, idx) => (
              <div className="main-cards-column" style={{ width: '100%' }} key={idx}>{col}</div>
            ))
          )}
        </div>
        {/* Add loading and end-of-list indicators here */}
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          {isLoading && <div>加载中...</div>}
          {!isLoading && displayFiles.length >= curSchemeNotesLength && cardNodes.length > 0 && <div>{i18n.t('reached_bottom')}</div>}
        </div>
      </div>
    </div>
  );
}

const SortFilesButton = ({ plugin, sortType, setSortType }: { plugin: BanyanPlugin, sortType: 'created' | 'modified', setSortType: (st: 'created' | 'modified') => void }) => {

  const sortMenu = (event: MouseEvent) => {
    const sortMenu = new Menu();
    sortMenu.addItem((item) => {
      item.setTitle(i18n.t('recently_created'));
      item.setChecked(sortType === 'created');
      item.onClick(() => {
        setSortType('created');
        plugin.settings.sortType = 'created';
        plugin.saveSettings();
      });
    });
    sortMenu.addItem((item) => {
      item.setTitle(i18n.t('recently_updated'));
      item.setChecked(sortType === 'modified');
      item.onClick(() => {
        setSortType('modified');
        plugin.settings.sortType = 'modified';
        plugin.saveSettings();
      });
    });
    sortMenu.showAtMouseEvent(event);
  };

  return (
    <button className="clickable-icon" style={{ marginLeft: '6px' }}
      children={<Icon name="arrow-down-wide-narrow" />}
      onClick={(e) => sortMenu(e.nativeEvent)}
    />
  );
}