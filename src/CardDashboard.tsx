import { ItemView, WorkspaceLeaf, TFile, normalizePath, Notice, MarkdownRenderer } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { FilterView } from "./FilterView";
import CardAddForm from "./CardAddForm";
import CardNote from "./CardNote";

export const CARD_DASHBOARD_VIEW_TYPE = "card-dashboard-view";

export class CardDashboardView extends ItemView {
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
    return "卡片笔记 面板";
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
    const dir = this.plugin.settings.cardsDirectory;
    const [sortType, setSortType] = useState<'created' | 'modified'>('created');
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagFilterValue, setTagFilterValue] = useState<{ and: string[][]; not: string[] }>({ and: [[]], not: [] });
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
    const [keyword, setKeyword] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [notes, setNotes] = useState<TFile[]>([]);
    const [contents, setContents] = useState<{file: TFile, content: string}[]>([]);
    const [refreshFlag, setRefreshFlag] = useState(0);

    useEffect(() => {
      if (!dir) return;
      const files = this.app.vault.getFiles();
      const filtered = files.filter((file: TFile) => file.path.startsWith(dir) && file.extension === "md");
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
    }, [dir, refreshFlag, this.app.vault.getFiles().length]);

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

    // 添加笔记
    const handleAdd = async () => {
      if (!inputValue.trim()) return;
      const now = new Date();
      const fileName = `卡片_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getTime()}.md`;
      const filePath = normalizePath(`${dir}/${fileName}`);
      let content = inputValue;
      if (tags.length > 0) {
        content = `---\ntags: [${tags.map(t => `\"${t}\"`).join(", ")}]\n---\n` + content;
      }
      await this.app.vault.create(filePath, content);
      setInputValue('');
      setTags([]);
      setRefreshFlag(f => f+1);
      new Notice('卡片已添加');
    };

    // 卡片删除
    const handleDelete = async (file: TFile) => {
      await this.app.vault.delete(file);
      setRefreshFlag(f => f+1);
      new Notice('卡片已删除');
    };

    // 卡片双击打开
    const handleOpen = (file: TFile) => {
      this.app.workspace.openLinkText(file.path, '', false);
    };

    // 瀑布流布局
    const getColumns = (cards: React.JSX.Element[], colCount: number) => {
      const cols: React.JSX.Element[][] = Array.from({length: colCount}, () => []);
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
        if (w >= cardWidth*3) cols = 3;
        else if (w >= cardWidth*2) cols = 2;
        setColCount(cols);
      };
      updateCol();
      window.addEventListener('resize', updateCol);
      return () => window.removeEventListener('resize', updateCol);
    }, []);

    // 卡片筛选
    let filtered = contents;
    if (keyword.trim()) {
      filtered = filtered.filter(({content}) => content.toLowerCase().includes(keyword.trim().toLowerCase()));
    }
    // TODO: 标签、日期筛选可复用 ContextDashboardView 逻辑

    const cardNodes = filtered.map(({file, content}) => (
      <CardNote
        key={file.path}
        file={file}
        content={content}
        app={this.app}
        component={this}
        onDelete={handleDelete}
        onOpen={handleOpen}
      />
    ));
    const columns = getColumns(cardNodes, colCount);

    return (
      <div style={{padding:16}}>
        {/* 筛选区域 */}
        <FilterView
          sortType={sortType}
          setSortType={setSortType}
          allTags={allTags}
          tagFilterValue={tagFilterValue}
          setTagFilterValue={setTagFilterValue}
          dir={dir}
          dateRange={dateRange}
          setDateRange={setDateRange}
          keyword={keyword}
          setKeyword={setKeyword}
        />
        {/* 添加区域 */}
        <CardAddForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          onAdd={handleAdd}
          tags={tags}
          setTags={setTags}
          tagSuggestions={allTags}
        />
        {/* 瀑布流卡片区域 */}
        <div style={{display:'flex',gap:16}}>
          {columns.map((col, idx) => (
            <div key={idx} style={{flex:1,minWidth:0}}>{col}</div>
          ))}
        </div>
      </div>
    );
  }
}

