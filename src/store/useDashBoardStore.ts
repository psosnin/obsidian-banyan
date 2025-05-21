import { TFile } from "obsidian";
import { getHeatmapValues } from "src/components/Heatmap";
import { createEmptyFilterScheme, DefaultFilterSchemeID, FilterScheme, getDefaultFilterScheme, SearchFilterSchemeID } from "src/models/FilterScheme";
import { ViewScheme } from "src/models/ViewScheme";
import { StateCreator } from "zustand";
import { withinDateRange } from "src/models/DateRange";
import { CombineState } from ".";

export interface DashBoardState {
    allFiles: TFile[];
    allTags: string[];
    curSchemeFiles: TFile[];
    curScheme: FilterScheme | ViewScheme;
    displayFiles: TFile[];

    setCurScheme: (scheme: FilterScheme | ViewScheme) => void;
    requestData: () => Promise<void>;
    updateDisplayFiles: (endIndex: number) => void;
    pinFile: (file: TFile, isPinned: boolean) => void;

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
            filtered = filtered.filter((file: TFile) => withinDateRange(sortType == 'created' ? file.stat.ctime : file.stat.mtime, curScheme.dateRange));
            // key word
            if (curScheme.keyword.trim().length > 0) {
                const keyword = curScheme.keyword.trim().toLowerCase();
                const allLoadedContents = await Promise.all(filtered.map(async (file: TFile) => {
                    const content = await plugin.fileUtils.readCachedFileContent(file);
                    return { file, content };
                }));
                filtered = allLoadedContents.filter(({ content }) => content.toLowerCase().includes(keyword)).map(({ file }) => file);
            }
            // tag filter
            filtered = filtered.filter((file) => {
                return file.isOKWithTagFilter(plugin.app, curScheme.tagFilter);
            });
        } else if (curScheme.type == 'ViewScheme') {
            filtered = filtered.filter((file: TFile) => curScheme.files.includes(file.getID()));
        }
        filtered.sort((a, b) => sortType === 'created' ? b.stat.ctime - a.stat.ctime : b.stat.mtime - a.stat.mtime);
        set({ allFiles, allTags, curSchemeFiles: filtered });
    },
    updateDisplayFiles: (endIndex: number) => {
        const curScheme = get().curScheme;
        const curSchemeFiles = get().curSchemeFiles;
        const files = curSchemeFiles.slice(0, endIndex);
        const displayFiles = files
            .filter((file) => curScheme.pinned.includes(file.getID()))
            .concat(files.filter((file) => !curScheme.pinned.includes(file.getID())));
        set({ displayFiles });
    },
    pinFile: (file: TFile, isPinned: boolean) => {
        const curScheme = get().curScheme;
        const viewSchemes = get().viewSchemes;
        const filterSchemes = get().filterSchemes;
        const fileId = file.getID();
        const newPinned = [...curScheme.pinned.filter(p => p !== fileId)].concat(isPinned ? [fileId] : []);
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