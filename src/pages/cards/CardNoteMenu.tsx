import { Menu, Notice } from "obsidian";
import { useCombineStore } from "src/store";
import { i18n } from "src/utils/i18n";
import { ViewSelectModal } from "../sidebar/viewScheme/ViewSelectModal";
import { openDeleteConfirmModal } from "src/components/ConfirmModal";
import { Icon } from "src/components/Icon";
import { FileInfo } from "src/models/FileInfo";

export interface CardNoteMenuParams {
  event: MouseEvent;
  fileInfo: FileInfo;
  isPinned: boolean;
}

export const CardNoteMenuButton = ({ fileInfo, isPinned }: { fileInfo: FileInfo, isPinned: boolean }) => {

  const plugin = useCombineStore((state) => state.plugin);
  const pinFile = useCombineStore((state) => state.pinFile);
  const viewSchemes = useCombineStore((state) => state.viewSchemes);
  const updateViewScheme = useCombineStore((state) => state.updateViewScheme);
  const curScheme = useCombineStore((state) => state.curScheme);
  const setCurScheme = useCombineStore((state) => state.setCurScheme);
  const isInView = curScheme.type === 'ViewScheme';

  const openCardNoteMoreMenu = ({ event, fileInfo, isPinned }: CardNoteMenuParams) => {

    const menu = new Menu();

    const openNote = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t('general_open'));
        item.onClick(() => {
          plugin.fileUtils.openFile(fileInfo.file);
        });
      });
    };
    const removeFromView = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t('remove_from_view'));
        item.onClick(() => {
          if (curScheme.type !== 'ViewScheme') return; // 按理说UI层已经保障了只有ViewScheme时才会有这个按钮
          const newFiles = [...curScheme.files.filter((fileID) => fileID !== fileInfo.id)];
          const newPinned = [...curScheme.pinned.filter((fileID) => fileID !== fileInfo.id)];
          const newScheme = { ...curScheme, files: newFiles, pinned: newPinned };
          updateViewScheme(newScheme);
          setCurScheme(newScheme); // 当前是视图模式才可能执行这个操作，所以当前视图也要更新
        });
      });
    };
    const addToView = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t('add_to_view'));
        item.onClick(() => {
          const modal = new ViewSelectModal(plugin.app, {
            viewSchemes: viewSchemes,
            onSelect: (scheme) => {
              if (scheme.files.includes(fileInfo.id)) {
                new Notice(i18n.t('notice_note_already_in_view'));
                return;
              }
              const newFiles = [...scheme.files, fileInfo.id];
              const newScheme = { ...scheme, files: newFiles };
              updateViewScheme(newScheme);
            }
          });
          modal.open();
        });
      });
    };
    const pinNote = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t(isPinned ? 'general_unpin' : 'general_pin'));
        item.onClick(() => {
          const newIsPinned = !isPinned;
          new Notice(i18n.t(newIsPinned ? 'notice_note_pinned' : 'notice_note_unpinned'));
          pinFile(fileInfo, newIsPinned);
        });
      });
    };
    const copyLink = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t('copy_link'));
        item.onClick(() => {
          const url = ` [[${fileInfo.file.path}|MEMO ▶]] `;
          navigator.clipboard.writeText(url);
          new Notice(i18n.t('link_copied'));
        });
      });
    };
    const deleteNote = () => {
      menu.addItem((item) => {
        item.setTitle(i18n.t('general_delete'));
        item.onClick(() => {
          openDeleteConfirmModal({
            app: plugin.app,
            description: i18n.t('delete_note_confirm'),
            onConfirm: async () => {
              await plugin.fileUtils.trashFile(fileInfo.file);
              new Notice(i18n.t('notice_note_to_trash'));
            }
          });
        });
      });
    };
    const ctimeInfo = () => {
      menu.addItem((item) => {
        item.setTitle(`${i18n.t('general_create')}: ${new Date(fileInfo.file.stat.ctime).toLocaleString()}`);
        item.setDisabled(true);
      });
    };
    const mtimeInfo = () => {
      menu.addItem((item) => {
        item.setTitle(`${i18n.t('general_update')}: ${new Date(fileInfo.file.stat.mtime).toLocaleString()}`);
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
  }

  return (<button className="clickable-icon"
    children={<Icon name='ellipsis' />}
    onClick={(e) => openCardNoteMoreMenu({ event: e.nativeEvent, fileInfo, isPinned })}
  />);
}