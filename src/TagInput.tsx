import { useRef, useState } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, suggestions = [], placeholder }) => {
  const [input, setInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    tag => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag)
  );

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
    setShowSuggest(false);
    setHighlight(-1);
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggest(true);
    setHighlight(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      if (highlight >= 0 && filtered[highlight]) {
        addTag(filtered[highlight]);
      } else {
        addTag(input.trim());
      }
      e.preventDefault();
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 40, padding: '4px 8px', border: '2px solid #5a4fff', borderRadius: 10, background: '#fff', flexWrap: 'wrap', gap: 4, position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flex: 1, gap: 4 }}>
        {value.map((tag, idx) => (
          <span key={tag} style={{ background: '#f6f6f6', color: '#222', borderRadius: 6, padding: '2px 8px', marginRight: 2, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 400, boxShadow: '0 1px 2px #eee', height: 28 }}>
            {tag}
            <span style={{ marginLeft: 4, cursor: 'pointer', fontSize: 16, opacity: 0.5 }} onClick={() => removeTag(idx)}>&times;</span>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder || "输入标签..."}
          style={{ flex: 1, minWidth: 40, background: 'transparent', border: 'none', outline: 'none', color: '#222', fontSize: 16, fontWeight: 400, height: 28, padding: 0, margin: 0 }}
        />
      </div>
      {showSuggest && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: 36, left: 8, background: '#fff', color: '#222', border: '1px solid #5a4fff', borderRadius: 6, boxShadow: '0 2px 8px #eee', zIndex: 10, minWidth: 120 }}>
          {filtered.map((tag, idx) => (
            <div
              key={tag}
              style={{ padding: '8px 16px', background: highlight === idx ? '#e6eaff' : 'transparent', cursor: 'pointer', fontSize: 16 }}
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