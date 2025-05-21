import { ViewScheme } from "src/models/ViewScheme";
import { StateCreator } from "zustand";
import { CombineState } from ".";

export interface ViewSchemeState {

    viewSchemes: ViewScheme[];

    reorderViewSchemes: (viewSchemes: ViewScheme[]) => void;
    createViewScheme: (viewScheme: ViewScheme) => void;
    updateViewScheme: (viewScheme: ViewScheme) => void;
    deleteViewScheme: (id: number) => void;
    updateWhendeleteFile: (fileID: number) => void;

    updateViewSchemeList: (viewSchemes: ViewScheme[]) => void;
}

export const useViewSchemeStore: StateCreator<CombineState, [], [], ViewSchemeState> = (set, get) => ({
    viewSchemes: [],

    reorderViewSchemes: (viewSchemes: ViewScheme[]) => {
        get().updateViewSchemeList(viewSchemes);
    },
    createViewScheme: (viewScheme: ViewScheme) => {
        get().updateViewSchemeList([...get().viewSchemes, viewScheme]);
    },
    updateViewScheme: (viewScheme: ViewScheme) => {
        get().updateViewSchemeList(get().viewSchemes.map((scheme) => scheme.id === viewScheme.id ? viewScheme : scheme));
    },
    deleteViewScheme: (id: number) => {
        get().updateViewSchemeList(get().viewSchemes.filter((scheme) => scheme.id !== id));
    },
    updateWhendeleteFile: (fileID: number) => {
        const viewSchemes = get().viewSchemes;
        const curScheme = get().curScheme;
        const setCurScheme = get().setCurScheme;
        const newSchemes = viewSchemes.map(scheme => {
            const newFiles = scheme.files.filter((id) => id !== fileID);
            const newPinned = scheme.pinned.filter((id) => id !== fileID);
            return { ...scheme, files: newFiles, pinned: newPinned };
        });
        get().updateViewSchemeList(newSchemes);
        if (curScheme.type == 'ViewScheme') {
            const newScheme = newSchemes.filter(scheme => scheme.id == curScheme.id).first();
            if (newScheme) {
                setCurScheme(newScheme);
            }
        }
    },

    updateViewSchemeList: (viewSchemes: ViewScheme[]) => {
        const plugin = get().plugin;
        plugin.settings.viewSchemes = viewSchemes;
        plugin.saveSettings();
        set({ viewSchemes });
    },
});