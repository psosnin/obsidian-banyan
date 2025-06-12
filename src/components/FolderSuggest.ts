import { AbstractInputSuggest, App } from "obsidian";

export default class FolderSuggest extends AbstractInputSuggest<string> {

    onSelectItem: (item: string) => void;

    constructor(app: App, inputEl: HTMLInputElement, onSelectItem: (item: string) => void) {
        super(app, inputEl);
        this.onSelectItem = onSelectItem;
    }

    getSuggestions(input: string): string[] {
        const inputLowerCase = input.toLocaleLowerCase();
        return this.app.vault.getAllFolders(true)
            .map(f => f.path.toLocaleLowerCase())
            .filter(name => name.includes(inputLowerCase));
    }

    renderSuggestion(item: string, el: HTMLElement) {
        el.setText(item);
    }

    selectSuggestion(item: string) {
        this.onSelectItem(item);
        this.close();
    }
}