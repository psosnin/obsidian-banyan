import { App, WorkspaceLeaf, MarkdownView, Platform } from "obsidian";
import * as React from "react";
import { CardNoteMenuButton, openCardNoteMoreMenu } from "./CardNoteMenu";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";
import { FileInfo } from "src/models/FileInfo";
import { createEmptySearchFilterScheme } from "src/models/FilterScheme";
import CardNoteBacklinksView from "./CardNoteBacklinksView";
import { getDisplayTitle } from "src/utils/frontmatterUtils";

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

const CardNote = ({ fileInfo }: { fileInfo: FileInfo }) => {

  const plugin = useCombineStore((state) => state.plugin);
  const settings = useCombineStore((state) => state.settings);
  const isPinned = useCombineStore((state) => state.curScheme.pinned.includes(fileInfo.id));
  const setCurScheme = useCombineStore((state) => state.setCurScheme);
  const app = plugin.app;
  const isCreated = settings.sortType === 'created';
  const tags = fileInfo.tags;
  const [displayTitle, setDisplayTitle] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTitle = async () => {
      const title = await getDisplayTitle(app, fileInfo.file, settings.titleDisplayMode);
      setDisplayTitle(title);
    };
    loadTitle();
  }, [app, fileInfo.file, settings.titleDisplayMode]);

  return (
    <div className="card-note-container"
      onDoubleClick={(e) => {
        plugin.fileUtils.openFile(fileInfo.file);
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        if (!Platform.isMobile) {
          e.preventDefault();
          openCardNoteMoreMenu({ event: e.nativeEvent, fileInfo, isPinned });
        }
      }}
    >
      <div className="card-note-header">
        <div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? fileInfo.file.stat.ctime : fileInfo.file.stat.mtime).toLocaleString()}</div>
        {displayTitle && <div className="card-note-title"><h3>{displayTitle}</h3></div>}
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
          <CardNoteBacklinksView app={app} fileInfo={fileInfo} />
        )}
      </div>
    </div>
  );
};

export default CardNote;