import { App, Platform, PluginSettingTab, Setting } from 'obsidian';
import BanyanPlugin from './main';
import { i18n } from './utils/i18n';
import FolderSuggest from './components/FolderSuggest';

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
	}

	setupCardsDirectorySetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName(i18n.t('setting_note_directory_name'))
			.setDesc(i18n.t('setting_note_directory_desc'))
			.addText(async text => {
				new FolderSuggest(this.app, text.inputEl, async (value) => {
					text.setValue(value);
					this.plugin.settings.cardsDirectory = value;
					await this.plugin.saveSettings();
				});
				text.setValue(this.plugin.settings.cardsDirectory || "")
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

}
