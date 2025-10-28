import * as React from "react";
import { TagFilterView } from "src/components/TagFilterView";
import { FilterScheme } from "src/models/FilterScheme";

export interface SearchViewProps {
  allTags: string[];
  filterScheme: FilterScheme;
  setFilterScheme: (fs: FilterScheme) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ allTags, filterScheme, setFilterScheme}) => {

  return (
    <div className="search-view-container">
      <div className="search-view-date-container">
        <input
          type="date"
          value={filterScheme.dateRange.from}
          onChange={e => setFilterScheme({...filterScheme, dateRange: { from: e.target.value, to: filterScheme.dateRange.to  }})}
        />
        <span> - </span>
        <input
          type="date"
          value={filterScheme.dateRange.to}
          onChange={e => setFilterScheme({...filterScheme, dateRange: { to: e.target.value, from: filterScheme.dateRange.from }})}
        />
      </div>
      <div className="search-view-tags-container">
        <TagFilterView
          allTags={allTags}
          value={filterScheme.tagFilter}
          onChange={v => setFilterScheme({...filterScheme, tagFilter: v})}
          showLabel={false}
        />
      </div>
    </div>
  );
};