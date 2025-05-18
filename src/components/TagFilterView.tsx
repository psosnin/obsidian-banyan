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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {value.or.map((tags, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showLabel && <label style={{ marginRight: 4 }}>{idx == 0 ? i18n.t('tag_group_label_include') : i18n.t('tag_group_label_or_include')}</label>}
          <TagInput
            tags={tags}
            onChange={t => handleAndTagChange(idx, t)}
            allTags={allTags}
            placeholder={idx == 0 ? i18n.t('tag_group_placeholder_include') : i18n.t('tag_group_placeholder_or_include')}
          />
          {value.or.length > 1 && idx != 0 && (
            <button onClick={() => handleRemoveAndRow(idx)} style={{ marginLeft: 2, padding: '0px 12px' }}>-</button>
          )}
          {idx === value.or.length - 1 && (
            <button onClick={handleAddAndRow} style={{ marginLeft: 2, padding: '0px 12px' }}>+ {i18n.t('tag_group_btn_or')}</button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showLabel && <label style={{ marginRight: 4 }}>{i18n.t('tag_group_label_exclude')}</label>}
        <TagInput
          tags={value.not}
          onChange={handleNotTagChange}
          allTags={allTags}
          placeholder={i18n.t('tag_group_placeholder_exclude')}
        />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingTop: 6 }}>
        <label>{i18n.t('tag_group_label_notag')}</label>
        <label>
          <input type="checkbox" style={{ verticalAlign: 'middle' }} checked={value.noTag == 'unlimited'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'unlimited') return;
            onChange({ ...value, noTag: 'unlimited' });
          }} />
          <span style={{ marginLeft: 4 }}>{i18n.t('tag_group_label_notag_unlimited')}</span>
        </label>
        <label>
          <input type="checkbox" style={{ verticalAlign: 'middle' }} checked={value.noTag == 'include'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'include') return;
            onChange({ ...value, noTag: 'include' });
          }} />
          <span style={{ marginLeft: 4 }}>{i18n.t('tag_group_label_notag_include')}</span>
        </label>
        <label>
          <input type="checkbox" style={{ verticalAlign: 'middle' }} checked={value.noTag == 'exclude'} onChange={(e) => {
            if (!e.target.checked || value.noTag == 'exclude') return;
            onChange({ ...value, noTag: 'exclude' });
          }} />
          <span style={{ marginLeft: 4 }}>{i18n.t('tag_group_label_notag_exclude')}</span>
        </label>
      </div>
    </div>
  );
};