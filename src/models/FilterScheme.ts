import { i18n } from "src/utils/i18n";

export type FilterScheme = {
    id: number,
    name: string,
    tagFilter: { or: string[][]; not: string[] },
    dateRange: { from: string; to: string },
    keyword: string,
    pinned: number[], // 存储文件的创建时间戳，而非路径，以便在文件移动或重命名时保持置顶状态
    type: 'FilterScheme'
};

export const DefaultFilterSchemeID = -1;

export const getDefaultFilterScheme = (schemes: FilterScheme[]) => {
    return schemes.find(s => s.id === DefaultFilterSchemeID) ?? _DefaultFilterScheme;
}

const _DefaultFilterScheme: FilterScheme = {
    id: -1,
    name: i18n.t('all_notes'),
    tagFilter: { or: [[]], not: [] },
    dateRange: { from: "", to: "" },
    keyword: "",
    pinned: [],
    type: 'FilterScheme'
}

export const SearchFilterSchemeID = -2;

export const SearchFilterScheme: FilterScheme = {
    id: -2,
    name: '搜索结果',
    tagFilter: { or: [[]], not: [] },
    dateRange: { from: "", to: "" },
    keyword: "",
    pinned: [],
    type: 'FilterScheme'
}