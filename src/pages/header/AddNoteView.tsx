import { App, WorkspaceLeaf, MarkdownView, Editor } from "obsidian";
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
  const [editor, setEditor] = useState<Editor | null>(null);

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
        setEditor(leaf.view.editor);
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
    <div className={"add-note-container" + (focused ? " add-note-container--focusd" : "")} onClick={(e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const tagName = e.target.tagName.toUpperCase();
      if (tagName !== 'INPUT' && tagName!== 'BUTTON' && tagName !== 'SVG' ) { // 分别是标签输入框、按钮、按钮上的图标
        editor?.focus();
      }
    } } >
      {showPlaceholder && <div className="add-note-placeholder">{i18n.t('editor_content_placeholder')}</div>}
      <div ref={ref} className="add-note-content" />
      <div className="add-note-footer">
        <div className="add-note-tag-input-container"><TagInput tags={tags} onChange={setTags} allTags={allTags} placeholder={i18n.t('editor_tags_placeholder')} allowCreate={true}
        /></div>
        <button className={`add-note-send-button ${focused ? 'clickable-icon' : ''}`}
          onClick={async () => {
            const file = await plugin.fileUtils.getPlaceholderFile();
            const body = await plugin.fileUtils.readFileContent(file);
            if (body.trim().length === 0 && tags.length === 0) return;
            await plugin.fileUtils.addFile(body, tags, false);
            await plugin.fileUtils.modifyFileContent(file, '');
            setTags([]);
            onAdd();
          }}><Icon name="send-horizontal" size="l" color="var(--text-on-accent)" /></button>
      </div>
    </div>
  );
};

export default AddNoteView;