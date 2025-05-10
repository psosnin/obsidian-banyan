import { App, PluginSettingTab, Setting, TFile } from 'obsidian';
import MyPlugin from './main';
import { getAllFolders, createFolderSuggest, getAllCardFiles } from './utils/fileUtils';
import { getFilesTags } from './utils/tagUtils';
import { createRoot } from 'react-dom/client';
import { StrictMode, useState, } from 'react';
import { TagFilterGroup } from './sidebar/filterScheme/TagFilterGroup';

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
			.setName('笔记目录')
			.setDesc('「卡片面板」的笔记目录')
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

		new Setting(containerEl)
			.setName('启动时自动打开面板')
			.setDesc('启用后，Obsidian 启动时会自动打开「卡片面板」')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.openWhenStartObsidian)
					.onChange(async (value) => {
						this.plugin.settings.openWhenStartObsidian = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('显示标题')
			.setDesc('是否显示卡片视图的标题')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showTitle)
					.onChange(async (value) => {
						this.plugin.settings.showTitle = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('笔记列数')
			.setDesc('当面板足够宽时，最多显示多少列笔记')
			.addDropdown(dropdown => {
				dropdown.addOption('1', '1 列')
					.addOption('2', '2 列')
					.setValue(this.plugin.settings.cardsColumns.toString())
					.onChange(async (value) => {
						this.plugin.settings.cardsColumns = parseInt(value);
						await this.plugin.saveSettings();
					});
			});

		// 随机笔记设置
		const randomSetting = new Setting(containerEl)
			.setName('随机笔记的范围')
			.setDesc('随机回顾「笔记目录」下的笔记，可用标签缩小范围（允许为空）');
		const files = getAllCardFiles(this.plugin);
		const allTags = getFilesTags(this.app, files);

		const root = createRoot(randomSetting.controlEl);
		root.render(
			<StrictMode>
				<this.TagFilterGroupView allTags={allTags} />
			</StrictMode>
		);
	}

	TagFilterGroupView = ({ allTags }: { allTags: string[] }) => {
		const [value, setValue] = useState(this.plugin.settings.randomNoteTagFilter);
		return <TagFilterGroup allTags={allTags} value={value} showLabel={false} onChange={(value) => {
			setValue(value);
			this.plugin.settings.randomNoteTagFilter = value;
			this.plugin.saveSettings().then(() => { });
		}} />;
	}
}
