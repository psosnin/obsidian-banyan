import { App, getAllTags, TFile } from "obsidian";
import { TagFilter } from "./TagFilter";

export interface FileInfo {
  file: TFile;
  tags: string[];
  id: number;
  propertyTitle?: string;
}

export const generateFileId = (createTime: number, randomNum?: number) => {
  const newId = createTime * 1000 + (randomNum ?? Math.floor(Math.random() * 1000));
  return newId
}

export const createFileInfo = (file: TFile, app: App): FileInfo | null => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return null;
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  const tags = Array.from(new Set(fileTags));
  const id = cache.frontmatter?.id;
  if (!id) return null;
  const propertyTitle = cache.frontmatter?.title;
  return { file, tags, id, propertyTitle } as FileInfo;
}

export const ensureFileID = async (file: TFile, app: App, random?: number) => {
  try {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (frontmatter.id !== undefined) return;
      const newId = generateFileId(file.stat.ctime, random);
      frontmatter.id = newId;      
    }, { mtime: file.stat.mtime });
  } catch (error) {
    console.log('error when read file id', file.path, error);
  }
}
