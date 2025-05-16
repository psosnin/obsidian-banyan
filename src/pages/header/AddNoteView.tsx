import { App, WorkspaceLeaf, MarkdownView } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "src/components/Icon";
import TagInput from "src/components/TagInput";
import BanyanPlugin from "src/main";
import { i18n } from "src/utils/i18n";

interface AddNoteViewProps {
  app: App;
  plugin: BanyanPlugin;
  onAdd: () => void;
}

const AddNoteView: React.FC<AddNoteViewProps> = ({ app, plugin, onAdd }) => {
  const ref = useRef<HTMLDivElement>(null);
  const leaf: WorkspaceLeaf = new (WorkspaceLeaf as any)(app);
  const [focused, setFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const updateHasContent = useCallback(() => {
    const ele = leaf.view.containerEl.querySelector('.cm-content') as HTMLElement;
    const content = ele?.innerText.trim() ?? '';
    setHasContent(content.length > 0);
  }, [leaf.view.containerEl]);

  useEffect(() => {
    const setupView = async () => {
      if (!ref.current) return;
      try {
        const file = await plugin.fileUtils.getPlaceholderFile();
        await (leaf as WorkspaceLeaf).openFile(file);
        updateHasContent();
        if (!(leaf.view instanceof MarkdownView)) {
          console.log('添加笔记视图初始化失败');
          return;
        }
        await leaf.view.setState(
          { ...leaf.view.getState(), mode: 'source' },
          { history: false })
        ref.current?.empty();
        ref.current?.appendChild(leaf.view.containerEl);
      } catch (e) { console.log('打开文件失败', e) };
    };
    setupView();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(async (mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const targetElement = mutation.target as HTMLElement;
          if (targetElement.classList.contains('cm-editor')) {
            setFocused(targetElement.classList.contains('cm-focused'));
            updateHasContent();
          }
        }
      });
    });

    if (ref.current) {
      observer.observe(ref.current, {
        childList: true,      // 监听子节点增删
        attributes: true, // 监听属性变化
        attributeFilter: ['class'], // 仅监听 class 属性
        subtree: true, // 监听子元素
      });
    }

    return () => observer.disconnect(); // 组件卸载时销毁监听
  }, []);

  const [tags, setTags] = useState<string[]>([]);
  const allTags = useMemo(() => {
    const tags = plugin.fileUtils.getAllFilesTags();
    return tags;
  }, [app, plugin]);

  useEffect(() => {
    setShowPlaceholder(!focused && !hasContent); // 只有在没有焦点且没有内容时显示占位符，否则隐藏占位符
  }, [focused, hasContent]);

  return (
    <div className={"add-note-container" + (focused ? " add-note-container--focusd" : "")} >
      {showPlaceholder && <div style={{ position: 'absolute', left: 32, top: 26, color: 'var(--text-faint)' }}>{i18n.t('editor_content_placeholder')}</div>}
      <div ref={ref} className={"add-note-content"} />
      <div className="add-note-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: 'end' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}><TagInput tags={tags} onChange={setTags} allTags={allTags} placeholder={i18n.t('editor_tags_placeholder')} allowCreate={true}
        /></div>
        <button style={{ padding: "12px 20px", background: focused ? "var(--interactive-accent)" : "var(--background-modifier-hover)" }}
          onClick={async () => {
            const file = await plugin.fileUtils.getPlaceholderFile();
            const body = await plugin.fileUtils.readFileContent(file);
            if (body.trim().length === 0 && tags.length === 0) return;
            const meta = tags.length === 0 ? "" : `---\ntags:\n${tags.map(t => `- ${t}\n`).join('')}---\n`;
            const content = meta + body;
            await plugin.fileUtils.addFile(content, false);
            await plugin.fileUtils.modifyFileContent(file, '');
            setTags([]);
            onAdd();
          }}><Icon name="send-horizontal" size="l" color="white" /></button>
      </div>
    </div>
  );
};

export default AddNoteView;