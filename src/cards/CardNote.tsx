import { TFile, App, WorkspaceLeaf, MarkdownView } from "obsidian";
import * as React from "react";
import { openCardNoteMoreMenu } from "./CardNoteMenu";
import { Icon } from "../components/Icon";

interface CardNoteProps {
  file: TFile;
  sortType: 'created' | 'modified';
  tags: string[];
  app: App;
  onDelete: (file: TFile) => void;
  onOpen: (file: TFile) => void;
  setPin: (file: TFile, isPinned: boolean) => void;
  isPinned: boolean;
  onImportToView: (file: TFile) => void;
  isInView: boolean;
  onRemoveFromView: (file: TFile) => void;
}

const NoteContentView = ({ app, file }: { app: App, file: TFile }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const leaf = new (WorkspaceLeaf as any)(app);
  const [overflow, setOverflow] = React.useState(false);

  React.useEffect(() => {
    const setupView = async () => {
      if (!ref.current) return;
      try {
        await (leaf as WorkspaceLeaf).openFile(file)
        if (!(leaf.view instanceof MarkdownView)) {
          console.log('视图初始化失败或类型不正确', file.name);
          return;
        }
        // await leaf.view.setState(
        //   { ...leaf.view.getState(), mode: 'preview' },
        //   { history: false })
        ref.current.empty();
        ref.current.appendChild(leaf.containerEl); // 放这里也OK
      } catch (e) { console.log('打开文件失败', e, file) };
    };
    setupView();
  }, [file.path]);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const ele = ref.current?.querySelector('.view-content');
      if (ele) {
        if (overflow && ele.scrollHeight <= 500) {
          setOverflow(false);
        }
        if (!overflow && ele.scrollHeight > 500) {
          setOverflow(true);
        }
      }
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={"card-note-content" + (overflow ? " card-note-content--overflow" : "")} />;
};

const CardNote: React.FC<CardNoteProps> = ({
  file, tags, sortType, app, isPinned, isInView,
  onDelete, onOpen, setPin, onImportToView, onRemoveFromView
}) => {
  const isCreated = sortType === 'created';

  return (
    <div className="card-note-container" onDoubleClick={(e) => {
      onOpen(file);
      e.preventDefault();
    }}>
      <div className="card-note-header">
        <div className="card-note-time">{isPinned ? "置顶 · " : ""}{isCreated ? "创建于" : "更新于"} {new Date(isCreated ? file.stat.ctime : file.stat.mtime).toLocaleString()}</div>
        {tags.length > 0 && <div className="card-note-tags"> {tags.map((tag) =>
          <div className="card-note-tag" key={tag}>
            <div className="card-note-tag-content">{tag}</div>
          </div>
        )}</div>}
        <div className="card-note-more">
          <button className="clickable-icon"
            children={<Icon name='ellipsis' />}
            onClick={(e) => openCardNoteMoreMenu({
              event: e.nativeEvent, file, isInView, isPinned,
              onOpen, onDelete, setPin, onImportToView, onRemoveFromView
            })}
          />
        </div>
      </div>
      <NoteContentView app={app} file={file} />
    </div>
  );
};

export default CardNote;