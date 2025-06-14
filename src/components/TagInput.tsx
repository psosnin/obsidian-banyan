import { useState, useRef, useLayoutEffect } from "react";
import { Notice } from "obsidian";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  allTags: string[];
  placeholder?: string;
  allowCreate?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, allTags, placeholder, allowCreate = false }) => {

  const [input, setInput] = useState("");

  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);
  const [suggestTop, setSuggestTop] = useState<number>(0);

  useLayoutEffect(() => {
    if (inputRef.current) {
      setSuggestTop(inputRef.current.offsetTop + inputRef.current.offsetHeight + 12);
    }
  }, [tags.length, input, showSuggest]);

  const filtered = allTags.filter(
    tag => tag.toLowerCase().includes(input.toLowerCase()) && !tags.includes(tag)
  );

  const addTag = (tag: string) => {
    if (tag && tag.length > 0) {
      if (tags.includes(tag)) {
        new Notice("该标签已添加");
      } else if (!allowCreate && !allTags.includes(tag)) {
        new Notice("只能选择已有标签");
      } else {
        onChange([...tags, tag]);
      }
    }
    setInput("");
    setShowSuggest(false);
    setHighlight(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      if (highlight >= 0 && filtered[highlight]) {
        addTag(filtered[highlight]);
      } else {
        addTag(input.trim());
      }
      e.preventDefault();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      handleRemoveTag(tags.length - 1);
    } else if (e.key === "ArrowDown") {
      setHighlight(h => Math.min(filtered.length - 1, h + 1));
      setShowSuggest(true);
    } else if (e.key === "ArrowUp") {
      setHighlight(h => Math.max(0, h - 1));
      setShowSuggest(true);
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setHighlight(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggest(false), 100);
  };

  const handleRemoveTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-inputarea">
        {tags.map((tag, idx) => (
          <span key={tag} className="tag-input-tag">
            {tag}
            <span className="tag-input-tag-remove-btn" onClick={() => handleRemoveTag(idx)}>&times;</span>
          </span>
        ))}
        <input
          type="text"
          value={input}
          ref={inputRef}
          onChange={e => { handleInputChange(e); setShowSuggest(true); setHighlight(-1); }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => { setShowSuggest(true); setHighlight(-1); }}
          placeholder={placeholder}
        />
      </div>
      {showSuggest && filtered.length > 0 && (
        <div
          className="tag-input-suggest"
          ref={suggestRef}
          style={{ top: suggestTop }}
        >
          {filtered.map((tag, idx) => (
            <div
              className={"tag-input-suggest-item " + (highlight === idx ? 'tag-input-suggest-item-bg-highlight' : 'tag-input-suggest-item-bg-normal')}
              key={tag}
              onMouseDown={() => addTag(tag)}
              onMouseEnter={() => setHighlight(idx)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;