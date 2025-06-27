import { TagFilter, isOKWithTagFilter } from "../src/models/TagFilter";

describe('测试标签过滤', () => {

    test('排除标签', () => {
        const filter: TagFilter = { or: [[]], not: ['b'], noTag: 'unlimited' };
        const tags = ['a', 'b', 'c'];
        expect(isOKWithTagFilter(tags, filter)).toBe(false);

        const tags2 = ['a', 'c'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);
    });

    test('多级标签排除', () => {
        const filter: TagFilter = { or: [[]], not: ['a/b'], noTag: 'unlimited' };
        const tags = ['a/b/c'];
        expect(isOKWithTagFilter(tags, filter)).toBe(false);

        const tags2 = ['a/c'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);
    });

    test('或标签组过滤', () => {
        const filter: TagFilter = { or: [['a'], ['b', 'c']], not: [], noTag: 'unlimited' };
        const tags1 = ['a', 'x'];
        expect(isOKWithTagFilter(tags1, filter)).toBe(true);

        const tags2 = ['b', 'c', 'y'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);

        const tags3 = ['x', 'y'];
        expect(isOKWithTagFilter(tags3, filter)).toBe(false);
    });

    test('无标签文件过滤 - unlimited', () => {
        const filter: TagFilter = { or: [[]], not: [], noTag: 'unlimited' };
        const tags: string[] = [];
        expect(isOKWithTagFilter(tags, filter)).toBe(true);

        const tags2 = ['a'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);
    });

    test('无标签文件过滤 - include', () => {
        const filter: TagFilter = { or: [[]], not: [], noTag: 'include' };
        const tags: string[] = [];
        expect(isOKWithTagFilter(tags, filter)).toBe(true);

        const tags2 = ['a'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(false);
    });

    test('无标签文件过滤 - exclude', () => {
        const filter: TagFilter = { or: [[]], not: [], noTag: 'exclude' };
        const tags: string[] = [];
        expect(isOKWithTagFilter(tags, filter)).toBe(false);

        const tags2 = ['a'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);
    });

    test('组合过滤', () => {
        const filter: TagFilter = { or: [['a'], ['b', 'c']], not: ['d'], noTag: 'unlimited' };
        const tags1 = ['a', 'e'];
        expect(isOKWithTagFilter(tags1, filter)).toBe(true);

        const tags2 = ['b', 'c', 'e'];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);

        const tags3 = ['a', 'd'];
        expect(isOKWithTagFilter(tags3, filter)).toBe(false);

        const tags4 = ['e', 'f'];
        expect(isOKWithTagFilter(tags4, filter)).toBe(false);
    });

    test('空标签组不影响过滤', () => {
        const filter: TagFilter = { or: [[], ['a']], not: [], noTag: 'unlimited' };
        const tags = ['a'];
        expect(isOKWithTagFilter(tags, filter)).toBe(true);

        const filter2: TagFilter = { or: [[], []], not: [], noTag: 'unlimited' };
        const tags2 = ['a'];
        expect(isOKWithTagFilter(tags2, filter2)).toBe(true);
    });

    test('包含逻辑与无标签文件', () => {
        const filter: TagFilter = { or: [['a']], not: [], noTag: 'include' };
        const tags1 = ['a'];
        expect(isOKWithTagFilter(tags1, filter)).toBe(true);

        const tags2: string[] = [];
        expect(isOKWithTagFilter(tags2, filter)).toBe(true);

        const filter2: TagFilter = { or: [[]], not: [], noTag: 'include' };
        const tags3: string[] = [];
        expect(isOKWithTagFilter(tags3, filter2)).toBe(true);

        const tags4 = ['a'];
        expect(isOKWithTagFilter(tags4, filter2)).toBe(false);
    });

    test('部分匹配包含', () => {
        const filter: TagFilter = { or: [['a']], not: [], noTag: 'unlimited' };
        const tags = ['a/b'];
        expect(isOKWithTagFilter(tags, filter)).toBe(true);
    });

    test('多个not标签', () => {
        const filter: TagFilter = { or: [[]], not: ['a', 'b'], noTag: 'unlimited' };
        expect(isOKWithTagFilter(['a'], filter)).toBe(false);
        expect(isOKWithTagFilter(['b'], filter)).toBe(false);
        expect(isOKWithTagFilter(['c'], filter)).toBe(true);
    });

    test('特殊字符标签', () => {
        const filter: TagFilter = { or: [['a b']], not: ['c#d'], noTag: 'unlimited' };
        expect(isOKWithTagFilter(['a b'], filter)).toBe(true);
        expect(isOKWithTagFilter(['c#d'], filter)).toBe(false);
    });

    test('or组全部为空数组', () => {
        const filter1: TagFilter = { or: [[], []], not: [], noTag: 'unlimited' };
        expect(isOKWithTagFilter([], filter1)).toBe(true);
        expect(isOKWithTagFilter(['a'], filter1)).toBe(true);

        const filter2: TagFilter = { or: [[], []], not: [], noTag: 'include' };
        expect(isOKWithTagFilter([], filter2)).toBe(true);
        expect(isOKWithTagFilter(['a'], filter2)).toBe(false);

        const filter3: TagFilter = { or: [[], []], not: [], noTag: 'exclude' };
        expect(isOKWithTagFilter([], filter3)).toBe(false);
        expect(isOKWithTagFilter(['a'], filter3)).toBe(true);
    });

    test('多级标签包含逻辑', () => {
        const filter: TagFilter = { or: [['a/b']], not: [], noTag: 'unlimited' };
        expect(isOKWithTagFilter(['a/b/c'], filter)).toBe(true);
        expect(isOKWithTagFilter(['a/c'], filter)).toBe(false);
    });

    test('混合部分匹配和完全匹配', () => {
        const filter: TagFilter = { or: [['a', 'b/c']], not: [], noTag: 'unlimited' };
        expect(isOKWithTagFilter(['a/x', 'b/c/d'], filter)).toBe(true);
        expect(isOKWithTagFilter(['a', 'b'], filter)).toBe(false);
    });
});