export type FilterScheme = {
    id: number,
    name: string,
    tagFilter: { or: string[][]; not: string[] },
    dateRange: { from: string; to: string },
    keyword: string,
    pinned: string[],
    type: 'FilterScheme'
};

export const DefaultFilterSchemeID = -1;

export const getDefaultFilterScheme = (schemes: FilterScheme[]) => {
    return schemes.find(s => s.id === DefaultFilterSchemeID) ?? _DefaultFilterScheme;
}

const _DefaultFilterScheme: FilterScheme = {
    id: -1,
    name: '所有笔记',
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