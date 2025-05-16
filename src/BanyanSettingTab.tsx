import { App, Platform, PluginSettingTab, Setting } from 'obsidian';
import BanyanPlugin from './main';
import { createRoot } from 'react-dom/client';
import { StrictMode, useState, } from 'react';
import { TagFilterGroup } from './components/TagFilterGroup';

export class BanyanSettingTab extends PluginSettingTab {
	plugin: BanyanPlugin;

	constructor(app: App, plugin: BanyanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.setupCardsDirectorySetting(containerEl);
		this.setupOpenWhenStartObsidianSetting(containerEl);
		this.setupShowTitleSetting(containerEl);
		this.setupCardsColumnsSetting(containerEl);
		this.setupRandomNoteSetting(containerEl);
	}

	setupCardsDirectorySetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('笔记目录')
			.setDesc('「卡片面板」的笔记目录')
			.addText(async text => {
				const folders = await this.plugin.fileUtils.getAllFolders();
				this.createFolderSuggest(text.inputEl, folders, async (folder) => {
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

	setupOpenWhenStartObsidianSetting(containerEl: HTMLElement) {
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
	}

	setupShowTitleSetting(containerEl: HTMLElement) {
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
	}

	setupCardsColumnsSetting(containerEl: HTMLElement) {
		if (Platform.isMobile) return;
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
	}

	setupRandomNoteSetting(containerEl: HTMLElement) {
		const randomSetting = new Setting(containerEl)
			.setName('随机笔记的范围')
			.setDesc('随机回顾「笔记目录」下的笔记）');
		const allTags = this.plugin.fileUtils.getAllFilesTags();
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

	createFolderSuggest(
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
}
