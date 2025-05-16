import { App, Platform, PluginSettingTab, Setting } from 'obsidian';
import BanyanPlugin from './main';
import { createRoot } from 'react-dom/client';
import { StrictMode, useState, } from 'react';
import { TagFilterGroup } from './components/TagFilterGroup';
import { i18n } from './utils/i18n';

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
			.setName(i18n.t('setting_note_directory_name'))
			.setDesc(i18n.t('setting_note_directory_desc'))
			.addText(async text => {
				const folders = await this.plugin.fileUtils.getAllFolders();
				this.createFolderSuggest(text.inputEl, folders, async (folder) => {
					text.setValue(folder);
					this.plugin.settings.cardsDirectory = folder;
					await this.plugin.saveSettings();
				});
				text.setPlaceholder(i18n.t('setting_note_directory_placeholder'))
					.setValue(this.plugin.settings.cardsDirectory || "")
					.onChange(async (value) => {
						this.plugin.settings.cardsDirectory = value;
						await this.plugin.saveSettings();
					});
			});
	}

	setupOpenWhenStartObsidianSetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName(i18n.t('setting_on_open_name'))
			.setDesc(i18n.t('setting_on_open_desc'))
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
			.setName(i18n.t('setting_show_title_name'))
			.setDesc(i18n.t('setting_show_title_desc'))
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
			.setName(i18n.t('setting_col_nums_name'))
			.setDesc(i18n.t('setting_col_nums_desc'))
			.addDropdown(dropdown => {
				dropdown.addOption('1', i18n.t('setting_col_nums_1_col'))
					.addOption('2', i18n.t('setting_col_nums_2_col'))
					.setValue(this.plugin.settings.cardsColumns.toString())
					.onChange(async (value) => {
						this.plugin.settings.cardsColumns = parseInt(value);
						await this.plugin.saveSettings();
					});
			});
	}

	setupRandomNoteSetting(containerEl: HTMLElement) {
		const randomSetting = new Setting(containerEl)
			.setName(i18n.t('setting_random_review_name'))
			.setDesc(i18n.t('setting_random_review_desc'));
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
