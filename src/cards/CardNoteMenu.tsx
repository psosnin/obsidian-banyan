import { Menu, TFile, Notice } from "obsidian";

export interface CardNoteMenuParams {
  event: MouseEvent;
  file: TFile;
  isInView: boolean;
  isPinned: boolean;
  onOpen: (file: TFile) => void;
  onDelete: (file: TFile) => void;
  setPin: (file: TFile, isPinned: boolean) => void;
  onImportToView: (file: TFile) => void;
  onRemoveFromView: (file: TFile) => void;
}

export const openCardNoteMoreMenu = ({ 
  event, file, isInView, isPinned,
  onOpen, onDelete, setPin, onImportToView, onRemoveFromView
}: CardNoteMenuParams) => {
  const menu = new Menu();

  const openNote = () => {
    menu.addItem((item) => {
      item.setTitle("打开");
      item.onClick(() => {
        onOpen(file);
      });
    });
  };
  const removeFromView = () => {
    menu.addItem((item) => {
      item.setTitle("从当前视图移除");
      item.onClick(() => {
        onRemoveFromView(file);
      });
    });
  };
  const addToView = () => {
    menu.addItem((item) => {
      item.setTitle("添加到视图");
      item.onClick(() => {
        onImportToView(file);
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
  isInView ? removeFromView() : addToView();
  pinNote();
  copyLink();
  menu.addSeparator();
  deleteNote();
  menu.addSeparator();
  ctimeInfo();
  mtimeInfo();

  menu.showAtMouseEvent(event);
};