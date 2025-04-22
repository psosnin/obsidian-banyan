import * as React from "react";
import { TagFilterGroup } from "./TagFilterGroup";

export interface FilterViewProps {
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
        <label style={{ marginRight: 12 }}>日期</label>
        <input
          type="date"
          value={props.dateRange.from}
          onChange={e => props.setDateRange({ ...props.dateRange, from: e.target.value })}
          style={{ marginRight: 4 }}
        />
        <span> - </span>
        <input
          type="date"
          value={props.dateRange.to}
          onChange={e => props.setDateRange({ ...props.dateRange, to: e.target.value })}
          style={{ marginLeft: 4 }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: 'row' }}>
        <TagFilterGroup
          allTags={props.allTags}
          value={props.tagFilterValue}
          onChange={props.setTagFilterValue}
        />
      </div>
    </div>
  );
};