import * as React from "react";
import { TagFilterGroup } from "./TagFilterGroup";

export interface FilterViewProps {
  sortType: 'created' | 'modified';
  setSortType: (t: 'created' | 'modified') => void;
  allTags: string[];
  tagFilterValue: { and: string[][]; not: string[] };
  setTagFilterValue: (v: { and: string[][]; not: string[] }) => void;
  dir: string;
  dateRange: { from: string; to: string };
  setDateRange: (v: { from: string; to: string }) => void;
  keyword: string;
  setKeyword: (v: string) => void;
}

export const FilterView: React.FC<FilterViewProps> = (props) => {
  if (!props.dir) {
    return <div>请先在设置中配置要展示的笔记目录。</div>;
  }
  return (
    <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
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
      <div>
        <label style={{ marginRight: 8 }}>日期筛选：</label>
        <input
          type="date"
          value={props.dateRange.from}
          onChange={e => props.setDateRange({ ...props.dateRange, from: e.target.value })}
          style={{ marginRight: 4 }}
        />
        <span> 至 </span>
        <input
          type="date"
          value={props.dateRange.to}
          onChange={e => props.setDateRange({ ...props.dateRange, to: e.target.value })}
          style={{ marginLeft: 4 }}
        />
      </div>
      <div>
        <label style={{ marginRight: 8 }}>关键字：</label>
        <input
          type="text"
          value={props.keyword}
          onChange={e => props.setKeyword(e.target.value)}
          placeholder="输入标题关键字"
        />
      </div>
    </div>
  );
};