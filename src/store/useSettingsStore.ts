import { BanyanPluginSettings } from "src/BanyanPluginSettings";
import { StateCreator } from "zustand";
import { CombineState } from ".";

export interface SettingsState {
    settings: BanyanPluginSettings;

    // 设置更新方法
    updateSettings: (settings: Partial<BanyanPluginSettings>) => void;
    
    // 单个设置项的更新方法
    updateCardsDirectory: (directory: string) => void;
    updateOpenWhenStartObsidian: (open: boolean) => void;
    updateShowTitle: (show: boolean) => void;
    updateCardsColumns: (columns: number) => void;
    updateSortType: (sortType: 'created' | 'modified') => void;
    updateFirstUseDate: (date: string) => void;
    updateRandomNoteTagFilter: (tagFilter: any) => void;
    updateShowBacklinksInCardNote: (show: boolean) => void;
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

    updateShowTitle: (show: boolean) => {
        get().updateSettings({ showTitle: show });
    },

    updateCardsColumns: (columns: number) => {
        get().updateSettings({ cardsColumns: columns });
    },

    updateSortType: (sortType: 'created' | 'modified') => {
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
}); 