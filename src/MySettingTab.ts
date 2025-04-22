import { App, PluginSettingTab, Setting, TFolder } from 'obsidian';
import MyPlugin from './main';
import { getAllFolders, createFolderSuggest } from './utils/folderSuggest';

export interface MyPluginSettings {
	notesDirectory: string;
	cardsDirectory: string;
	noteType: 'card' | 'context';
	sortType: 'created' | 'modified';
	pinnedFiles: string[];
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	notesDirectory: 'contexts',
	cardsDirectory: 'cards',
	noteType: 'card',
	sortType: 'created',
	pinnedFiles: [],
}

export class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName('上下文笔记目录')
			.addText(async text => {
				const folders = await getAllFolders(this.app);
				createFolderSuggest(text.inputEl, folders, async (folder) => {
					text.setValue(folder);
					this.plugin.settings.notesDirectory = folder;
					await this.plugin.saveSettings();
				});
				text.setPlaceholder('请输入目录路径')
					.setValue(this.plugin.settings.notesDirectory || "")
					.onChange(async (value) => {
						this.plugin.settings.notesDirectory = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('卡片笔记目录')
			.addText(async text => {
				const folders = await getAllFolders(this.app);
				createFolderSuggest(text.inputEl, folders, async (folder) => {
					text.setValue(folder);
					this.plugin.settings.cardsDirectory = folder;
					await this.plugin.saveSettings();
				});
				text.setPlaceholder('请输入目录路径')
					.setValue(this.plugin.settings.cardsDirectory || "")
					.onChange(async (value) => {
						this.plugin.settings.cardsDirectory = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
