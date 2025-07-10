import { App, WorkspaceLeaf, MarkdownView } from "obsidian";
import * as React from "react";
import { CardNoteMenuButton } from "./CardNoteMenu";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";
import { FileInfo } from "src/models/FileInfo";
import { createEmptySearchFilterScheme } from "src/models/FilterScheme";
import { Icon } from "src/components/Icon";

const NoteContentView = ({ app, fileInfo }: { app: App, fileInfo: FileInfo }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const leaf = new (WorkspaceLeaf as any)(app);
  const [overflow, setOverflow] = React.useState(false);

  React.useEffect(() => {
    const setupView = async () => {
      if (!ref.current) return;
      try {
        await (leaf as WorkspaceLeaf).openFile(fileInfo.file);
        if (!(leaf.view instanceof MarkdownView)) {
          console.log('视图初始化失败或类型不正确', fileInfo.file.name);
          return;
        }
        await leaf.view.setState(
          { ...leaf.view.getState(), mode: 'preview' },
          { history: false })
        ref.current?.empty();
        ref.current?.appendChild(leaf.containerEl);
      } catch (e) { console.log('打开文件失败', e, fileInfo) };
    };
    setupView();
  }, [fileInfo.file.path]);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const ele = ref.current?.querySelector('.view-content');
      if (ele) {
        setOverflow(ele.scrollHeight > 500);
      }
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={"card-note-content" + (overflow ? " card-note-content--overflow" : "")} />;
};

const BacklinksView = ({ app, fileInfo }: { app: App, fileInfo: FileInfo }) => {
  const backlinksMap = useCombineStore((state) => state.backlinksMap);
  const backlinks = backlinksMap[fileInfo.file.path] || [];
  if (backlinks.length === 0) return null;

  return (
    <div className="card-note-backlinks">
      <div className="card-note-backlinks-list">
        {backlinks.map((path) => (
          <div className="card-note-backlink-item" key={path}>
            <span className="card-note-backlink-link" onClick={() => app.workspace.openLinkText(path, '', false)}>
              <Icon name="file-symlink" size="xs" color="var(--text-muted)" className="card-note-backlink-icon" />
              {path}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CardNote = ({ fileInfo }: { fileInfo: FileInfo }) => {

  const plugin = useCombineStore((state) => state.plugin);
  const settings = useCombineStore((state) => state.settings);
  const isPinned = useCombineStore((state) => state.curScheme.pinned.includes(fileInfo.id));
  const setCurScheme = useCombineStore((state) => state.setCurScheme);
  const app = plugin.app;
  const isCreated = settings.sortType === 'created';
  const tags = fileInfo.tags;

  return (
    <div className="card-note-container" onDoubleClick={(e) => {
      plugin.fileUtils.openFile(fileInfo.file);
      e.preventDefault();
    }}>
      <div className="card-note-header">
        <div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? fileInfo.file.stat.ctime : fileInfo.file.stat.mtime).toLocaleString()}</div>
        {settings.showTitle && <div className="card-note-title"><h3>{fileInfo.file.basename}</h3></div>}
        {tags.length > 0 && <div className="card-note-tags"> {tags.map((tag) =>
          <div className="card-note-tag" key={tag} onClick={()=>{
            const fs = createEmptySearchFilterScheme();
            fs.tagFilter.or = [[tag]];
            fs.name = '#' + tag;
            setCurScheme(fs);
          }}>
            <div className="card-note-tag-content">{tag}</div>
          </div>
        )}</div>}
        <div className="card-note-more">
          <CardNoteMenuButton fileInfo={fileInfo} isPinned={isPinned} />
        </div>
      </div>
      <NoteContentView app={app} fileInfo={fileInfo} />
      <div className="card-note-footer">
        {settings.showBacklinksInCardNote && (
          <BacklinksView app={app} fileInfo={fileInfo} />
        )}
      </div>
    </div>
  );
};

export default CardNote;