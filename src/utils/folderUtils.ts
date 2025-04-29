import { TFolder, App, Plugin } from "obsidian";

export async function getAllFolders(app: App): Promise<string[]> {
  const folders: string[] = [];
  const walk = (folder: TFolder, path: string) => {
    folders.push(path);
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        walk(child, child.path);
      }
    }
  };
  const root = app.vault.getRoot();
  walk(root, "");
  return folders.filter(f => f !== "");
}

export function createFolderSuggest(
  inputEl: HTMLInputElement,
  folders: string[],
  onSelect: (folder: string) => void
) {
  let suggestEl: HTMLDivElement | null = null;
  const showSuggestions = (value: string) => {
    if (suggestEl) suggestEl.remove();
    const filtered = folders.filter(f => f.includes(value));
    if (filtered.length === 0) return;
    suggestEl = document.createElement('div');
    suggestEl.className = 'folder-suggest-dropdown';
    filtered.forEach(folder => {
      const item = document.createElement('div');
      item.textContent = folder;
      item.className = 'folder-suggest-item';
      item.onmousedown = (e) => {
        e.preventDefault();
        onSelect(folder);
        if (suggestEl) suggestEl.remove();
      };
      suggestEl?.appendChild(item);
    });
    inputEl.parentElement?.appendChild(suggestEl);
    // 定位
    // const inputRect = inputEl.getBoundingClientRect();
    suggestEl.style.position = 'absolute';
    suggestEl.style.left = (inputEl.offsetLeft - 240) + 'px';
    suggestEl.style.top = (inputEl.offsetTop + inputEl.offsetHeight) + 'px';
    suggestEl.style.width = (inputEl.offsetWidth + 280) + 'px';
  };
  inputEl.addEventListener('focus', () => {
    showSuggestions(inputEl.value);
  });
  inputEl.addEventListener('input', () => {
    showSuggestions(inputEl.value);
  });
  inputEl.addEventListener('blur', () => {
    setTimeout(() => { if (suggestEl) suggestEl.remove(); }, 100);
  });
}