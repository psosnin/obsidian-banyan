import { Plugin, WorkspaceLeaf } from 'obsidian';
import { BanyanPluginSettings, DEFAULT_SETTINGS, CUR_SETTINGS_VERSION } from './BanyanPluginSettings';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './pages/SimplifiedCardDashboard';
import { BanyanSettingTab } from './BanyanSettingTab';
import { FileUtils } from './utils/fileUtils';
import { i18n } from './utils/i18n';

export default class BanyanPlugin extends Plugin {
	settings: BanyanPluginSettings;
	fileUtils: FileUtils;

	async onload() {
		await this.loadSettings();

		// Initialize store
		const { useCombineStore } = await import('./store');
		useCombineStore.getState().setupPlugin(this);

		this.fileUtils = new FileUtils(this.app, this);

		// Register custom view
		this.registerView(
CARD_DASHBOARD_VIEW_TYPE,
(leaf) => new CardDashboard(leaf, this)
		)

		// Open dashboard command and button
		this.addCommand({
id: 'open-dashboard',
name: i18n.t('open_dashboard'),
callback: () => this.activateView(CARD_DASHBOARD_VIEW_TYPE),
		});
		this.addRibbonIcon('wallet-cards', i18n.t('open_dashboard'), () => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});

		// Add settings tab
		this.addSettingTab(new BanyanSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.updateSettingIfNeeded();
			// Auto-open dashboard on startup
			if (this.settings.openWhenStartObsidian) {
				this.activateView(CARD_DASHBOARD_VIEW_TYPE);
			}
		});
	}

	onunload() {
		// do nothing
	}

	updateSettingIfNeeded = async () => {
		// Handle settings version upgrades
		if (this.settings.settingsVersion < 7) {
			// Migrating from old version - initialize new settings
			if (!this.settings.topicButtons) {
				this.settings.topicButtons = [];
			}
			if (!this.settings.featuredNotePath) {
				this.settings.featuredNotePath = '';
			}
		}
		
		this.settings.settingsVersion = CUR_SETTINGS_VERSION;
		this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Ensure the view is unique
	activateView(viewType: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
			workspace.revealLeaf(leaf);
		} else {
			// Our view could not be found in the workspace, create a new leaf in the right sidebar for it
			leaf = workspace.getLeaf(true);
			leaf.setViewState({ type: viewType, active: true }).then(() => leaf && workspace.revealLeaf(leaf));
		}
	}
}
