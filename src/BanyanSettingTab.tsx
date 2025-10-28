import { App, PluginSettingTab, Setting } from 'obsidian';
import BanyanPlugin from './main';
import { i18n } from './utils/i18n';
import { useCombineStore } from './store';
import { CardContentMaxHeightType, FontTheme } from './models/Enum';
import { TopicButton } from './BanyanPluginSettings';

export class BanyanSettingTab extends PluginSettingTab {
	plugin: BanyanPlugin;

	constructor(app: App, plugin: BanyanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Basic settings
		new Setting(containerEl).setName(i18n.t('setting_header_basic')).setHeading();
		this.setupOpenWhenStartObsidianSetting(containerEl);
		this.setupFontThemeSetting(containerEl);

		// Card view settings
		new Setting(containerEl).setName(i18n.t('setting_header_cards')).setHeading();
		this.setupTitleDisplayModeSetting(containerEl);
		this.setupCardContentMaxHeightSetting(containerEl);

		// Statistics settings
		new Setting(containerEl).setName('Statistics').setHeading();
		this.setupStatisticsFolderSettings(containerEl);

		// Topics settings
		new Setting(containerEl).setName('Topics').setHeading();
		this.setupFeaturedNoteSetting(containerEl);
		this.setupSidebarNoteSetting(containerEl);
		this.setupTopicButtonsSetting(containerEl);
	}

	setupFeaturedNoteSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName('Featured Note')
			.setDesc('Path to the note to display in the upper right panel (e.g., "folder/note" without .md)')
			.addText(text => {
				text.setValue(settings.featuredNotePath || "")
					.setPlaceholder('path/to/note')
					.onChange(async (value) => {
						useCombineStore.getState().updateFeaturedNotePath(value);
					});
			});
	}

	setupSidebarNoteSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName('Sidebar Persistent Note')
			.setDesc('Path to the note to display in the left sidebar below topic buttons (e.g., "folder/note" without .md)')
			.addText(text => {
				text.setValue(settings.sidebarNotePath || "")
					.setPlaceholder('path/to/note')
					.onChange(async (value) => {
						useCombineStore.getState().updateSettings({ sidebarNotePath: value });
					});
			});
	}

	setupTopicButtonsSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		
		new Setting(containerEl)
			.setName('Topic Buttons')
			.setDesc('Configure buttons for different topic homepages')
			.addButton(button => {
				button.setButtonText('Add Topic')
					.onClick(() => {
						const newTopic: TopicButton = {
							id: Date.now().toString(),
							name: 'New Topic',
							notePath: ''
						};
						const updated = [...settings.topicButtons, newTopic];
						useCombineStore.getState().updateTopicButtons(updated);
						this.display();
					});
			});

		settings.topicButtons.forEach((topic, index) => {
			const setting = new Setting(containerEl)
				.setClass('topic-button-setting')
				.addButton(button => {
					button.setIcon('up-chevron-glyph')
						.setTooltip('Move up')
						.onClick(() => {
							if (index > 0) {
								const updated = [...settings.topicButtons];
								[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
								useCombineStore.getState().updateTopicButtons(updated);
								this.display();
							}
						});
					if (index === 0) {
						button.setDisabled(true);
					}
				})
				.addButton(button => {
					button.setIcon('down-chevron-glyph')
						.setTooltip('Move down')
						.onClick(() => {
							if (index < settings.topicButtons.length - 1) {
								const updated = [...settings.topicButtons];
								[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
								useCombineStore.getState().updateTopicButtons(updated);
								this.display();
							}
						});
					if (index === settings.topicButtons.length - 1) {
						button.setDisabled(true);
					}
				})
				.addText(text => {
					text.setValue(topic.name)
						.setPlaceholder('Topic name')
						.onChange(async (value) => {
							const updated = [...settings.topicButtons];
							updated[index].name = value;
							useCombineStore.getState().updateTopicButtons(updated);
						});
				})
				.addText(text => {
					text.setValue(topic.notePath)
						.setPlaceholder('path/to/note')
						.onChange(async (value) => {
							const updated = [...settings.topicButtons];
							updated[index].notePath = value;
							useCombineStore.getState().updateTopicButtons(updated);
						});
				})
				.addButton(button => {
					button.setButtonText('Delete')
						.setWarning()
						.onClick(() => {
							const updated = settings.topicButtons.filter((_, i) => i !== index);
							useCombineStore.getState().updateTopicButtons(updated);
							this.display();
						});
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

	setupTitleDisplayModeSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_title_display_mode_name'))
			.setDesc(i18n.t('setting_title_display_mode_desc'))
			.addToggle(toggle => {
				toggle.setValue(settings.titleDisplayMode !== 'none')
					.onChange(async (value) => {
						useCombineStore.getState().updateTitleDisplayMode(value ? 'fileOnly' : 'none');
					});
			});
	}

	setupCardContentMaxHeightSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName('Card Height')
			.setDesc('Maximum height for card content')
			.addDropdown(dropdown => {
				dropdown.addOption('none', 'No limit')
					.addOption('normal', 'Normal')
					.addOption('medium', 'Medium')
					.addOption('large', 'Large')
					.setValue(settings.cardContentMaxHeight || 'normal')
					.onChange(async (value) => {
						useCombineStore.getState().updateCardContentMaxHeight(value as CardContentMaxHeightType);
					});
			});
	}

	setupFontThemeSetting(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		new Setting(containerEl)
			.setName(i18n.t('setting_font_theme_name'))
			.setDesc(i18n.t('setting_font_theme_desc'))
			.addDropdown(dropdown => {
				dropdown.addOption('normal', i18n.t('setting_font_theme_normal'))
					.addOption('handwriting', 'Handwriting')
					.setValue(settings.fontTheme || 'normal')
					.onChange(async (value) => {
						useCombineStore.getState().updateFontTheme(value as FontTheme);
					});
			});
	}

	setupStatisticsFolderSettings(containerEl: HTMLElement) {
		const settings = useCombineStore.getState().settings;
		
		containerEl.createEl('h3', { text: 'Statistics Folders' });
		containerEl.createEl('p', { 
			text: 'Configure folders to track in the statistics panel',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
			.setName('Papers Folder')
			.setDesc('Folder path to track for Papers statistics')
			.addText(text => text
				.setPlaceholder('papers')
				.setValue(settings.papersFolder || 'papers')
				.onChange(async (value) => {
					useCombineStore.getState().updateSettings({ papersFolder: value });
				}));

		new Setting(containerEl)
			.setName('Chess Folder')
			.setDesc('Folder path to track for Chess statistics')
			.addText(text => text
				.setPlaceholder('chess')
				.setValue(settings.chessFolder || 'chess')
				.onChange(async (value) => {
					useCombineStore.getState().updateSettings({ chessFolder: value });
				}));

		new Setting(containerEl)
			.setName('Russian Folder')
			.setDesc('Folder path to track for Russian statistics')
			.addText(text => text
				.setPlaceholder('russian')
				.setValue(settings.russianFolder || 'russian')
				.onChange(async (value) => {
					useCombineStore.getState().updateSettings({ russianFolder: value });
				}));

		new Setting(containerEl)
			.setName('Russian Vocab File')
			.setDesc('Optional: explicit path to the russian vocab file to count lines from (any extension allowed; e.g., "russian/vocab.txt")')
			.addText(text => text
				.setPlaceholder('russian/vocab')
				.setValue(settings.russianVocabPath || '')
				.onChange(async (value) => {
					useCombineStore.getState().updateSettings({ russianVocabPath: value });
				}));

		new Setting(containerEl)
			.setName('Chess Vocab File')
			.setDesc('Optional: explicit path to the chess vocab file to count lines from (any extension allowed; e.g., "chess/vocab.txt")')
			.addText(text => text
				.setPlaceholder('chess/vocab')
				.setValue(settings.chessVocabPath || '')
				.onChange(async (value) => {
					useCombineStore.getState().updateSettings({ chessVocabPath: value });
				}));
	}
}

