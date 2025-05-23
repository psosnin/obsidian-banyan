import { FilterScheme } from "src/models/FilterScheme";
import { StateCreator } from "zustand";
import { CombineState } from ".";

export interface FilterSchemeState {

    filterSchemes: FilterScheme[];

    createFilterScheme: (filterScheme: FilterScheme) => void;
    updateFilterScheme: (filterScheme: FilterScheme) => void;
    deleteFilterScheme: (id: number) => void;

    getSchemeById: (id: number) => FilterScheme | undefined;
    getChildSchemes: (parentId: number | null) => FilterScheme[];
    moveScheme: (scheme: FilterScheme, targetScheme: FilterScheme, position: 'before' | 'inside' | 'after') => void;

    updateFilterSchemeList: (filterSchemes: FilterScheme[]) => void;
}

export const useFilterSchemeStore: StateCreator<CombineState, [], [], FilterSchemeState> = (set, get) => ({
    filterSchemes: [],

    // 获取指定ID的方案
    getSchemeById: (id: number) => {
        return get().filterSchemes.find(scheme => scheme.id === id);
    },

    // 获取指定父ID的所有子方案
    getChildSchemes: (parentId: number | null) => {
        return get().filterSchemes.filter(scheme => scheme.parentId === parentId);
    },

    createFilterScheme: (filterScheme: FilterScheme) => {
        get().updateFilterSchemeList([...get().filterSchemes, filterScheme]);
    },

    updateFilterScheme: (filterScheme: FilterScheme) => {
        get().updateFilterSchemeList(get().filterSchemes.map((scheme) => scheme.id === filterScheme.id ? filterScheme : scheme));
    },

    deleteFilterScheme: (id: number) => {
        const schemeToDelete = get().getSchemeById(id);
        if (!schemeToDelete) return;

        let updatedSchemes = [...get().filterSchemes];

        // 递归删除所有子方案
        const idsToDelete = [id];
        const collectChildrenIds = (parentId: number) => {
            const children = get().getChildSchemes(parentId);
            children.forEach(child => {
                idsToDelete.push(child.id);
                collectChildrenIds(child.id);
            });
        };

        collectChildrenIds(id);

        // 移除所有要删除的方案
        updatedSchemes = updatedSchemes.filter(s => !idsToDelete.includes(s.id));

        get().updateFilterSchemeList(updatedSchemes);
    },

    // 移动方案（拖拽功能）- 重新实现以支持顺序和父子层级独立
    moveScheme: (scheme: FilterScheme, targetScheme: FilterScheme, position: 'before' | 'inside' | 'after') => {

        let updatedSchemes = [...get().filterSchemes]; // 获取当前所有方案的副本

        // 更新父亲id
        let schemeToMove = { ...scheme, parentId: position === 'inside' ? targetScheme.id : targetScheme.parentId };

        // 从数组中暂时移除该方案
        const schemeIndex = updatedSchemes.findIndex(s => s.id === schemeToMove.id);
        if (schemeIndex === -1) return;
        updatedSchemes.splice(schemeIndex, 1);

        // 寻找要插入的目标位置
        let targetIndex = updatedSchemes.findIndex(s => s.id === targetScheme.id);
        if (position === 'before') {
            targetIndex--;
            targetIndex = targetIndex < 0 ? 0 : targetIndex;
        } else {
            // 放在目标方案之后，跳过所有它的子方案，与目标方案同级            
            for (let i = targetIndex + 1; i < updatedSchemes.length; i++) {
                if (updatedSchemes[i].parentId === targetScheme.parentId) break;
                targetIndex = i;                
            }
        }
        updatedSchemes.splice(targetIndex+1, 0, schemeToMove);

        get().updateFilterSchemeList(updatedSchemes);
    },

    updateFilterSchemeList: (filterSchemes: FilterScheme[]) => {
        const plugin = get().plugin;
        plugin.settings.filterSchemes = filterSchemes;
        plugin.saveSettings();
        set({ filterSchemes });
    }
});