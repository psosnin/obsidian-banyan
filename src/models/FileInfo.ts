import { App, getAllTags, TFile } from "obsidian";
import { TagFilter } from "./TagFilter";

export interface FileInfo {
  file: TFile;
  tags: string[];
  id: number;
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
  return { file, tags, id } as FileInfo;
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

export const isOKWithTagFilter = (fileTags: string[], filter: TagFilter) => {
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
  // 没有包含意义的过滤项，则不过滤
  if (orTags.length === 0 && filter.noTag != 'include') return true;
  // 考虑每一个过滤项
  if (filter.noTag == 'include' && fileTags.length === 0) return true;
  for (const andTags of orTags) {
    if (andTags.every(tag => fileTags.some(fileTag => fileTag.startsWith(tag)))) {
      return true;
    }
  }
  return false;
}