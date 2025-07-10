import { App, Platform, PluginSettingTab, Setting } from 'obsidian';
import BanyanPlugin from './main';
import { i18n } from './utils/i18n';
import FolderSuggest from './components/FolderSuggest';
import { useCombineStore } from './store';

export class BanyanSettingTab extends PluginSettingTab {
	plugin: BanyanPlugin;

	constructor(app: App, plugin: BanyanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		this.setupOpenWhenStartObsidianSetting(containerEl);
		this.setupCardsDirectorySetting(containerEl);		
		this.setupShowTitleSetting(containerEl);
		this.setupCardsColumnsSetting(containerEl);
        this.setupShowBacklinksSetting(containerEl);
	}

	setupCardsDirectorySetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_note_directory_name'))
			.setDesc(i18n.t('setting_note_directory_desc'))
			.addText(async text => {
				new FolderSuggest(this.app, text.inputEl, async (value) => {
					text.setValue(value);
					useCombineStore.getState().updateCardsDirectory(value);
				});
				text.setValue(settings.cardsDirectory || "")
					.onChange(async (value) => {
						useCombineStore.getState().updateCardsDirectory(value);
					});
			});
	}

	setupOpenWhenStartObsidianSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_on_open_name'))
			.setDesc(i18n.t('setting_on_open_desc'))
			.addToggle(toggle => {
				toggle.setValue(settings.openWhenStartObsidian)
					.onChange(async (value) => {
						useCombineStore.getState().updateOpenWhenStartObsidian(value);
					});
			});
	}

	setupShowTitleSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_show_title_name'))
			.setDesc(i18n.t('setting_show_title_desc'))
			.addToggle(toggle => {
				toggle.setValue(settings.showTitle)
					.onChange(async (value) => {
						useCombineStore.getState().updateShowTitle(value);
					});
			});
	}

	setupCardsColumnsSetting(containerEl: HTMLElement) {
		if (Platform.isMobile) return;
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_col_nums_name'))
			.setDesc(i18n.t('setting_col_nums_desc'))
			.addDropdown(dropdown => {
				dropdown.addOption('1', i18n.t('setting_col_nums_1_col'))
					.addOption('2', i18n.t('setting_col_nums_2_col'))
					.setValue(settings.cardsColumns.toString())
					.onChange(async (value) => {
						useCombineStore.getState().updateCardsColumns(parseInt(value));
					});
			});
	}

    setupShowBacklinksSetting(containerEl: HTMLElement) {
        const settings = useCombineStore.getState().settings;
        new Setting(containerEl)
            .setName(i18n.t('setting_show_backlinks_name'))
            .setDesc(i18n.t('setting_show_backlinks_desc'))
            .addToggle(toggle => {
                toggle.setValue(settings.showBacklinksInCardNote ?? false)
                    .onChange(async (value) => {
                        useCombineStore.getState().updateShowBacklinksInCardNote(value);
                    });
            });
    }

}
