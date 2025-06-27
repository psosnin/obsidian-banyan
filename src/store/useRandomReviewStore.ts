import { RandomReviewFilter } from "src/models/RandomReviewFilters";
import { StateCreator } from "zustand";
import { CombineState } from ".";

export interface RandomReviewState {
    randomReviewFilters: RandomReviewFilter[];

    reorderRandomReviewFilters: (filters: RandomReviewFilter[]) => void;
    createRandomReviewFilter: (filter: RandomReviewFilter) => void;
    updateRandomReviewFilter: (filter: RandomReviewFilter) => void;
    deleteRandomReviewFilter: (id: number) => void;

    updateRandomReviewFilterList: (filters: RandomReviewFilter[]) => void;
}

export const useRandomReviewStore: StateCreator<CombineState, [], [], RandomReviewState> = (set, get) => ({
    randomReviewFilters: [],

    reorderRandomReviewFilters: (filters: RandomReviewFilter[]) => {
        get().updateRandomReviewFilterList(filters);
    },
    createRandomReviewFilter: (filter: RandomReviewFilter) => {
        get().updateRandomReviewFilterList([...get().randomReviewFilters, filter]);
    },
    updateRandomReviewFilter: (filter: RandomReviewFilter) => {
        get().updateRandomReviewFilterList(get().randomReviewFilters.map((f) => f.id === filter.id ? filter : f));
    },
    deleteRandomReviewFilter: (id: number) => {
        get().updateRandomReviewFilterList(get().randomReviewFilters.filter((f) => f.id !== id));
    },

    updateRandomReviewFilterList: (filters: RandomReviewFilter[]) => {
        const plugin = get().plugin;
        plugin.resetRandomReview();
        
        get().updateSettings({ randomReviewFilters: filters });
        set({ randomReviewFilters: filters });

        plugin.setupRandomReview();
    },
});