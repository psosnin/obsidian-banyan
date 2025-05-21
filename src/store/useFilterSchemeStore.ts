import { FilterScheme } from "src/models/FilterScheme";
import { StateCreator } from "zustand";
import { CombineState } from ".";

export interface FilterSchemeState {

    filterSchemes: FilterScheme[];

    reorderFilterSchemes: (filterSchemes: FilterScheme[]) => void;
    createFilterScheme: (filterScheme: FilterScheme) => void;
    updateFilterScheme: (filterScheme: FilterScheme) => void;
    deleteFilterScheme: (id: number) => void;

    updateFilterSchemeList: (filterSchemes: FilterScheme[]) => void;
}

export const useFilterSchemeStore: StateCreator<CombineState, [], [], FilterSchemeState> = (set, get) => ({
    filterSchemes: [],

    reorderFilterSchemes: (filterSchemes: FilterScheme[]) => {
        get().updateFilterSchemeList(filterSchemes);
    },
    createFilterScheme: (filterScheme: FilterScheme) => {
        get().updateFilterSchemeList([...get().filterSchemes, filterScheme]);
    },
    updateFilterScheme: (filterScheme: FilterScheme) => {
        get().updateFilterSchemeList(get().filterSchemes.map((scheme) => scheme.id === filterScheme.id ? filterScheme : scheme));
    },
    deleteFilterScheme: (id: number) => {
        get().updateFilterSchemeList(get().filterSchemes.filter((scheme) => scheme.id !== id))
    },

    updateFilterSchemeList: (filterSchemes: FilterScheme[]) => {
        const plugin = get().plugin;
        plugin.settings.filterSchemes = filterSchemes;
        plugin.saveSettings();
        set({ filterSchemes });
    }
});