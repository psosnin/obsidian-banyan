import * as React from "react";
import { TagFilterView } from "../../../components/TagFilterView";
import { FilterScheme } from "src/models/FilterScheme";
import { Platform } from "obsidian";
import { i18n } from "src/utils/i18n";

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
    <div className="filter-view-container">
      {showName && <div className="filter-name-container" >
        {showLabel && <label className="filter-view-label-margin">{i18n.t('filter_scheme_name_label')}</label>}
        <input
          type="text"
          value={filterScheme.name}
          placeholder={showLabel ? "" : i18n.t('filter_scheme_name_placeholder')}
          onChange={e => setFilterScheme({ ...filterScheme, name: e.target.value })}
        />
      </div>}
      <div className="filter-date-container">
        {showLabel && <label className="filter-view-label-margin">{i18n.t('filter_scheme_date_label')}</label>}
        <input
          type="date"
          value={filterScheme.dateRange.from}
          onChange={e => setFilterScheme({ ...filterScheme, dateRange: { from: e.target.value, to: filterScheme.dateRange.to } })}
        />
        <span> - </span>
        <input
          type="date"
          value={filterScheme.dateRange.to}
          onChange={e => setFilterScheme({ ...filterScheme, dateRange: { to: e.target.value, from: filterScheme.dateRange.from } })}
        />
      </div>
      <div className="filter-tags-container">
        <TagFilterView
          allTags={allTags}
          value={filterScheme.tagFilter}
          onChange={v => setFilterScheme({ ...filterScheme, tagFilter: v })}
          showLabel={showLabel}
        />
      </div>
      {showKeyword && <div className="filter-keyword-container">
        {showLabel && <label className="filter-view-label-margin">{i18n.t('filter_scheme_keyword_label')}</label>}
        <input
          type="text"
          value={filterScheme.keyword}
          placeholder={showLabel ? "" : i18n.t('filter_scheme_keyword_placeholder')}
          onChange={e => setFilterScheme({ ...filterScheme, keyword: e.target.value })}
        />
      </div>}
    </div>
  );
};