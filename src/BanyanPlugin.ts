import { Plugin, WorkspaceLeaf } from 'obsidian';
import { BanyanPluginSettings, DEFAULT_SETTINGS, CUR_SETTINGS_VERSION } from './BanyanPluginSettings';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './pages/CardDashboard';
import { BanyanSettingTab } from './BanyanSettingTab';
import { FileUtils } from './utils/fileUtils';
import { i18n } from './utils/i18n';
import { TagFilter } from './models/TagFilter';
import { ensureFileID } from './models/FileInfo';

export default class BanyanPlugin extends Plugin {
	settings: BanyanPluginSettings;
	fileUtils: FileUtils;

	async onload() {
		await this.loadSettings();

		// 初始化 store
		const { useCombineStore } = await import('./store');
		useCombineStore.getState().setupPlugin(this);

		this.fileUtils = new FileUtils(this.app, this);

		// 注册自定义 view
		this.registerView(
			CARD_DASHBOARD_VIEW_TYPE,
			(leaf) => new CardDashboard(leaf, this)
		)

		// 添加卡片笔记 命令和按钮
		this.addCommand({
			id: 'add-card-note',
			name: i18n.t('add_card_note'),
			callback: async () => {
				await this.fileUtils.addFile();
			}
		});
		const AddCardIconEl = this.addRibbonIcon('lightbulb', i18n.t('add_card_note'), async (evt: MouseEvent) => {
			await this.fileUtils.addFile();
		});
		AddCardIconEl.addClass('my-plugin-ribbon-class');

		// 打开笔记面板 命令和按钮
		this.addCommand({
			id: 'open-dashboard',
			name: i18n.t('open_dashboard'),
			callback: () => this.activateView(CARD_DASHBOARD_VIEW_TYPE),
		});
		const CardIconEl = this.addRibbonIcon('wallet-cards', i18n.t('open_dashboard'), () => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});
		CardIconEl.addClass('my-plugin-ribbon-class');

		// 打开随机笔记 命令和按钮
		this.addCommand({
			id: 'open-random-note',
			name: i18n.t('open_random_note'),
			callback: () => {
				this.fileUtils.openRandomFile();
			}
		});
		const RandomNoteIconEl = this.addRibbonIcon('dice', i18n.t('open_random_note'), () => {
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

	updateSettingIfNeeded = async () => {
		// *** 版本更新时，在以下添加更新逻辑 ***
		if (this.settings.settingsVersion < 2) {
			const getNewFilterIfNeeded = (tf: TagFilter) => {
				return tf.noTag !== undefined ? tf : { ...tf, notag: 'unlimited' };
			};
			this.settings.filterSchemes = [...this.settings.filterSchemes.map((scheme) => {
				return { ...scheme, tagFilter: getNewFilterIfNeeded(scheme.tagFilter) };
			})];
			this.settings.randomNoteTagFilter = getNewFilterIfNeeded(this.settings.randomNoteTagFilter);
		};
		if (this.settings.settingsVersion < CUR_SETTINGS_VERSION) { // CUR_SETTINGS_VERSION is 3
			this.settings.filterSchemes = [...this.settings.filterSchemes.map((scheme) => {
				return scheme.parentId === undefined ? { ...scheme, parentId: null } : scheme;
			})];
		};
		// *** 版本更新时，在以上添加更新逻辑 ***
		this.settings.settingsVersion = CUR_SETTINGS_VERSION;
		await this.ensureAllFileID();
		this.updateSavedFile();
		this.saveSettings();
	}

	ensureAllFileID = async () => {
		let cnt = Math.floor(Math.random() * 1000);
		const allFiles = this.fileUtils.getAllRawFiles();
		for (const file of allFiles) {
			await ensureFileID(file, this.app, cnt);
			cnt = cnt >= 999 ? 1 : cnt + 1;
		}
	}

	updateSavedFile = () => {
		const _allFiles = this.fileUtils.getAllFiles().map((f) => f.id);
		if (_allFiles.length === 0) return; // 防止获取不到文件，却清空数据的情况
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

