import * as React from "react";

export type TagFilterGroupValue = {
  and: string[][]; // 多行，每行多个标签，行内为且
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
    const newAnd = value.and.slice();
    newAnd[rowIdx] = tags;
    onChange({ ...value, and: newAnd });
  };
  const handleAddAndRow = () => {
    onChange({ ...value, and: [...value.and, []] });
  };
  const handleRemoveAndRow = (rowIdx: number) => {
    const newAnd = value.and.slice();
    newAnd.splice(rowIdx, 1);
    onChange({ ...value, and: newAnd });
  };
  const handleNotTagChange = (tags: string[]) => {
    onChange({ ...value, not: tags });
  };

  // 标签输入支持自由输入和下拉选择
  const TagInput = ({ tags, onChange, allTags, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; allTags: string[]; placeholder?: string }) => {
    const [input, setInput] = React.useState("");
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === ",") && input.trim()) {
        if (!tags.includes(input.trim())) {
          onChange([...tags, input.trim()]);
        }
        setInput("");
        e.preventDefault();
      } else if (e.key === "Backspace" && !input && tags.length > 0) {
        onChange(tags.slice(0, tags.length - 1));
      }
    };
    const handleRemoveTag = (idx: number) => {
      onChange(tags.filter((_, i) => i !== idx));
    };
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInput("");
    };
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
        {tags.map((tag, idx) => (
          <span key={tag} style={{ background: "#eee", borderRadius: 4, padding: "2px 6px", marginRight: 2, display: "flex", alignItems: "center" }}>
            {tag}
            <span style={{ marginLeft: 4, cursor: "pointer" }} onClick={() => handleRemoveTag(idx)}>&times;</span>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          style={{ minWidth: 60, border: "none", outline: "none", background: "transparent" }}
        />
        <select value="" onChange={handleSelect} style={{ minWidth: 40 }}>
          <option value="">选择标签</option>
          {allTags.filter(tag => !tags.includes(tag)).map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {value.and.map((tags, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagInput
            tags={tags}
            onChange={t => handleAndTagChange(idx, t)}
            allTags={allTags}
            placeholder={"输入标签（且）"}
          />
          <span style={{ margin: "0 4px" }}>{idx < value.and.length - 1 ? "或" : ""}</span>
          {value.and.length > 1 && (
            <button onClick={() => handleRemoveAndRow(idx)} style={{ marginLeft: 2 }}>-</button>
          )}
          {idx === value.and.length - 1 && (
            <button onClick={handleAddAndRow} style={{ marginLeft: 2 }}>+</button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TagInput
          tags={value.not}
          onChange={handleNotTagChange}
          allTags={allTags}
          placeholder={"输入标签（非）"}
        />
        <span style={{ margin: "0 4px" }}>非</span>
      </div>
    </div>
  );
};