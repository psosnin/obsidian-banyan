import { Plugin, WorkspaceLeaf } from 'obsidian';
import { BanyanPluginSettings, DEFAULT_SETTINGS, CUR_SETTINGS_VERSION } from './BanyanPluginSettings';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './pages/CardDashboard';
import { BanyanSettingTab } from './BanyanSettingTab';
import { FileUtils } from './utils/fileUtils';

export default class BanyanPlugin extends Plugin {
	settings: BanyanPluginSettings;
	fileUtils: FileUtils;

	async onload() {
		await this.loadSettings();

		this.fileUtils = new FileUtils(this.app, this);

		// 注册自定义 view
		this.registerView(
			CARD_DASHBOARD_VIEW_TYPE,
			(leaf) => new CardDashboard(leaf, this)
		)

		// 添加卡片笔记 命令和按钮
		this.addCommand({
			id: 'add-card-note',
			name: '添加卡片笔记',
			callback: async () => {
				await this.fileUtils.addFile();
			}
		});
		const AddCardIconEl = this.addRibbonIcon('lightbulb', '添加卡片笔记', async (evt: MouseEvent) => {
			await this.fileUtils.addFile();
		});
		AddCardIconEl.addClass('my-plugin-ribbon-class');

		// 打开笔记面板 命令和按钮
		this.addCommand({
			id: 'open-dashboard',
			name: '打开笔记面板',
			callback: () => this.activateView(CARD_DASHBOARD_VIEW_TYPE),
		});
		const CardIconEl = this.addRibbonIcon('wallet-cards', '打开笔记面板', () => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});
		CardIconEl.addClass('my-plugin-ribbon-class');

		// 打开随机笔记 命令和按钮
		this.addCommand({
			id: 'open-random-note',
			name: '打开随机笔记',
			callback: () => {
				this.fileUtils.openRandomFile();
			}
		});
		const RandomNoteIconEl = this.addRibbonIcon('dice', '打开随机笔记', () => {
			this.fileUtils.openRandomFile();
		});
		RandomNoteIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BanyanSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.updateSettingIfNeeded();
			// 启动时自动打开自定义面板
			if (this.settings.openWhenStartObsidian) {
				this.activateView(CARD_DASHBOARD_VIEW_TYPE);
			}
		});
	}

	onunload() {
		this.app.workspace.getLeavesOfType(CARD_DASHBOARD_VIEW_TYPE).forEach(leaf => leaf.detach());
	}

	updateSettingIfNeeded = () => {
		if (!this.settings.settingsVersion) {
			this.settings.settingsVersion = CUR_SETTINGS_VERSION;
		}
		// 以后版本更新时，在此处添加更新逻辑
		this.updateSavedFile();
		this.saveSettings();
	}

	updateSavedFile = () => {
		const _allFiles = this.fileUtils.getAllFiles().map((file) => file.getID());
		const allFiles = new Set(_allFiles);
		this.settings.viewSchemes = [...this.settings.viewSchemes.map((scheme) => {
			const newFiles = [...scheme.files.filter((file) => allFiles.has(file))];
			const newPinned = [...scheme.pinned.filter((file) => allFiles.has(file))];
			return { ...scheme, files: newFiles, pinned: newPinned };
		})];
		this.settings.filterSchemes = [...this.settings.filterSchemes.map((scheme) => {
			const newPinned = [...scheme.pinned.filter((file) => allFiles.has(file))];
			return { ...scheme, pinned: newPinned };
		})];
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 使得打开的视图唯一
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

