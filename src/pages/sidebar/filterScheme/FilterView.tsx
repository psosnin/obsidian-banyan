import * as React from "react";
import { TagFilterGroup } from "../../../components/TagFilterGroup";
import { FilterScheme } from "src/models/FilterScheme";
import { Platform } from "obsidian";

export interface FilterViewProps {
  allTags: string[];
  filterScheme: FilterScheme;
  setFilterScheme: (fs: FilterScheme) => void;
  showName?: boolean; // 是否显示名称
  showKeyword?: boolean; // 是否显示关键词
  showLabel?: boolean; // 是否显示标签
}

export const FilterView: React.FC<FilterViewProps> = ({ allTags, filterScheme, setFilterScheme, showName = true, showKeyword = true, showLabel = true }) => {

  return (
    <div style={{ marginBottom: '0.5em', display: 'flex', gap: Platform.isMobile ? '1.2em' : '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
      {showName && <div className="filter-name-container" >
        {showLabel && <label style={{ marginRight: 12 }}>方案名称</label>}
        <input
          type="text"
          value={filterScheme.name}
          placeholder={showLabel ? "" : "输入方案名称"}
          onChange={e => setFilterScheme({ ...filterScheme, name: e.target.value })}
          style={{ marginRight: 4, padding: '20px 16px', backgroundColor: 'var(--background-secondary)', border: 'none', outline: 'none' }}
        />
      </div>}
      <div className="filter-date-container">
        {showLabel && <label style={{ marginRight: 12 }}>日期</label>}
        <input
          type="date"
          value={filterScheme.dateRange.from}
          onChange={e => setFilterScheme({ ...filterScheme, dateRange: { from: e.target.value, to: filterScheme.dateRange.to } })}
          style={{ marginRight: 4 }}
        />
        <span> - </span>
        <input
          type="date"
          value={filterScheme.dateRange.to}
          onChange={e => setFilterScheme({ ...filterScheme, dateRange: { to: e.target.value, from: filterScheme.dateRange.from } })}
          style={{ marginLeft: 4 }}
        />
      </div>
      <div className="filter-tags-container" style={{ display: "flex", flexDirection: 'row' }}>
        <TagFilterGroup
          allTags={allTags}
          value={filterScheme.tagFilter}
          onChange={v => setFilterScheme({ ...filterScheme, tagFilter: v })}
          showLabel={showLabel}
        />
      </div>
      {showKeyword && <div className="filter-keyword-container">
        {showLabel && <label style={{ marginRight: 12 }}>关键字</label>}
        <input
          type="text"
          value={filterScheme.keyword}
          placeholder={showLabel ? "" : "输入关键字"}
          onChange={e => setFilterScheme({ ...filterScheme, keyword: e.target.value })}
          style={{ marginRight: 4, padding: '20px 16px', backgroundColor: 'var(--background-secondary)', border: 'none', outline: 'none' }}
        />
      </div>}
    </div>
  );
};