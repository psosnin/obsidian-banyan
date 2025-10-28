import { BanyanPluginSettings, TopicButton } from "src/BanyanPluginSettings";
import { StateCreator } from "zustand";
import { CombineState } from ".";
import { CardContentMaxHeightType, TitleDisplayMode, FontTheme } from "src/models/Enum";
import moment from "moment";

export interface SettingsState {
    settings: BanyanPluginSettings;

    // Settings update methods
    updateSettings: (settings: Partial<BanyanPluginSettings>) => void;
    
    // Individual setting updates
    updateOpenWhenStartObsidian: (open: boolean) => void;
    updateTitleDisplayMode: (mode: TitleDisplayMode) => void;
    updateFirstUseDate: (date: string) => void;
    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => void;
    updateFontTheme: (theme: FontTheme) => void;
    updateTopicButtons: (buttons: TopicButton[]) => void;
    updateFeaturedNotePath: (path: string) => void;

    // Business logic: whether to show card title
    shouldShowTitle: (basename: string) => boolean;
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

    updateOpenWhenStartObsidian: (open: boolean) => {
        get().updateSettings({ openWhenStartObsidian: open });
    },

    updateTitleDisplayMode: (mode: TitleDisplayMode) => {
        get().updateSettings({ titleDisplayMode: mode });
    },

    updateFirstUseDate: (date: string) => {
        get().updateSettings({ firstUseDate: date });
    },

    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => {
        get().updateSettings({ cardContentMaxHeight: height });
    },
    
    updateFontTheme: (theme: FontTheme) => {
        get().updateSettings({ fontTheme: theme });
    },

    updateTopicButtons: (buttons: TopicButton[]) => {
        get().updateSettings({ topicButtons: buttons });
    },

    updateFeaturedNotePath: (path: string) => {
        get().updateSettings({ featuredNotePath: path });
    },

    shouldShowTitle: (basename: string) => {
        const mode = get().settings.titleDisplayMode;
        if (mode === 'none') return false;
        const formatStr = get().plugin.fileUtils.getZkPrefixerFormat() || "YYYY-MM-DD HH-mm-ss";
        return !moment(basename, formatStr, true).isValid();
    },
});