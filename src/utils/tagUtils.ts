import { App, TFile } from "obsidian";

export const getAllTags = (app: App, files: TFile[]) => {
  const tagSet = new Set<string>();
  files.forEach((file: TFile) => {
    const properties = app.metadataCache.getFileCache(file)?.frontmatter;
    if (properties?.tags) {
      if (Array.isArray(properties.tags)) {
        properties.tags.forEach((tag: string) => tagSet.add(tag));
      } else if (typeof properties.tags === 'string') {
        tagSet.add(properties.tags);
      }
    }
  });
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
