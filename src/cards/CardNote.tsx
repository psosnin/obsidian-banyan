// import React from "react";
import { TFile, MarkdownRenderer, Notice, Component, App, setIcon } from "obsidian";
import * as React from "react";
import { openCardNoteMoreMenu } from "./CardNoteMenu";
import { Icon } from "../components/Icon";

interface CardNoteProps {
  file: TFile;
  sortType: 'created' | 'modified';
  tags: string[];
  content: string;
  app: App;
  component: Component;
  onDelete: (file: TFile) => void;
  onOpen: (file: TFile) => void;
  setPin: (file: TFile, isPinned: boolean) => void;
  isPinned: boolean;
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

const CardNote: React.FC<CardNoteProps> = ({ file, tags, sortType, content, app, component,
  onDelete, onOpen, setPin, isPinned }) => {
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
    <div className="card-note-container" onDoubleClick={(e) => {
      onOpen(file);
      e.preventDefault();
    }}>
      <div className="card-note-header">
        <div className="card-note-time">{isPinned ? "置顶 · " : ""}{isCreated ? "创建于" : "更新于"} {new Date(isCreated ? file.stat.ctime : file.stat.mtime).toLocaleString()}</div>
        {tags.length > 0 && <div className="card-note-tags"> {tags.map((tag) =>
          <div className="card-note-tag" key={tag}>
            <div className="card-note-tag-content">{tag}</div>
          </div>
        )}</div>}
        <div className="card-note-more">
          <button className="clickable-icon"
            children={<Icon name='ellipsis'/>}
            onClick={(e) => openCardNoteMoreMenu({ event: e.nativeEvent, file, content, onOpen, onDelete, setPin, isPinned })}
          />
        </div>
      </div>
      <div
        className={"card-note-content" + (overflow ? " card-note-content--overflow" : "")}
        ref={contentRef}>
        <MarkdownContent
          app={app}
          markdown={extractBody(content)}
          sourcePath={file.path}
          component={component}
        />
      </div>
    </div>
  );
};

export default CardNote;