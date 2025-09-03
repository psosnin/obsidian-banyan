import { createEmptyFilterScheme, DefaultFilterSchemeID, FilterScheme, getDefaultFilterScheme, SearchFilterSchemeID } from "src/models/FilterScheme";
import { ViewScheme } from "src/models/ViewScheme";
import { StateCreator } from "zustand";
import { withinDateRange } from "src/models/DateRange";
import { CombineState } from ".";
import { FileInfo } from "src/models/FileInfo";
import { isOKWithTagFilter } from "src/models/TagFilter";

export interface DashBoardState {
    allFiles: FileInfo[];
    allTags: string[];
    curSchemeFiles: FileInfo[];
    curScheme: FilterScheme | ViewScheme;
    displayFiles: FileInfo[];

    setCurScheme: (scheme: FilterScheme | ViewScheme) => void;
    requestData: () => Promise<void>;
    updateDisplayFiles: (endIndex: number) => void;
    pinFile: (f: FileInfo, isPinned: boolean) => void;

    needRefresh: boolean;
    editingFilesID: number[];
    hasEditingFiles: () => boolean;
    addEditingFile: (id: number) => void;
    deleteEditingFile: (id: number) => void;
    resetEditingFiles: () => void;
}

export const useDashBoardStore: StateCreator<CombineState, [], [], DashBoardState> = (set, get) => ({

    sortType: 'created',
    allFiles: [],
    allTags: [],
    curSchemeFiles: [],
    curScheme: createEmptyFilterScheme(),
    displayFiles: [],

    setCurScheme(scheme: FilterScheme | ViewScheme) {
        set({ curScheme: scheme });
    },
    requestData: async () => {
        const plugin = get().plugin;
        const settings = get().settings;
        const sortType = settings.sortType;
        const randomBrowse = settings.randomBrowse;
        const allFiles = plugin.fileUtils.getAllFiles();
        const allTags = plugin.fileUtils.getAllFilesTags();
        const curScheme = get().curScheme;
        let filtered = allFiles;
        if (curScheme.type == 'FilterScheme') {
            // date range
            filtered = filtered.filter(({file}) => {
                const timeToCheck = (sortType === 'created' || sortType === 'earliestCreated') ? file.stat.ctime : file.stat.mtime;
                return withinDateRange(timeToCheck, curScheme.dateRange);
            });
            // key word
            if (curScheme.keyword.trim().length > 0) {
                const keyword = curScheme.keyword.trim().toLowerCase();
                const allLoadedContents = await Promise.all(filtered.map(async (fileInfo) => {
                    let content = await plugin.fileUtils.readCachedFileContent(fileInfo.file);
                    content = stripMarkdown(content);
                    return { fileInfo, content };
                }));
                filtered = allLoadedContents
                    .filter(({ content, fileInfo }) => content.toLowerCase().includes(keyword) || fileInfo.file.basename.toLowerCase().includes(keyword))
                    .map(({ fileInfo }) => fileInfo);
            }
            // tag filter
            filtered = filtered.filter((fileInfo) => {
                return isOKWithTagFilter(fileInfo.tags, curScheme.tagFilter);
            });
        } else if (curScheme.type == 'ViewScheme') {
            filtered = filtered.filter(fileInfo => curScheme.files.includes(fileInfo.id));
        }
        
        // 根据乱序浏览设置决定排序方式
        if (randomBrowse) {
            // 打乱数组顺序
            filtered.sort(() => Math.random() - 0.5);
        } else {
            // 按排序类型排序
            filtered.sort((a, b) => {
                switch (sortType) {
                    case 'created':
                        return b.file.stat.ctime - a.file.stat.ctime; // 最近创建
                    case 'modified':
                        return b.file.stat.mtime - a.file.stat.mtime; // 最近更新
                    case 'earliestCreated':
                        return a.file.stat.ctime - b.file.stat.ctime; // 最早创建
                    case 'earliestModified':
                        return a.file.stat.mtime - b.file.stat.mtime; // 最早更新
                    default:
                        return b.file.stat.ctime - a.file.stat.ctime;
                }
            });
        }
        set({ allFiles, allTags, curSchemeFiles: filtered });
    },
    updateDisplayFiles: (endIndex: number) => {
        const curScheme = get().curScheme;
        const curSchemeFiles = get().curSchemeFiles;
        const files = curSchemeFiles.slice(0, endIndex);
        const displayFiles = files
            .filter((f) => curScheme.pinned.includes(f.id))
            .concat(files.filter((f) => !curScheme.pinned.includes(f.id)));
        set({ displayFiles });
    },
    pinFile: (f: FileInfo, isPinned: boolean) => {
        const curScheme = get().curScheme;
        const viewSchemes = get().viewSchemes;
        const filterSchemes = get().filterSchemes;
        const newPinned = [...curScheme.pinned.filter(p => p !== f.id)].concat(isPinned ? [f.id] : []);
        const newScheme = { ...curScheme, pinned: newPinned };
        set({ curScheme: newScheme });
        if (newScheme.type === 'ViewScheme') {
            const newSchemes = viewSchemes.map(scheme => scheme.id == newScheme.id ? newScheme : scheme);
            get().updateViewSchemeList(newSchemes);
        } else {
            const newSchemes = filterSchemes.map(scheme => {
                if (scheme.id == newScheme.id) return newScheme;
                if (newScheme.id == SearchFilterSchemeID && scheme.id == DefaultFilterSchemeID) { // 「搜索」的置顶其实要给到「默认」
                    return { ...getDefaultFilterScheme(filterSchemes), pinned: newPinned };
                }
                return scheme;
            });
            get().updateFilterSchemeList(newSchemes);
        }
    },

    needRefresh: false,
    editingFilesID: [],
    hasEditingFiles: () => get().editingFilesID.length > 0,
    addEditingFile: (id: number) => set(state => ({ editingFilesID: [...state.editingFilesID, id] })),
    deleteEditingFile: (id: number) => {
        const res = get().editingFilesID.filter(i => i !== id);
        set({ editingFilesID: res });
        if (res.length === 0) {
            set({ needRefresh: true });
        }
    },
    resetEditingFiles: () => set({ editingFilesID: [], needRefresh: false }),
});

const stripMarkdown = (mdStr: string) => {
    return mdStr
      .replace(/(\*\*\*|__)(.*?)\1/g, '$2')  // 着重
      .replace(/(\*\*|__)(.*?)\1/g, '$2')    // 加粗
      .replace(/(\*|_)(.*?)\1/g, '$2')       // 斜体
      .replace(/(==|__)(.*?)\1/g, '$2')      // 高亮
      .replace(/~~(.*?)~~/g, '$1')           // 删除线
      .replace(/`(.*?)`/g, '$1')             // 行内代码
      .replace(/!?$$(.*?)$$$.*?$/g, '$1')    // 链接和图片
      .replace(/^#+\s+/gm, '');              // 标题
  }