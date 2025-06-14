import { App, Modal } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { i18n } from "src/utils/i18n";

interface ConfirmModalProps {
    title: string,
    description: string,
    onCancel?: () => void,
    onConfirm: () => void,
}

export class ConfirmModal extends Modal {
    props: ConfirmModalProps;
    root: Root | null = null;

    constructor(app: App, props: ConfirmModalProps) {
        super(app);
        this.props = props;
    }

    onOpen() {
        const modalEl = this.containerEl.children[1] as HTMLElement;
        modalEl.addClass('confirm-modal');
        this.root = createRoot(modalEl);
        this.root.render(
            <React.StrictMode>
                <ConfirmContainer props={this.props} close={() => { this.close() }} />
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
    }
}

const ConfirmContainer = ({ props, close }: {
    props: ConfirmModalProps, close: () => void
}) => {
    const { title, description, onCancel, onConfirm } = props;

    const handleConfirm = () => {
        onConfirm();
        close();
    };

    const handleCancel = () => {
        onCancel && onCancel();
        close();
    };

    return <div className="confirm-container">
        {title && title.trim().length > 0 && <div className="confirm-title">{title}</div>}
        {description && description.trim().length > 0 && <div className="confirm-desc">{description}</div>}
        <div className="confirm-btn-container">
            <button onClick={handleCancel}>{i18n.t('general_cancel')}</button>
            <button onClick={handleConfirm} className="confirm-btn-confirm">{i18n.t('general_confirm')}</button>
        </div>
    </div>;
};

export const openDeleteConfirmModal = ({app, title, description, onCancel, onConfirm} : {
    app: App, 
    title?: string, 
    description?: string,
    onCancel?: () => void,
    onConfirm: () => void,
}) => {
    const modal = new ConfirmModal(app, {
        title: title ?? '确认删除',
        description: description ?? '',
        onCancel: onCancel,
        onConfirm: onConfirm,
    });
    modal.open();
}