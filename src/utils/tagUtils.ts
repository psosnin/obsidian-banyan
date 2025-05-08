import { App, TFile, getAllTags } from "obsidian";

// 给TFile添加拓展方法 
declare module 'obsidian' {
  interface TFile {
    getTags(app: App): string[];
  }
}

TFile.prototype.getTags = function (app: App) {
  const cache = app.metadataCache.getFileCache(this);
  if (!cache) return [];
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  return Array.from(new Set(fileTags));
};

export const getFilesTags = (app: App, files: TFile[]) => {
  const rawTags = files
    .map(f => f.getTags(app))
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