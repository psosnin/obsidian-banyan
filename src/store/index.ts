import { create } from "zustand";
import { FilterSchemeState, useFilterSchemeStore } from "./useFilterSchemeStore";
import { useViewSchemeStore, ViewSchemeState } from "./useViewSchemeStore";
import { DashBoardState, useDashBoardStore } from "./useDashBoardStore";
import { RandomReviewState, useRandomReviewStore } from "./useRandomReviewStore";
import BanyanPlugin from "src/BanyanPlugin";
import { getDefaultFilterScheme } from "src/models/FilterScheme";

interface BaseState {
    plugin: BanyanPlugin;
    setupPlugin: (plugin: BanyanPlugin) => void;
}

export type CombineState = DashBoardState & FilterSchemeState & ViewSchemeState & RandomReviewState & BaseState;

export const useCombineStore = create<CombineState>()((...a) => ({
    plugin: {} as BanyanPlugin,
    setupPlugin: (plugin: BanyanPlugin) => {
        const [set] = a;
        set({
            plugin: plugin,
            viewSchemes: plugin.settings.viewSchemes,
            filterSchemes: plugin.settings.filterSchemes,
            randomReviewFilters: plugin.settings.randomReviewFilters,
            curScheme: getDefaultFilterScheme(plugin.settings.filterSchemes),
        });
    },
    ...useDashBoardStore(...a),
    ...useFilterSchemeStore(...a),
    ...useViewSchemeStore(...a),
    ...useRandomReviewStore(...a),
}));