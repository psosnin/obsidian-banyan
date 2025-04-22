import { App, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, TFolder, WorkspaceLeaf } from 'obsidian';
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

		// 添加卡片笔记 命令
		this.addCommand({
			id: 'add-card-note',
			name: '添加卡片笔记',
			callback: async () => {
				await this.addCardNote();
			}
		});

		// 添加 ribbonIcon，点击执行添加卡片笔记
		const AddCardIconEl = this.addRibbonIcon('lightbulb', '添加卡片笔记', async (evt: MouseEvent) => {
			await this.addCardNote();
		});
		AddCardIconEl.addClass('my-plugin-ribbon-class');

		// 添加上下文笔记 命令
		this.addCommand({
			id: 'add-context-note',
			name: '添加上下文笔记',
			callback: async () => {
				await this.addContextNote();
			}
		});

		// 添加 ribbonIcon，点击执行添加上下文笔记
		const AddContextIconEl = this.addRibbonIcon('file-plus-2', '添加上下文笔记', async (evt: MouseEvent) => {
			await this.addContextNote();
		});
		AddContextIconEl.addClass('my-plugin-ribbon-class');

		// This creates an icon in the left ribbon.
		const NoteIconEl = this.addRibbonIcon('notepad-text', '打开上下文笔记面板', async (evt: MouseEvent) => {
			this.activateView(CONTEXT_DASHBOARD_VIEW_TYPE);
		});
		NoteIconEl.addClass('my-plugin-ribbon-class');
		const CardIconEl = this.addRibbonIcon('wallet-cards', '打开卡片笔记面板', async (evt: MouseEvent) => {
			this.activateView(CARD_DASHBOARD_VIEW_TYPE);
		});
		CardIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Tex');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MySettingTab(this.app, this));

	}

	// 添加卡片笔记命令的实现
	async addCardNote() {
		const dir = this.settings.cardsDirectory;
		const filePath = await this.getCardFilePath(dir);
		const content = `---\ntags: \n---\n`;
		const file = await this.app.vault.create(filePath, content);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file, { active: true, state: { mode: 'source' }, });
		this.app.workspace.setActiveLeaf(leaf, { focus: true });
	}

	async addContextNote() {
		const dir = this.settings.notesDirectory;
		const filePath = await this.getCardFilePath(dir);
		const content = `---\ntitle:\ntags: \n---\n`;
		const file = await this.app.vault.create(filePath, content);
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

