import { create } from "zustand";
import { DashBoardState, useDashBoardStore } from "./useDashBoardStore";
import { SettingsState, useSettingsStore } from "./useSettingsStore";
import BanyanPlugin from "src/BanyanPlugin";

interface BaseState {
    plugin: BanyanPlugin;
    setupPlugin: (plugin: BanyanPlugin) => void;
    backlinksMap: { [key: string]: string[] };
    setBacklinksMap: (map: { [key: string]: string[] }) => void;
}

export type CombineState = DashBoardState & SettingsState & BaseState;

export const useCombineStore = create<CombineState>()((...a) => ({
    plugin: {} as BanyanPlugin,
    backlinksMap: {},
    setBacklinksMap: (map) => { const [set] = a; set({ backlinksMap: map }); },
    setupPlugin: (plugin: BanyanPlugin) => {
        const [set] = a;
        set({
            plugin: plugin,
            settings: plugin.settings,
        });
    },
    ...useDashBoardStore(...a),
    ...useSettingsStore(...a),
}));