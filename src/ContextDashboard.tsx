import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import MyPlugin from "./main";
import { JSX, StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { TagFilterGroup } from "./components/TagFilterGroup";
import { FilterView } from "./components/FilterView";

export const CONTEXT_DASHBOARD_VIEW_TYPE = "context-dashboard-view";

export class ContextDashboardView extends ItemView {
  root: Root | null = null;
  plugin: MyPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CONTEXT_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "上下文笔记 面板";
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <this._ContextDashboardView />
      </StrictMode>,
    );
    return;
  }

  async onClose() {
    // 可在此处清理资源
    this.root?.unmount();
  }

  _ContextDashboardView = () => {
    const dir = this.plugin.settings.notesDirectory;
    const [sortType, setSortType] = React.useState<'created' | 'modified'>('created');
    const [allTags, setAllTags] = React.useState<string[]>([]);
    const [tagFilterValue, setTagFilterValue] = React.useState<{ and: string[][]; not: string[] }>({ and: [[]], not: [] });
    const [dateRange, setDateRange] = React.useState<{ from: string; to: string }>({ from: '', to: '' });
    const [keyword, setKeyword] = React.useState<string>('');

    const [refreshFlag, setRefreshFlag] = React.useState(0);

    React.useEffect(() => {
      // 事件监听函数
      const onVaultChange = (file: TFile) => {
        if (file.path.startsWith(dir) && file.extension === "md") {
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
    }, [dir]);

    React.useEffect(() => {
      if (!dir) return;
      const files = this.app.vault.getFiles();
      const notes = files.filter((file: TFile) => file.path.startsWith(dir) && file.extension === "md");
      const tagSet = new Set<string>();
      notes.forEach((file: TFile) => {
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
    }, [dir, sortType, refreshFlag, this.app.vault.getFiles().length]);

    return <div>
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
      <this._ContextNotesView
        sortType={sortType}
        allTags={allTags}
        tagFilterValue={tagFilterValue}
        dir={dir}
        dateRange={dateRange}
        keyword={keyword}
      />
    </div>;
  }

  _FilterView = (props: {
    sortType: 'created' | 'modified',
    setSortType: (t: 'created' | 'modified') => void,
    allTags: string[],
    tagFilterValue: { and: string[][]; not: string[] },
    setTagFilterValue: (v: { and: string[][]; not: string[] }) => void,
    dir: string
  }) => {
    if (!props.dir) {
      return <div>请先在设置中配置要展示的笔记目录。</div>;
    }
    return <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em' }}>
      <div>
        <label style={{ marginRight: 8 }}>排序方式：</label>
        <select value={props.sortType} onChange={e => props.setSortType(e.target.value as 'created' | 'modified')}>
          <option value="created">按创建时间</option>
          <option value="modified">按编辑时间</option>
        </select>
      </div>
      <div>
        <label style={{ marginRight: 8 }}>标签筛选：</label>
        <TagFilterGroup
          allTags={props.allTags}
          value={props.tagFilterValue}
          onChange={props.setTagFilterValue}
        />
      </div>
    </div>;
  };

  _ContextNotesView = (props: {
    sortType: 'created' | 'modified',
    allTags: string[],
    tagFilterValue: { and: string[][]; not: string[] },
    dir: string,
    dateRange?: { from: string; to: string },
    keyword?: string
  }) => {
    const dir = props.dir;
    if (!dir) {
      return <div>请先在设置中配置要展示的笔记目录。</div>;
    }
    const files = this.app.vault.getFiles();
    let notes = files.filter((file: TFile) => file.path.startsWith(dir) && file.extension === "md");
    // 多行标签筛选逻辑
    const filterByTags = (notes: TFile[]): TFile[] => {
      const { and, not } = props.tagFilterValue;
      if ((and.length === 1 && and[0].length === 0) && not.length === 0) return notes;
      return notes.filter((file: TFile) => {
        const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
        const tags: string[] = Array.isArray(properties?.tags)
          ? properties.tags
          : typeof properties?.tags === 'string'
            ? [properties.tags]
            : [];
        if (not.length > 0 && not.some(tag => tags.includes(tag))) return false;
        if (and.length > 0) {
          return and.some(andRow => andRow.length === 0 || andRow.every(tag => tags.includes(tag)));
        }
        return true;
      });
    };
    notes = filterByTags(notes);
    // 日期筛选
    if (props.dateRange && (props.dateRange.from || props.dateRange.to)) {
      notes = notes.filter((file: TFile) => {
        const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
        let date: Date | null = null;
        if (properties?.date) {
          const d = new Date(properties.date);
          if (!isNaN(d.getTime())) date = d;
        }
        if (!date) {
          const match = file.basename.match(/(\d{4})[-_](\d{1,2})[-_](\d{1,2})/);
          if (match) {
            const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
            if (!isNaN(d.getTime())) date = d;
          }
        }
        if (!date) date = new Date(file.stat.ctime);
        if (props.dateRange?.from && date < new Date(props.dateRange.from)) return false;
        if (props.dateRange?.to && date > new Date(props.dateRange.to)) return false;
        return true;
      });
    }
    // 关键字筛选
    if (props.keyword && props.keyword.trim() !== "") {
      const kw = props.keyword.trim().toLowerCase();
      notes = notes.filter((file: TFile) => {
        const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
        const title = properties?.title || file.basename;
        if (title && title.toLowerCase().includes(kw)) return true;
        // 内容关键字筛选可选实现（如需全文搜索可异步读取文件内容）
        return false;
      });
    }
    if (notes.length === 0) {
      return <div>没有笔记</div>;
    }
    const getNoteDate = (file: TFile): Date => {
      const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
      if (properties?.date) {
        const d = new Date(properties.date);
        if (!isNaN(d.getTime())) return d;
      }
      const match = file.basename.match(/(\d{4})[-_](\d{1,2})[-_](\d{1,2})/);
      if (match) {
        const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
        if (!isNaN(d.getTime())) return d;
      }
      return new Date(file.stat.ctime);
    };
    const getCreatedTime = (file: TFile): number => file.stat.ctime;
    const getModifiedTime = (file: TFile): number => file.stat.mtime;
    const sortNotes = (notes: TFile[], type: 'created' | 'modified'): TFile[] => {
      if (type === 'created') {
        return [...notes].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
      } else {
        return [...notes].sort((a, b) => getModifiedTime(b) - getModifiedTime(a));
      }
    };
    notes = sortNotes(notes, props.sortType);
    type GroupedNotes = Record<number, Record<number, Record<number, Record<number, TFile[]>>>>;
    const groupNotes = (notes: TFile[]): GroupedNotes => {
      const grouped: GroupedNotes = {};
      notes.forEach((file) => {
        const date = getNoteDate(file);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const quarter = Math.floor((month - 1) / 3) + 1;
        const day = date.getDate();
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][quarter]) grouped[year][quarter] = {};
        if (!grouped[year][quarter][month]) grouped[year][quarter][month] = {};
        if (!grouped[year][quarter][month][day]) grouped[year][quarter][month][day] = [];
        grouped[year][quarter][month][day].push(file);
      });
      return grouped;
    };
    const renderNoteItem = (file: TFile) => {
      const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
      return (
        <li key={file.path} style={{ marginBottom: '0.5em' }}>
          <a href="#"
            style={{ marginRight: '12px' }}
            onClick={(e) => {
              e.preventDefault();
              this.app.workspace.openLinkText(file.path, "", false);
            }}>
            {properties?.title || file.basename}
          </a>
          {properties?.tags && properties.tags.map((tag: string) =>
            <span key={tag} style={{ marginLeft: '6px' }}>
              <span className="cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-">#</span>
              <span className="cm-hashtag cm-hashtag-end cm-meta cm-tag-">{tag}</span>
            </span>
          )}
        </li>
      );
    };
    const renderDay = (files: TFile[], day: number) => [
      <h4 key={"day-" + day} style={{ fontWeight: 500, marginTop: '0.2em' }}>{day}日</h4>,
      <ul>
        {...files.map(renderNoteItem)}
      </ul>
    ];
    const renderMonth = (monthObj: Record<number, TFile[]>, month: number) => [
      <h3 key={"month-" + month} style={{ fontSize: '1.1em', fontWeight: 600, marginTop: '0.3em' }}>{month}月</h3>,
      ...Object.keys(monthObj).sort((a, b) => Number(b) - Number(a)).flatMap(day => renderDay(monthObj[Number(day)], Number(day)))
    ];
    const renderQuarter = (quarterObj: Record<number, Record<number, TFile[]>>, quarter: number) => [
      <h2 key={"quarter-" + quarter} style={{ fontSize: '1.2em', fontWeight: 'bold', marginTop: '0.5em' }}>{`第${quarter}季度`}</h2>,
      ...Object.keys(quarterObj).sort((a, b) => Number(b) - Number(a)).flatMap(month => renderMonth(quarterObj[Number(month)], Number(month)))
    ];
    const renderYear = (yearObj: Record<number, Record<number, Record<number, TFile[]>>>, year: number) => [
      <h1 key={"year-" + year} style={{ fontSize: '1.5em', fontWeight: 'bold', marginTop: '1em' }}>{year}年</h1>,
      ...Object.keys(yearObj).sort((a, b) => Number(b) - Number(a)).flatMap(quarter => renderQuarter(yearObj[Number(quarter)], Number(quarter)))
    ];
    const grouped = groupNotes(notes);
    const elements = Object
      .keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .flatMap(year => renderYear(grouped[Number(year)], Number(year)));
    return <div>{elements}</div>;
  };
};


