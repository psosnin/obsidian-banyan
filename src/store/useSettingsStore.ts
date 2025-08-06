import { BanyanPluginSettings } from "src/BanyanPluginSettings";
import { StateCreator } from "zustand";
import { CombineState } from ".";
import { CardContentMaxHeightType, SortType, TitleDisplayMode } from "src/models/Enum";

export interface SettingsState {
    settings: BanyanPluginSettings;

    // 设置更新方法
    updateSettings: (settings: Partial<BanyanPluginSettings>) => void;
    
    // 单个设置项的更新方法
    updateCardsDirectory: (directory: string) => void;
    updateOpenWhenStartObsidian: (open: boolean) => void;
    updateTitleDisplayMode: (mode: TitleDisplayMode) => void;
    updateEditorTitleMode: (mode: 'none' | 'filename' | 'property') => void;
    updateCardsColumns: (columns: number) => void;
    updateSortType: (sortType: SortType) => void;
    updateFirstUseDate: (date: string) => void;
    updateRandomNoteTagFilter: (tagFilter: any) => void;
    updateShowBacklinksInCardNote: (show: boolean) => void;
    updateUseCardNote2: (use: boolean) => void; // 新增
    updateRandomBrowse: (randomBrowse: boolean) => void; // 新增：乱序浏览开关
    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => void; // 新增：卡片内容最大高度
}

export const useSettingsStore: StateCreator<CombineState, [], [], SettingsState> = (set, get) => ({
    settings: {} as BanyanPluginSettings,

    updateSettings: (newSettings: Partial<BanyanPluginSettings>) => {
        const plugin = get().plugin;
        const updatedSettings = { ...plugin.settings, ...newSettings };
        plugin.settings = updatedSettings;
        plugin.saveSettings();
        set({ settings: updatedSettings });
    },

    updateCardsDirectory: (directory: string) => {
        get().updateSettings({ cardsDirectory: directory });
    },

    updateOpenWhenStartObsidian: (open: boolean) => {
        get().updateSettings({ openWhenStartObsidian: open });
    },

    updateTitleDisplayMode: (mode: TitleDisplayMode) => {
        get().updateSettings({ titleDisplayMode: mode });
    },

    updateEditorTitleMode: (mode: 'none' | 'filename' | 'property') => {
        get().updateSettings({ editorTitleMode: mode });
    },

    updateCardsColumns: (columns: number) => {
        get().updateSettings({ cardsColumns: columns });
    },

    updateSortType: (sortType: SortType) => {
        get().updateSettings({ sortType });
    },

    updateFirstUseDate: (date: string) => {
        get().updateSettings({ firstUseDate: date });
    },

    updateRandomNoteTagFilter: (tagFilter: any) => {
        get().updateSettings({ randomNoteTagFilter: tagFilter });
    },

    updateShowBacklinksInCardNote: (show: boolean) => {
        get().updateSettings({ showBacklinksInCardNote: show });
    },
    updateUseCardNote2: (use: boolean) => {
        get().updateSettings({ useCardNote2: use });
    },
    updateRandomBrowse: (randomBrowse: boolean) => {
        get().updateSettings({ randomBrowse });
    },
    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => {
        get().updateSettings({ cardContentMaxHeight: height });
    },
}); 