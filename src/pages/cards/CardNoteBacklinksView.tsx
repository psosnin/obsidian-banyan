import { App } from "obsidian";
import { Icon } from "src/components/Icon";
import { FileInfo } from "src/models/FileInfo";
import { useCombineStore } from "src/store";
import { getFrontmatterProperty } from "src/utils/frontmatterUtils";
import * as React from "react";
import { TitleDisplayMode } from "src/models/Enum";

interface Backlink {
    path: string;
    displayTitle: string;
}

const getShortestUniquePaths = (paths: string[]): Backlink[] => {
    // 先按文件名分组
    const nameMap: { [basename: string]: string[] } = {};
    for (const path of paths) {
        const parts = path.split("/");
        const basename = parts[parts.length - 1];
        if (!nameMap[basename]) nameMap[basename] = [];
        nameMap[basename].push(path);
    }
    // 计算每个 path 的最短唯一后缀
    const result: { [path: string]: string } = {};
    for (const basename in nameMap) {
        const group = nameMap[basename];
        if (group.length === 1) {
            result[group[0]] = basename;
        } else {
            // 多个同名，逐步加前面的目录直到唯一
            const splitPaths = group.map(p => p.split("/"));
            for (let i = 1; i <= splitPaths[0].length; i++) {
                const suffixes = splitPaths.map(parts => parts.slice(-i).join("/"));
                const seen = new Set<string>();
                let allUnique = true;
                for (const s of suffixes) {
                    if (seen.has(s)) { allUnique = false; break; }
                    seen.add(s);
                }
                if (allUnique) {
                    for (let j = 0; j < group.length; j++) {
                        result[group[j]] = suffixes[j];
                    }
                    break;
                }
            }
        }
    }
    const backlinks = Object.entries(result)
        .map(([path, displayTitle]) => ({ 
            path, 
            displayTitle: displayTitle.replace(/\.md$/, ''), // 去掉md后缀
        }));
    return backlinks;
}

const getTitles = async (app: App, paths: string[], mode: TitleDisplayMode) => {
    let backlinks = getShortestUniquePaths(paths);
    if (mode === 'propertyOrNone' || mode === 'propertyThenFile') {
        backlinks = await Promise.all(backlinks.map(async (backlink) => {
            const file = app.vault.getFileByPath(backlink.path);
            if (file) {
                backlink.displayTitle = await getFrontmatterProperty(app, file) || backlink.displayTitle;
            }
            return backlink;
        }));
    }
    return backlinks;
};

const CardNoteBacklinksView = ({ app, fileInfo }: { app: App, fileInfo: FileInfo }) => {
    const backlinksMap = useCombineStore((state) => state.backlinksMap);
    const mode = useCombineStore((state) => state.settings.titleDisplayMode);
    const paths = backlinksMap[fileInfo.file.path] || [];
    const [backlinks, setBacklinks] = React.useState<Backlink[]>([]);

    React.useEffect(() => {
        const fetch = async () => {
            const res = await getTitles(app, paths, mode);
            setBacklinks(res);
        }
        fetch();
    }, [paths.join(','), app, mode]);

    if (backlinks.length === 0) return null;

    return (
        <div className="card-note-backlinks">
            <div className="card-note-backlinks-list">
                {backlinks.map(({path, displayTitle}) => (
                    <div className="card-note-backlink-item" key={path}>
                        <span className="card-note-backlink-link" onClick={() => app.workspace.openLinkText(path, '', false)}>
                            <Icon name="file-symlink" size="xs" color="var(--text-muted)" className="card-note-backlink-icon" />
                            {displayTitle}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardNoteBacklinksView;