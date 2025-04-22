// import React from "react";
import { TFile, MarkdownRenderer, Notice, Component, App } from "obsidian";
import * as React from "react";

interface CardNoteProps {
  file: TFile;
  sortType: 'created' | 'modified';
  tags: string[];
  content: string;
  app: App;
  component: Component;
  onDelete: (file: TFile) => void;
  onOpen: (file: TFile) => void;
}

function extractBody(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end !== -1) {
      return md.slice(end + 3).replace(/^\s+/, '');
    }
  }
  return md;
}

const MarkdownContent = ({ app, markdown, sourcePath, component }: {
  app: any, markdown: string, sourcePath: string, component: Component
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      MarkdownRenderer.render(app, markdown, ref.current, sourcePath, component);
    }
  }, [app, markdown, sourcePath]);
  return <div ref={ref} />;
};

const CardNote: React.FC<CardNoteProps> = ({ file, tags, sortType, content, app, component, onDelete, onOpen }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = React.useState(false);

  const isCreated = sortType === 'created';

  React.useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setOverflow(el.scrollHeight > 500);
    }
  }, [content]);
  return (
    <div className="card-note-container">
      <div
        className={"card-note-content" + (overflow ? " card-note-content--overflow" : "")}
        ref={contentRef}
        onDoubleClick={() => onOpen(file)}
      >
        <MarkdownContent
          app={app}
          markdown={extractBody(content)}
          sourcePath={file.path}
          component={component}
        />
      </div>
      <div className="card-note-footer">
        {tags.length > 0 && <div className="card-note-tags"> {tags.map((tag) =>
          <div className="card-note-tag" key={tag}>
            <div className="card-note-tag-content">{tag}</div>
          </div>
        )}</div>}
        <div className="card-note-time">{isCreated ? "创建于" : "编辑于"} {new Date(isCreated ? file.stat.ctime : file.stat.mtime).toLocaleString()}</div>
        <div className="card-note-more">
          <span className="card-note-more-btn" onClick={e => {
            e.stopPropagation();
            const menu = document.createElement('div');
            menu.className = 'card-note-more-menu';
            menu.innerHTML = '<button id="del-btn">删除</button>';
            document.body.appendChild(menu);
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            menu.style.left = rect.right + 'px';
            menu.style.top = rect.top + 'px';
            menu.querySelector('#del-btn')?.addEventListener('click', () => {
              onDelete(file);
              menu.remove();
            });
            const removeMenu = () => { menu.remove(); document.removeEventListener('click', removeMenu) };
            setTimeout(() => document.addEventListener('click', removeMenu), 100);
          }}>···</span>
        </div>
      </div>
    </div>
  );
};

export default CardNote;