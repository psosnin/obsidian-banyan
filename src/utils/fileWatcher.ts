import { TFile, Vault, MetadataCache } from 'obsidian';
import BanyanPlugin from 'src/main';
import { createFileInfo, ensureFileID, FileInfo } from 'src/models/FileInfo';

export type FileChangeType = 'create' | 'delete' | 'modify' | 'rename' | 'meta-change';
export interface FileChange {
  type: FileChangeType;
  fileInfo: FileInfo;
}

export type FileChangeCallback = (change: FileChange) => void;

export class FileWatcher {
  private plugin: BanyanPlugin;
  private vault: Vault;
  private metadataCache: MetadataCache;
  private callbacks: Set<FileChangeCallback> = new Set();
  private fileCache: Map<string, number> = new Map();
  private dir: string;

  constructor(plugin: BanyanPlugin) {
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.dir = plugin.settings.cardsDirectory;
    this.metadataCache = plugin.app.metadataCache;
    this.handleCreate = this.handleCreate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleModify = this.handleModify.bind(this);
    this.handleMetaChange = this.handleMetaChange.bind(this);
    this.initFileCache();
    this.registerEvents();
  }

  private initFileCache() {
    this.plugin.fileUtils.getAllFiles().forEach(fileInfo => {
      this.fileCache.set(fileInfo.file.path, fileInfo.file.stat.mtime);
    });
  }

  private registerEvents() {
    this.vault.on('create', this.handleCreate);
    this.vault.on('delete', this.handleDelete);
    this.vault.on('modify', this.handleModify);
    this.vault.on('rename', this.handleRename);
    this.metadataCache.on('changed', this.handleMetaChange);
  }

  private async handleCreate(file: TFile) {
    if (file.extension !== 'md' || !file.path.startsWith(this.dir)) return;
    this.fileCache.set(file.path, file.stat.mtime);
    await ensureFileID(file, this.plugin.app);
    const fileInfo = createFileInfo(file, this.plugin.app);
    if (!fileInfo) return;
    this.emit({ type: 'create', fileInfo });
  }

  private handleDelete(file: TFile) {
    if (file.extension !== 'md' || !file.path.startsWith(this.dir)) return;
    const fileInfo = createFileInfo(file, this.plugin.app);
    if (!fileInfo) return;
    this.fileCache.delete(file.path);
    this.emit({ type: 'delete', fileInfo });
  }

  private handleModify(file: TFile) {
    if (file.extension !== 'md' || !file.path.startsWith(this.dir)) return;
    const fileInfo = createFileInfo(file, this.plugin.app);
    if (!fileInfo) return;
    this.fileCache.set(file.path, file.stat.mtime);
    this.emit({ type: 'modify', fileInfo });
  }

  private handleRename(file: TFile, oldPath: string) {
    if (file.extension !== 'md' || !file.path.startsWith(this.dir)) return;
    const fileInfo = createFileInfo(file, this.plugin.app);
    if (!fileInfo) return;
    this.fileCache.set(file.path, this.fileCache.get(oldPath)!);
    this.fileCache.delete(oldPath);
    this.emit({ type:'rename', fileInfo});
  }

  private handleMetaChange(file: TFile) {
    if (file.extension !== 'md' || !file.path.startsWith(this.dir)) return;
    const fileInfo = createFileInfo(file, this.plugin.app);
    if (!fileInfo) return;
    this.emit({ type: 'meta-change', fileInfo });
  }

  public onChange(cb: FileChangeCallback) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  private emit(change: FileChange) {
    this.callbacks.forEach(cb => cb(change));
  }

  public dispose() {
    this.vault.off('create', this.handleCreate);
    this.vault.off('delete', this.handleDelete);
    this.vault.off('modify', this.handleModify);
    this.vault.off('rename', this.handleRename);
    this.metadataCache.off('changed', this.handleMetaChange);
    this.callbacks.clear();
    this.fileCache.clear();
  }
}

export const createFileWatcher = (plugin: BanyanPlugin) => {
  return new FileWatcher(plugin);
}