export type ViewScheme = {
    id: number,
    name: string,
    files: number[],
    pinned: number[], // 存储文件的创建时间戳，而非路径，以便在文件移动或重命名时保持置顶状态
    type: 'ViewScheme'
};