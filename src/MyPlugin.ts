import { App, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, TFolder, WorkspaceLeaf } from 'obsidian';
import { MyPluginSettings, MySettingTab, DEFAULT_SETTINGS } from './MySettingTab';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './CardDashboard';

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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
		const CardIconEl = this.addRibbonIcon('wallet-cards', '打开笔记面板', async (evt: MouseEvent) => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});
		CardIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MySettingTab(this.app, this));

		// 启动时自动打开自定义面板
		if (this.settings.openWhenStartObsidian) {
			if ((this.app as any).workspace.layoutReady) {
				this.activateView(CARD_DASHBOARD_VIEW_TYPE);
			} else {
				(this.app as any).workspace.on("layout-ready", () => {
					this.activateView(CARD_DASHBOARD_VIEW_TYPE);
				});
			}
		}
	}

	async addCardNote() {
		await this.addNote(this.settings.cardsDirectory);
	}

	async addNote(dir: string, content?: string) {
		const filePath = await this.getCardFilePath(dir);
		const _content = content ?? `---\ntags: \n---\n`;
		const file = await this.app.vault.create(filePath, _content);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file, { active: true, state: { mode: 'source' }, });
		this.app.workspace.setActiveLeaf(leaf, { focus: true });
	}

	async getCardFilePath(dir: string) {
		const now = new Date();
		const year = now.getFullYear();
		const quarter = Math.floor((now.getMonth() + 3) / 3);
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const hour = now.getHours().toString().padStart(2, '0');
		const minute = now.getMinutes().toString().padStart(2, '0');
		const second = now.getSeconds().toString().padStart(2, '0');
		const folderPath = `${dir}/${year}年/${quarter}季度/${month}月/${day}日`;
		const folders = folderPath.split("/");
		let currentPath = "";
		for (const folder of folders) {
			currentPath = currentPath ? `${currentPath}/${folder}` : folder;
			if (!this.app.vault.getAbstractFileByPath(currentPath)) {
				await this.app.vault.createFolder(currentPath);
			}
		}
		const fileName = `${year}-${month}-${day} ${hour}-${minute}-${second}.md`;
		const filePath = normalizePath(`${folderPath}/${fileName}`);
		return filePath;
	}

	onunload() {
		this.app.workspace.getLeavesOfType(CARD_DASHBOARD_VIEW_TYPE).forEach(leaf => leaf.detach());
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

