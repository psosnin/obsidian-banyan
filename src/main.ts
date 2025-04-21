import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, TFolder, WorkspaceLeaf } from 'obsidian';
import { ContextDashboardView, CONTEXT_DASHBOARD_VIEW_TYPE } from "./ContextDashboardView";
import { MyPluginSettings, MySettingTab, DEFAULT_SETTINGS } from './MySettingTab';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboardView } from './CardDashboard';

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 注册自定义 view
		this.registerView(
			CONTEXT_DASHBOARD_VIEW_TYPE,
			(leaf) => new ContextDashboardView(leaf, this)
		);
		this.registerView(
			CARD_DASHBOARD_VIEW_TYPE,
			(leaf) => new CardDashboardView(leaf, this)
		)

		// This creates an icon in the left ribbon.
		const NoteIconEl = this.addRibbonIcon('notepad-text', 'Open Context Notes Dashboard', async (evt: MouseEvent) => {
			this.activateView(CONTEXT_DASHBOARD_VIEW_TYPE);
		});
		NoteIconEl.addClass('my-plugin-ribbon-class');
		const CardIconEl = this.addRibbonIcon('wallet-cards', 'Open Card Notes Dashboard', async (evt: MouseEvent) => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});
		CardIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Tex');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MySettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.app.workspace.getLeavesOfType(CONTEXT_DASHBOARD_VIEW_TYPE).forEach(leaf => leaf.detach());
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 使得打开的视图唯一
	async activateView(viewType: string) {
		const { workspace } = this.app;
	
		var leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(viewType);
	
		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf in the right sidebar for it
			leaf = workspace.getLeaf(true);
			await leaf.setViewState({ type: viewType, active: true });
		}
		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}

