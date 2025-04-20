
import TagInput from "./TagInput";

interface CardAddFormProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  onAdd: () => void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
  tagSuggestions?: string[];
}

const CardAddForm: React.FC<CardAddFormProps> = ({ inputValue, setInputValue, onAdd, tags = [], setTags = () => {}, tagSuggestions = [] }) => {
  return (
    <div style={{marginBottom:24}}>
      <textarea
        value={inputValue}
        onChange={e=>setInputValue(e.target.value)}
        placeholder="输入卡片内容..."
        style={{flex:1,minHeight:80,maxHeight:80,borderRadius:6,padding:8,border:'1px solid #444',background:'#181818',color:'#fff',width:'100%',marginBottom:8}}
      />
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={tagSuggestions}
          placeholder="输入标签..."
        />
        <button onClick={onAdd} style={{padding:'8px 16px',borderRadius:6,background:'#3a6',color:'#fff',border:'none',whiteSpace:'nowrap'}}>保存</button>
      </div>
    </div>
  );
};

export default CardAddForm;