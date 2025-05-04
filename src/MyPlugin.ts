import { normalizePath, Plugin, WorkspaceLeaf } from 'obsidian';
import { MyPluginSettings, MySettingTab, DEFAULT_SETTINGS } from './MySettingTab';
import { CARD_DASHBOARD_VIEW_TYPE, CardDashboard } from './CardDashboard';
import { DefaultFilterSchemeID, getDefaultFilterScheme } from './models/FilterScheme';

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

	// 迁移置顶数据：从基于路径到基于创建时间戳
	migratePinnedData = () => {
		const allFiles = this.app.vault.getMarkdownFiles();
		const pathToIDMap = new Map<string, number>();

		// 创建文件路径到创建时间戳的映射
		allFiles.forEach(file => {
			pathToIDMap.set(file.path, file.getID());
		});

		// 迁移ViewScheme中的pinned数据
		this.settings.viewSchemes = this.settings.viewSchemes.map(scheme => {
			// 检查pinned是否为字符串数组（旧格式）
			if (scheme.pinned.length > 0 && typeof scheme.pinned[0] === 'string') {
				// 将路径转换为创建时间戳
				const newPinned = (scheme.pinned as unknown as string[])
					.map(path => pathToIDMap.get(path))
					.filter(ctime => ctime !== undefined) as number[];
				return { ...scheme, pinned: newPinned };
			}
			if (scheme.files.length > 0 && typeof scheme.files[0] === 'string') {
				// 将路径转换为创建时间戳
				const newFiles = (scheme.files as unknown as string[])
					.map(path => pathToIDMap.get(path))
					.filter(fileID => fileID !== undefined) as number[];
				return { ...scheme, files: newFiles };
			}
			return scheme;
		});

		// 迁移FilterScheme中的pinned数据
		this.settings.filterSchemes = this.settings.filterSchemes.map(scheme => {
			// 检查pinned是否为字符串数组（旧格式）
			if (scheme.pinned.length > 0 && typeof scheme.pinned[0] === 'string') {
				// 将路径转换为创建时间戳
				const newPinned = (scheme.pinned as unknown as string[])
					.map(path => pathToIDMap.get(path))
					.filter(ctime => ctime !== undefined) as number[];
				return { ...scheme, pinned: newPinned };
			}
			return scheme;
		});
	}

	updateViewSchemes = () => {
		const allFiles = this.app.vault.getMarkdownFiles().map((file) => file.getID());
		this.settings.viewSchemes = [...this.settings.viewSchemes.map((scheme) => {
			const newFiles = [...scheme.files.filter((file) => allFiles.includes(file))];
			const newPinned = [...scheme.pinned.filter((file) => allFiles.includes(file))];
			return { ...scheme, files: newFiles, pinned: newPinned };
		})];
	}

	updateFilterSchemes = () => {
		// 旧版本可能没有pinned属性，需要初始化
		this.settings.filterSchemes = [...this.settings.filterSchemes.map((scheme) => {
			if (scheme.pinned) return scheme;
			return { ...scheme, pinned: [] };
		})];
		// 添加默认过滤，旧版本可能没有默认过滤
		if (!this.settings.filterSchemes.find((scheme) => scheme.id == DefaultFilterSchemeID)) {
			this.settings.filterSchemes = [getDefaultFilterScheme([]), ...this.settings.filterSchemes];
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// 先迁移置顶数据，从基于路径到基于创建时间戳
		this.migratePinnedData();
		this.updateViewSchemes();
		this.updateFilterSchemes();
		this.saveSettings();
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

