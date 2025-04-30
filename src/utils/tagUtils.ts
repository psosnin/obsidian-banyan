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
    return Array.from(tagSet);
  }