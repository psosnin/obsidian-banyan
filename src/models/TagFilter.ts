
export type TagFilter = {
    or: string[][]; // 多行，每行多个标签，行内为且
    not: string[];   // 非关系标签
    noTag: 'unlimited' | 'include' | 'exclude';
};

export const emptyTagFilter = (): TagFilter =>  {
    return {
        or: [[]],
        not: [],
        noTag: 'unlimited'
    };
};