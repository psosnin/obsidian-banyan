import * as React from "react";
import { TagFilterGroup } from "src/components/TagFilterGroup";
import { FilterScheme } from "src/models/FilterScheme";

export interface SearchViewProps {
  allTags: string[];
  filterScheme: FilterScheme;
  setFilterScheme: (fs: FilterScheme) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ allTags, filterScheme, setFilterScheme}) => {

  return (
    <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
      <div className="filter-date-container">
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
          showLabel={false}
        />
      </div>
    </div>
  );
};