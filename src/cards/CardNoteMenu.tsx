import { Menu, sanitizeHTMLToDom, TFile, Notice, App } from "obsidian";

export interface CardNoteMenuParams {
  event: MouseEvent;
  file: TFile;
  content: string;
  onOpen: (file: TFile) => void;
  onDelete: (file: TFile) => void;
  setPin: (file: TFile, isPinned: boolean) => void;
  isPinned: boolean;
}

export const openCardNoteMoreMenu = ({ event, file, content, onOpen, onDelete, setPin, isPinned }: CardNoteMenuParams) => {
  const menu = new Menu();

  const openNote = () => {
    menu.addItem((item) => {
      item.setTitle("打开");
      item.onClick(() => {
        onOpen(file);
      });
    });
  };
  const pinNote = () => {
    menu.addItem((item) => {
      item.setTitle(isPinned ? "取消置顶" : "置顶");
      item.onClick(() => {
        setPin(file, !isPinned);
      });
    });
  };
  const copyLink = () => {
    menu.addItem((item) => {
      item.setTitle("复制链接");
      item.onClick(() => {
        const url = ` [[${file.path}|MEMO ▶]] `;
        navigator.clipboard.writeText(url);
        new Notice("已复制链接");
      });
    });
  };
  const deleteNote = () => {
    menu.addItem((item) => {
      item.setTitle("删除");
      item.onClick(() => {
        onDelete(file);
      });
    });
  };
  const ctimeInfo = () => {
    menu.addItem((item) => {
      item.setTitle(`创建: ${new Date(file.stat.ctime).toLocaleString()}`);
      item.setDisabled(true);
    });
  };
  const mtimeInfo = () => {
    menu.addItem((item) => {
      item.setTitle(`更新: ${new Date(file.stat.mtime).toLocaleString()}`);
      item.setDisabled(true);
    });
  };

  openNote();
  pinNote();
  copyLink();
  menu.addSeparator();
  deleteNote();
  menu.addSeparator();
  ctimeInfo();
  mtimeInfo();

  menu.showAtMouseEvent(event);
};