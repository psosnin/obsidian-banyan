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
        const sortType = plugin.settings.sortType;
        const allFiles = plugin.fileUtils.getAllFiles();
        const allTags = plugin.fileUtils.getAllFilesTags();
        const curScheme = get().curScheme;
        let filtered = allFiles;
        if (curScheme.type == 'FilterScheme') {
            // date range
            filtered = filtered.filter(({file}) => withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, curScheme.dateRange));
            // key word
            if (curScheme.keyword.trim().length > 0) {
                const keyword = curScheme.keyword.trim().toLowerCase();
                const allLoadedContents = await Promise.all(filtered.map(async (fileInfo) => {
                    const content = await plugin.fileUtils.readCachedFileContent(fileInfo.file);
                    return { fileInfo, content };
                }));
                filtered = allLoadedContents.filter(({ content }) => content.toLowerCase().includes(keyword)).map(({ fileInfo }) => fileInfo);
            }
            // tag filter
            filtered = filtered.filter((fileInfo) => {
                return isOKWithTagFilter(fileInfo.tags, curScheme.tagFilter);
            });
        } else if (curScheme.type == 'ViewScheme') {
            filtered = filtered.filter(fileInfo => curScheme.files.includes(fileInfo.id));
        }
        filtered.sort((a, b) => sortType === 'created' ? b.file.stat.ctime - a.file.stat.ctime : b.file.stat.mtime - a.file.stat.mtime);
        // console.log('requestData', allFiles.length, filtered.length);
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
});