import { normalizePath, Plugin, WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { BanyanPluginSettings, DEFAULT_SETTINGS, CUR_SETTINGS_VERSION } from './BanyanPluginSettings';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './CardDashboard';
import { BanyanSettingTab } from './BanyanSettingTab';
import { getAllCardFiles } from './utils/fileUtils';

export default class BanyanPlugin extends Plugin {
	settings: BanyanPluginSettings;

	async onload() {
		await this.loadSettings();

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
				await this.addCardNote();
			}
		});
		const AddCardIconEl = this.addRibbonIcon('lightbulb', '添加卡片笔记', async (evt: MouseEvent) => {
			await this.addCardNote();
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
				this.openRandomNote();
			}
		});
		const RandomNoteIconEl = this.addRibbonIcon('dice', '打开随机笔记', () => {
			this.openRandomNote();
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

	async addCardNote() {
		await this.addNote({});
	}

	// 打开随机笔记
	openRandomNote() {
		const files = getAllCardFiles(this);
		const filteredFiles = this.filterFilesByTags(files);
		if (!files || filteredFiles.length === 0) {
			new Notice('没有找到任何笔记');
			return;
		}

		// 随机选择一个笔记
		const randomIndex = Math.floor(Math.random() * filteredFiles.length);
		const randomFile = filteredFiles[randomIndex];

		// 打开笔记
		const leaf = this.app.workspace.getLeaf(false);
		leaf.openFile(randomFile, { active: true }).then(() => this.app.workspace.setActiveLeaf(leaf, { focus: true }));
		// this.app.workspace.openLinkText(randomFile.path, '', false);
	}

	// 根据标签筛选文件
	filterFilesByTags(files: TFile[]) {
		const { or, not } = this.settings.randomNoteTagFilter;

		return files.filter(file => {
			const fileTags = file.getTags(this.app);

			// 检查排除标签
			if (not.length > 0 && not.some(tag => fileTags.includes(tag))) {
				return false;
			}

			// 如果没有设置包含标签，则返回所有不包含排除标签的文件
			if (or.every(row => row.length === 0)) {
				return true;
			}

			// 检查包含标签（OR 关系）
			return or.some(row => {
				// 如果行为空，则跳过
				if (row.length === 0) return false;
				// 行内标签是 AND 关系
				return row.every(tag => fileTags.includes(tag));
			});
		});
	}

	async addNote({content, open = true}:{content?: string, open?: boolean}) {
		const filePath = await this.getCardFilePath();
		const _content = content ?? `---\ntags: \n---\n`;
		const file = await this.app.vault.create(filePath, _content);
		if (!open) return;
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file, { active: true, state: { mode: 'source' }, });
		this.app.workspace.setActiveLeaf(leaf, { focus: true });
	}

	async getCardFilePath() {
		const dir = this.settings.cardsDirectory;
		const now = new Date();
		const year = now.getFullYear();
		const quarter = Math.floor((now.getMonth() + 3) / 3);
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const hour = now.getHours().toString().padStart(2, '0');
		const minute = now.getMinutes().toString().padStart(2, '0');
		const second = now.getSeconds().toString().padStart(2, '0');
		const folderPath = `${dir}/${year}年/${quarter}季度/${month}月/${day}日`;
		await this.ensureDirectoryExists(folderPath);
		const fileName = `${year}-${month}-${day} ${hour}-${minute}-${second}.md`;
		const filePath = normalizePath(`${folderPath}/${fileName}`);
		return filePath;
	}

	async ensureDirectoryExists(dir: string) {
		const normalizedPath = normalizePath(dir);
		if (!this.app.vault.getAbstractFileByPath(normalizedPath)) {
			await this.app.vault.createFolder(normalizedPath);
		}
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
		const _allFiles = getAllCardFiles(this).map((file) => file.getID());
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

