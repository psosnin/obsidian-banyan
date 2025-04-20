import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import MyPlugin from "./main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';

export const CARD_DASHBOARD_VIEW_TYPE = "card-dashboard-view";

export class CardDashboardView extends ItemView {
  root: Root | null = null;
  plugin: MyPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CARD_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "卡片笔记 面板";
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
			<StrictMode>
				<this._CardDashboardView />,
			</StrictMode>,
		);
    return ;
  }

  async onClose() {
    // 可在此处清理资源
    this.root?.unmount();
  }

  _CardDashboardView = () => {
    // 获取插件设置中的目录路径
    const dir = this.plugin.settings.cardsDirectory;
    if (!dir) {
      return <div>请先在设置中配置要展示的笔记目录。</div>;
    }

    // 获取 vault 中的所有文件，筛选出指定目录下的 md 文件
    const files = this.app.vault.getFiles();
    const notes = files.filter((file: TFile) => file.path.startsWith(dir) && file.extension === "md");

    if (notes.length === 0) {
      return <div>该目录下没有笔记。</div>;
    }

    const [contents, setContents] = useState<string[]>([]);

    useEffect(() => {
        init();
      }, []);
    
    // 初始化函数
    const init = async () => {
        const contents = await Promise.all(notes.map(async (file: TFile) => {
            return await this.app.vault.cachedRead(file);
        }));
        console.log(contents);
        setContents(contents);
    };
     
    if (contents.length === 0) {
      return <div>该目录下没有笔记。</div>;
    }

    return <ul>
      {contents.map((content: string) => {
        return this.CardView(content);
      })}
      </ul>;
    };

    CardView = (content: string) => {
        // const content = await this.app.vault.cachedRead(file);
        // const properties = this.app.metadataCache.getFileCache(file)?.frontmatter;
        return <li>{content}</li>;
    //   return <li key={file.path}>
    //   <a href="#" onClick={(e) => {
    //     e.preventDefault();
    //     this.app.workspace.openLinkText(file.path, "", false);
    //   }}>
    //     {properties?.title || file.basename} 
    //   </a>
    //   {properties?.tags &&  properties.tags.map((tag: string) => 
    //       <span key={tag}>
    //       <span className="cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-">#</span>
    //       <span className="cm-hashtag cm-hashtag-end cm-meta cm-tag-">{tag}</span>
    //       </span>
    //   )}
    // </li>;  
    };
}

