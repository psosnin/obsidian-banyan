import { Menu, TFile, Notice } from "obsidian";
import { i18n } from "src/utils/i18n";

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
      item.setTitle(i18n.t('general_open'));
      item.onClick(() => {
        onOpen(file);
      });
    });
  };
  const removeFromView = () => {
    menu.addItem((item) => {
      item.setTitle(i18n.t('remove_from_view'));
      item.onClick(() => {
        onRemoveFromView(file);
      });
    });
  };
  const addToView = () => {
    menu.addItem((item) => {
      item.setTitle(i18n.t('add_to_view'));
      item.onClick(() => {
        onImportToView(file);
      });
    });
  };
  const pinNote = () => {
    menu.addItem((item) => {
      item.setTitle(i18n.t(isPinned ? 'general_unpin' : 'general_pin'));
      item.onClick(() => {
        setPin(file, !isPinned);
      });
    });
  };
  const copyLink = () => {
    menu.addItem((item) => {
      item.setTitle(i18n.t('copy_link'));
      item.onClick(() => {
        const url = ` [[${file.path}|MEMO ▶]] `;
        navigator.clipboard.writeText(url);
        new Notice(i18n.t('link_copied'));
      });
    });
  };
  const deleteNote = () => {
    menu.addItem((item) => {
      item.setTitle(i18n.t('general_delete'));
      item.onClick(() => {
        onDelete(file);
      });
    });
  };
  const ctimeInfo = () => {
    menu.addItem((item) => {
      item.setTitle(`${i18n.t('general_create')}: ${new Date(file.stat.ctime).toLocaleString()}`);
      item.setDisabled(true);
    });
  };
  const mtimeInfo = () => {
    menu.addItem((item) => {
      item.setTitle(`${i18n.t('general_update')}: ${new Date(file.stat.mtime).toLocaleString()}`);
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