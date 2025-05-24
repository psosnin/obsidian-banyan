import { TFolder, App, TFile, normalizePath, Notice, getAllTags } from "obsidian";
import BanyanPlugin from "src/main";
import { TagFilter } from "src/models/TagFilter";

const PlaceholderFileName = "banyan_editor_placeholder.md";

declare module 'obsidian' {
  interface TFile {
    getID(): number;
    getTags(app: App): string[];
    isOKWithTagFilter(app: App, filter: TagFilter): boolean;
  }
}

TFile.prototype.getID = function (): number {
  return this.stat.ctime;
};

TFile.prototype.getTags = function (app: App): string[] {
  const cache = app.metadataCache.getFileCache(this);
  if (!cache) return [];
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  return Array.from(new Set(fileTags));
};

TFile.prototype.isOKWithTagFilter = function (app: App, filter: TagFilter): boolean {
  const fileTags: string[] = this.getTags(app);
  const notTags = filter.not;
  const orTags = filter.or.filter(row => row.length > 0); // 优化 或标签组

  // *** 排除 ***
  // 要排除的标签
  for (const noTag of notTags) {
    if (fileTags.some(fileTag => fileTag.startsWith(noTag))) {
      return false;
    }
  }
  // 排除无标签
  if (filter.noTag == 'exclude' && fileTags.length === 0) return false;

  // *** 包含 ***
  // 包含无标签
  if (filter.noTag == 'include' && fileTags.length === 0) return true;
  // 没有「或标签组」，则不过滤
  if (orTags.length === 0) return true;
  
  // 有「或标签组」，则只保留符合的文件，排除其他
  for (const andTags of orTags) {
    if (andTags.every(tag => fileTags.some(fileTag => fileTag.startsWith(tag)))) {
      return true;
    }
  }
  return false;
};

export class FileUtils {

  app: App;
  dir: string;
  plugin: BanyanPlugin;
  constructor(app: App, plugin: BanyanPlugin) {
    this.app = app;
    this.plugin = plugin;
    this.dir = plugin.settings.cardsDirectory;
  }

  //#region 文件获取
  async getAllFolders(): Promise<string[]> {
    const folders: string[] = [];
    const walk = (folder: TFolder, path: string) => {
      folders.push(path);
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          walk(child, child.path);
        }
      }
    };
    const root = this.app.vault.getRoot();
    walk(root, "");
    return folders.filter(f => f !== "");
  }

  getAllFiles(): TFile[] {
    const files = this.app.vault.getMarkdownFiles()
      .filter((file: TFile) => file.path.startsWith(this.dir))
      .filter((file: TFile) => file.path !== normalizePath(`${this.dir}/${PlaceholderFileName}`));
    return files;
  }

  async getPlaceholderFile() {
    const path = normalizePath(`${this.dir}/${PlaceholderFileName}`);
    const file = this.app.vault.getFileByPath(path);
    if (file) return file;
    const res = await this.app.vault.create(path, "");
    return res;
  }

  private async getNewNoteFilePath() {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor((now.getMonth() + 3) / 3);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    const folderPath = `${this.dir}/${year}年/${quarter}季度/${month}月/${day}日`;
    await this.ensureDirectoryExists(folderPath);
    const fileName = `${year}-${month}-${day} ${hour}-${minute}-${second}.md`;
    const filePath = normalizePath(`${folderPath}/${fileName}`);
    return filePath;
  }

  private async ensureDirectoryExists(directoryPath: string) {
    const normalizedPath = normalizePath(directoryPath);
    if (!this.app.vault.getAbstractFileByPath(normalizedPath)) {
      await this.app.vault.createFolder(normalizedPath);
    }
  }
  //#endregion

  //#region 打开、增删文件
  openFile(file: TFile) {
    this.app.workspace.openLinkText(file.path, '', false);
  }

  openRandomFile() {
    const files = this.getAllFiles();
    const filteredFiles = this.getTagsFilterdFiles(files, this.plugin.settings.randomNoteTagFilter);
    if (!files || filteredFiles.length === 0) {
      new Notice('没有找到任何笔记');
      return;
    }

    // 随机选择一个笔记
    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    const randomFile = filteredFiles[randomIndex];

    // 打开笔记
    const leaf = this.app.workspace.getLeaf(false);
    leaf.openFile(randomFile, { active: true }).then(() => this.app.workspace.setActiveLeaf(leaf, { focus: true }));
    // this.app.workspace.openLinkText(randomFile.path, '', false);
  }

  async addFile(content?: string, open: boolean = true) {
    const filePath = await this.getNewNoteFilePath();
    const _content = content ?? `---\ntags: \n---\n`;
    const file = await this.app.vault.create(filePath, _content);
    if (!open) return;
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file, { active: true, state: { mode: 'source' }, });
    this.app.workspace.setActiveLeaf(leaf, { focus: true });
  }

  async trashFile(file: TFile) {
    await this.app.vault.trash(file, true);
  }
  //#endregion

  //#region 文件内容操作
  async readFileContent(file: TFile) {
    return await this.app.vault.read(file);
  }

  async readCachedFileContent(file: TFile) {
    return await this.app.vault.cachedRead(file);
  }

  async modifyFileContent(file: TFile, content: string) {
    await this.app.vault.modify(file, content);
  }

  async emptyFileContent(file: TFile) {
    await this.app.vault.modify(file, "");
  }
  //#endregion

  //#region 标签操作
  getFilesTags(files: TFile[]) {
    const rawTags = files
      .map(f => f.getTags(this.app))
      .reduce((pre, cur) => pre.concat(cur), []);
    const tagSet = new Set(rawTags);
    // 多级标签的初级标签也要添加，如 a/b/c 也要添加 a/b 和 a
    tagSet.forEach((tag) => {
      const subs = tag.split("/");
      if (subs.length == 1) return;
      subs.forEach((_sub, index) => {
        if (index == 0) return;
        tagSet.add(subs.slice(0, index).join("/"));
      });
    });
    const res = Array.from(tagSet);
    res.sort((a, b) => a.length - b.length);
    return res;
  }

  getAllFilesTags() {
    const files = this.getAllFiles();
    return this.getFilesTags(files);
  }

  getTagsFilterdFiles(files: TFile[], filter: TagFilter) {
    return files.filter(file => file.isOKWithTagFilter(this.app, filter));
  }

  //#endregion
}
