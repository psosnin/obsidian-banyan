import { legalFileName } from "../src/utils/utils";

// 直接测试 legalFileName 方法，避免复杂的依赖
describe('legalFileName', () => {

    test('应该接受合法的文件名', () => {
        expect(legalFileName('valid-file-name')).toBe(true);
        expect(legalFileName('my_note')).toBe(true);
        expect(legalFileName('2023-12-25')).toBe(true);
        expect(legalFileName('中文文件名')).toBe(true);
        expect(legalFileName('file123')).toBe(true);
    });

    test('应该拒绝包含方括号的文件名', () => {
        expect(legalFileName('file[1]')).toBe(false);
        expect(legalFileName('[important]')).toBe(false);
        expect(legalFileName('note]test')).toBe(false);
    });

    test('应该拒绝包含井号的文件名', () => {
        expect(legalFileName('file#1')).toBe(false);
        expect(legalFileName('#important')).toBe(false);
        expect(legalFileName('note#test')).toBe(false);
    });

    test('应该拒绝包含脱字符的文件名', () => {
        expect(legalFileName('file^1')).toBe(false);
        expect(legalFileName('^important')).toBe(false);
        expect(legalFileName('note^test')).toBe(false);
    });

    test('应该拒绝包含竖线的文件名', () => {
        expect(legalFileName('file|1')).toBe(false);
        expect(legalFileName('|important')).toBe(false);
        expect(legalFileName('note|test')).toBe(false);
    });

    test('应该拒绝包含反斜杠的文件名', () => {
        expect(legalFileName('file\\1')).toBe(false);
        expect(legalFileName('\\important')).toBe(false);
        expect(legalFileName('note\\test')).toBe(false);
    });

    test('应该拒绝包含正斜杠的文件名', () => {
        expect(legalFileName('file/1')).toBe(false);
        expect(legalFileName('/important')).toBe(false);
        expect(legalFileName('note/test')).toBe(false);
    });

    test('应该拒绝包含冒号的文件名', () => {
        expect(legalFileName('file:1')).toBe(false);
        expect(legalFileName(':important')).toBe(false);
        expect(legalFileName('note:test')).toBe(false);
    });

    test('应该拒绝包含多个非法字符的文件名', () => {
        expect(legalFileName('file[1]#test')).toBe(false);
        expect(legalFileName('note|test:file')).toBe(false);
        expect(legalFileName('path/to\\file')).toBe(false);
        expect(legalFileName('file^test#important')).toBe(false);
    });

    test('应该处理空字符串', () => {
        expect(legalFileName('')).toBe(true);
    });

    test('应该处理只包含非法字符的字符串', () => {
        expect(legalFileName('[')).toBe(false);
        expect(legalFileName(']')).toBe(false);
        expect(legalFileName('#')).toBe(false);
        expect(legalFileName('^')).toBe(false);
        expect(legalFileName('|')).toBe(false);
        expect(legalFileName('\\')).toBe(false);
        expect(legalFileName('/')).toBe(false);
        expect(legalFileName(':')).toBe(false);
    });

    test('应该处理包含所有非法字符的字符串', () => {
        expect(legalFileName('[]#^|\\/:')).toBe(false);
    });
});
