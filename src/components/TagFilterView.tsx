import * as React from "react";
import TagInput from "src/components/TagInput";
import { TagFilter } from "src/models/TagFilter";
import { i18n } from "src/utils/i18n";

export interface TagFilterViewProps {
  allTags: string[];
  value: TagFilter;
  onChange: (value: TagFilter) => void;
  showLabel?: boolean;
}

export const TagFilterView: React.FC<TagFilterViewProps> = ({ allTags, value, onChange, showLabel = true }) => {
  // and: 多行，每行是标签数组
  // not: 最后一行，非关系
  const handleAndTagChange = (rowIdx: number, tags: string[]) => {
    const newAnd = value.or.slice();
    newAnd[rowIdx] = tags;
    onChange({ ...value, or: newAnd });
  };
  const handleAddAndRow = () => {
    onChange({ ...value, or: [...value.or, []] });
  };
  const handleRemoveAndRow = (rowIdx: number) => {
    const newAnd = value.or.slice();
    newAnd.splice(rowIdx, 1);
    onChange({ ...value, or: newAnd });
  };
  const handleNotTagChange = (tags: string[]) => {
    onChange({ ...value, not: tags });
  };

  return (
    <div className="tag-filter-view">
      {value.or.map((tags, idx) => (
        <div key={idx} className="tag-filter-row">
          {showLabel && <label className="tag-filter-label">{idx == 0 ? i18n.t('tag_group_label_include') : i18n.t('tag_group_label_or_include')}</label>}
          <div className="tag-filter-row-input">
            <TagInput
              tags={tags}
              onChange={t => handleAndTagChange(idx, t)}
              allTags={allTags}
              placeholder={idx == 0 ? i18n.t('tag_group_placeholder_include') : i18n.t('tag_group_placeholder_or_include')}
            />
          </div>
          {value.or.length > 1 && idx != 0 && (
            <button onClick={() => handleRemoveAndRow(idx)} className="tag-filter-button">-</button>
          )}
          {idx === value.or.length - 1 && (
            <button onClick={handleAddAndRow} className="tag-filter-button">+ {i18n.t('tag_group_btn_or')}</button>
          )}
        </div>
      ))}
      <div className="tag-filter-row">
        {showLabel && <label className="tag-filter-label">{i18n.t('tag_group_label_exclude')}</label>}
        <div className="tag-filter-row-input">
          <TagInput
            tags={value.not}
            onChange={handleNotTagChange}
            allTags={allTags}
            placeholder={i18n.t('tag_group_placeholder_exclude')}
          />
        </div>
      </div>
      <div className="tag-filter-notag-container">
        <label className="tag-filter-label">{i18n.t('tag_group_label_notag')}</label>
        <label>
          <input type="checkbox" className="tag-filter-checkbox" checked={value.noTag == 'unlimited'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'unlimited') return;
            onChange({ ...value, noTag: 'unlimited' });
          }} />
          <span className="tag-filter-checkbox-label">{i18n.t('tag_group_label_notag_unlimited')}</span>
        </label>
        <label>
          <input type="checkbox" className="tag-filter-checkbox" checked={value.noTag == 'include'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'include') return;
            onChange({ ...value, noTag: 'include' });
          }} />
          <span className="tag-filter-checkbox-label">{i18n.t('tag_group_label_notag_include')}</span>
        </label>
        <label>
          <input type="checkbox" className="tag-filter-checkbox" checked={value.noTag == 'exclude'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'exclude') return;
            onChange({ ...value, noTag: 'exclude' });
          }} />
          <span className="tag-filter-checkbox-label">{i18n.t('tag_group_label_notag_exclude')}</span>
        </label>
      </div>
    </div>
  );
};