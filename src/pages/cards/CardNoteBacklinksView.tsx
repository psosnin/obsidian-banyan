import { App } from "obsidian";
import { Icon } from "src/components/Icon";
import { FileInfo } from "src/models/FileInfo";
import { useCombineStore } from "src/store";

const CardNoteBacklinksView = ({ app, fileInfo }: { app: App, fileInfo: FileInfo }) => {
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

export default CardNoteBacklinksView;