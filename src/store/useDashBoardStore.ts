import { StateCreator } from "zustand";
import { CombineState } from ".";
import { FileInfo } from "src/models/FileInfo";

export interface DashBoardState {
    allFiles: FileInfo[];
    allTags: string[];
    selectedTopicNote: FileInfo | null;
    featuredNote: FileInfo | null;

    loadAllFiles: () => void;
    loadNoteByPath: (path: string) => Promise<FileInfo | null>;
    setSelectedTopicNote: (note: FileInfo | null) => void;
    setFeaturedNote: (note: FileInfo | null) => void;

    needRefresh: boolean;
    setNeedRefresh: (need: boolean) => void;
}

export const useDashBoardStore: StateCreator<CombineState, [], [], DashBoardState> = (set, get) => ({
    allFiles: [],
    allTags: [],
    selectedTopicNote: null,
    featuredNote: null,

    loadAllFiles: () => {
        const plugin = get().plugin;
        const allFiles = plugin.fileUtils.getAllFiles();
        const allTags = plugin.fileUtils.getAllFilesTags();
        set({ allFiles, allTags });
    },

    loadNoteByPath: async (path: string): Promise<FileInfo | null> => {
        if (!path) return null;
        
        const plugin = get().plugin;
        // Add .md if not already present
        const fullPath = path.endsWith('.md') ? path : path + '.md';
        const file = plugin.app.vault.getAbstractFileByPath(fullPath);
        
        if (!file || !('stat' in file) || !('path' in file)) {
            console.log('File not found:', fullPath);
            return null;
        }
        
        const allFiles = plugin.fileUtils.getAllFiles();
        const fileInfo = allFiles.find(f => f.file.path === (file as any).path);
        
        if (!fileInfo) {
            console.log('FileInfo not found for:', (file as any).path);
        }
        
        return fileInfo || null;
    },

    setSelectedTopicNote: (note: FileInfo | null) => {
        set({ selectedTopicNote: note });
    },

    setFeaturedNote: (note: FileInfo | null) => {
        set({ featuredNote: note });
    },

    needRefresh: false,
    setNeedRefresh: (need: boolean) => set({ needRefresh: need }),
});
