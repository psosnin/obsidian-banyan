import * as React from "react";
import { TagFilterGroup } from "./TagFilterGroup";
import { FilterScheme } from "./SideBarContent";

export interface FilterViewProps {
  allTags: string[];
  filterScheme: FilterScheme;
  setFilterScheme: (fs: FilterScheme) => void;
}

export const FilterView: React.FC<FilterViewProps> = (props) => {
  const { allTags, filterScheme, setFilterScheme } = props;
  return (
    <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
      <div className="filter-name-container">
      <label style={{ marginRight: 12 }}>名称</label>
        <input
          type="text"
          value={filterScheme.name}
          onChange={e => setFilterScheme({...filterScheme, name: e.target.value})}
          style={{ marginRight: 4 }}
        />
      </div>
      <div className="filter-date-container">
        <label style={{ marginRight: 12 }}>日期</label>
        <input
          type="date"
          value={filterScheme.dateRange.from}
          onChange={e => setFilterScheme({...filterScheme, dateRange: { from: e.target.value, to: filterScheme.dateRange.to  }})}
          style={{ marginRight: 4 }}
        />
        <span> - </span>
        <input
          type="date"
          value={filterScheme.dateRange.to}
          onChange={e => setFilterScheme({...filterScheme, dateRange: { to: e.target.value, from: filterScheme.dateRange.from }})}
          style={{ marginLeft: 4 }}
        />
      </div>
      <div className="filter-tags-container" style={{ display: "flex", flexDirection: 'row' }}>
        <TagFilterGroup
          allTags={allTags}
          value={filterScheme.tagFilter}
          onChange={v => setFilterScheme({...filterScheme, tagFilter: v})}
        />
      </div>
      <div className="filter-keyword-container">
      <label style={{ marginRight: 12 }}>关键词</label>
        <input
          type="text"
          value={filterScheme.keyword}
          onChange={e => setFilterScheme({...filterScheme, keyword: e.target.value})}
          style={{ marginRight: 4 }}
        />
      </div>
    </div>
  );
};