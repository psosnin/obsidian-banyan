import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';
import { getAllFolders, createFolderSuggest } from './utils/fileUtils';
import { FilterScheme } from './models/FilterScheme';

export interface MyPluginSettings {
	cardsDirectory: string;
	sortType: 'created' | 'modified';
	pinnedFiles: string[];
	openWhenStartObsidian: boolean;
	filterSchemes: FilterScheme[];
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	cardsDirectory: 'cards',
	sortType: 'created',
	pinnedFiles: [],
	openWhenStartObsidian: true,
	filterSchemes: [],
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
			.setName('启动时自动打开面板')
			.setDesc('启用后，Obsidian 启动时会自动打开卡片面板')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.openWhenStartObsidian)
					.onChange(async (value) => {
						this.plugin.settings.openWhenStartObsidian = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('笔记目录')
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
