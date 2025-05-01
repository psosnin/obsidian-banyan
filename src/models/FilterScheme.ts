export type FilterScheme = {
    id: number,
    name: string,
    tagFilter: { or: string[][]; not: string[] },
    dateRange: { from: string; to: string },
    keyword: string,
    type: 'FilterScheme'
};

export const DefaultFilterScheme: FilterScheme = {
    id: -1,
    name: '所有笔记',
    tagFilter: { or: [[]], not: [] },
    dateRange: { from: "", to: "" },
    keyword: "",
    type: 'FilterScheme'
}

export const SearchFilterScheme: FilterScheme = {
    id: -2,
    name: '搜索结果',
    tagFilter: { or: [[]], not: [] },
    dateRange: { from: "", to: "" },
    keyword: "",
    type: 'FilterScheme'
}