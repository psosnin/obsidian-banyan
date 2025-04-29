import * as React from "react";
import TagInput from "src/components/TagInput";

export type TagFilterGroupValue = {
  or: string[][]; // 多行，每行多个标签，行内为且
  not: string[];   // 非关系标签
};

export interface TagFilterGroupProps {
  allTags: string[];
  value: TagFilterGroupValue;
  onChange: (value: TagFilterGroupValue) => void;
}

export const TagFilterGroup: React.FC<TagFilterGroupProps> = ({ allTags, value, onChange }) => {
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
          <label style={{ marginRight: 4 }}>{idx == 0 ? "包含" : "或含"}</label>
          <TagInput
            tags={tags}
            onChange={t => handleAndTagChange(idx, t)}
            allTags={allTags}
            placeholder={"输入标签"}
          />
          {value.or.length > 1 && idx != 0 && (
            <button onClick={() => handleRemoveAndRow(idx)} style={{ marginLeft: 2, padding: '0px 12px' }}>-</button>
          )}
          {idx === value.or.length - 1 && (
            <button onClick={handleAddAndRow} style={{ marginLeft: 2, padding: '0px 12px' }}>+ 或</button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ marginRight: 4 }}>不含</label>
        <TagInput
          tags={value.not}
          onChange={handleNotTagChange}
          allTags={allTags}
          placeholder={"输入标签"}
        />
      </div>
    </div>
  );
};