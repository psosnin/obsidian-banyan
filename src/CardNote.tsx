// import React from "react";
import { TFile, MarkdownRenderer, Notice, Component, App } from "obsidian";
import * as React from "react";

interface CardNoteProps {
  file: TFile;
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

const MarkdownContent = ({app, markdown, sourcePath, component}:{
    app:any, markdown:string, sourcePath:string, component: Component
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

const CardNote: React.FC<CardNoteProps> = ({ file, content, app, component, onDelete, onOpen }) => {
  return (
    <div
      className="card-note"
      style={{background:'#222',color:'#fff',borderRadius:8,padding:16,marginBottom:16,position:'relative',boxShadow:'0 2px 8px #0002',cursor:'pointer'}}
      onDoubleClick={()=>onOpen(file)}
    >
      <div style={{fontSize:12,opacity:0.7,marginBottom:8}}>{new Date(file.stat.mtime).toLocaleString()}</div>
      <div>
        <MarkdownContent
          app={app}
          markdown={extractBody(content)}
          sourcePath={file.path}
          component={component}
        />
      </div>
      <div style={{position:'absolute',top:8,right:8}}>
        <span style={{cursor:'pointer',padding:'2px 8px'}} onClick={e=>{
          e.stopPropagation();
          const menu = document.createElement('div');
          menu.style.position = 'absolute';
          menu.style.background = '#333';
          menu.style.color = '#fff';
          menu.style.padding = '8px 12px';
          menu.style.borderRadius = '6px';
          menu.style.boxShadow = '0 2px 8px #0005';
          menu.innerHTML = '<button id="del-btn">删除</button>';
          document.body.appendChild(menu);
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          menu.style.left = rect.right + 'px';
          menu.style.top = rect.top + 'px';
          menu.querySelector('#del-btn')?.addEventListener('click',()=>{
            onDelete(file);
            menu.remove();
          });
          const removeMenu = ()=>{menu.remove();document.removeEventListener('click',removeMenu)};
          setTimeout(()=>document.addEventListener('click',removeMenu),100);
        }}>···</span>
      </div>
    </div>
  );
};

export default CardNote;