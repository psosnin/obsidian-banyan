import { App, WorkspaceLeaf, MarkdownView } from "obsidian";
import * as React from "react";
import { useCombineStore } from "src/store";
import { FileInfo } from "src/models/FileInfo";

const NoteContentView = ({ app, fileInfo }: { app: App, fileInfo: FileInfo }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const leaf = new (WorkspaceLeaf as any)(app);
  const settings = useCombineStore((state) => state.settings);

  React.useEffect(() => {
    const setupView = async () => {
      if (!ref.current) return;
      try {
        await (leaf as WorkspaceLeaf).openFile(fileInfo.file);
        if (!(leaf.view instanceof MarkdownView)) {
          console.log('View initialization failed', fileInfo.file.name);
          return;
        }
        await leaf.view.setState(
          { ...leaf.view.getState(), mode: 'preview' },
          { history: false }
        );
        ref.current?.empty();
        ref.current?.appendChild(leaf.containerEl);
      } catch (e) {
        console.log('Failed to open file', e, fileInfo);
      }
    };
    setupView();
  }, [fileInfo.file.path]);

  return (
    <div className="card-note-content card-note-content--full" data-font-theme={settings.fontTheme}>
      <div ref={ref} />
    </div>
  );
};

const CardNote = ({ fileInfo }: { fileInfo: FileInfo }) => {
  const plugin = useCombineStore((state) => state.plugin);
  const settings = useCombineStore((state) => state.settings);
  const app = plugin.app;

  return (
    <div className="card-note-container"
      onDoubleClick={(e) => {
        plugin.fileUtils.openFile(fileInfo.file);
        e.preventDefault();
      }}
    >
      <NoteContentView app={app} fileInfo={fileInfo} />
    </div>
  );
};

export default CardNote;
