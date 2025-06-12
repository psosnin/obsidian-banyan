import { TFolder, App, TFile, normalizePath, Notice } from "obsidian";
import BanyanPlugin from "src/main";
import { createFileInfo, FileInfo, generateFileId, isOKWithTagFilter } from "src/models/FileInfo";
import { TagFilter } from "src/models/TagFilter";
import { i18n } from "./i18n";

const PlaceholderFileName = "banyan_editor_placeholder.md";

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

  isLegalFile(file: TFile) {
    return file.path.startsWith(this.dir) && file.path !== normalizePath(`${this.dir}/${PlaceholderFileName}`);
  }

  isLegalMarkdownFile(file: TFile) {
    return file.extension === 'md' && this.isLegalFile(file);
  }

  getAllRawFiles(): TFile[] {
    const files = this.app.vault.getMarkdownFiles()
      .filter((file: TFile) => this.isLegalFile(file));
    return files;
  }

  getAllFiles(): FileInfo[] {
    const files = this.getAllRawFiles()
      .map(f => createFileInfo(f, this.app))
      .filter(f => f !== null)
      .map(f => f!);
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

  openRandomFile(tagFilter: TagFilter) {
    const files = this.getAllFiles();
    const filteredFiles = this.getTagsFilterdFiles(files, tagFilter);
    if (!files || filteredFiles.length === 0) {
      new Notice(i18n.t('random_reivew_no_match'));
      return;
    }

    // 随机选择一个笔记
    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    const randomFile = filteredFiles[randomIndex];

    // 打开笔记
    const leaf = this.app.workspace.getLeaf(false);
    leaf.openFile(randomFile.file, { active: true }).then(() => this.app.workspace.setActiveLeaf(leaf, { focus: true }));
    // this.app.workspace.openLinkText(randomFile.path, '', false);
  }

  async addFile(content?: string, tags: string[] = [], open: boolean = true) {
    const filePath = await this.getNewNoteFilePath();
    const id = generateFileId((new Date()).getTime());
    const tagsStr = `tags:\n${tags.map(t => `- ${t}\n`).join('')}`;
    const _content = `---\nid: ${id}\n${tagsStr}---\n` + (content ?? '');
    const file = await this.app.vault.create(filePath, _content);
    if (!open) return;
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file, { active: true, state: { mode: 'source' }, });
    this.app.workspace.setActiveLeaf(leaf, { focus: true });
  }

  async trashFile(file: TFile) {
    await this.app.fileManager.trashFile(file);
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
  getFilesTags(files: FileInfo[]) {
    const rawTags = files
      .map(f => f.tags)
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

  getTagsFilterdFiles(files: FileInfo[], filter: TagFilter) {
    return files.filter(({tags}) => isOKWithTagFilter(tags, filter));
  }

  //#endregion
}
