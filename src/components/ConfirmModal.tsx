import { App, Modal } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";

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
        modalEl.style.minWidth = '0'; // ob默认样式有宽度
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

    return <div className="confirm-container" style={{ padding: '12px' }}>
        {title && title.trim().length > 0 && <div style={{ marginBottom: 16, fontWeight: "bold" }}>{title}</div>}
        {description && description.trim().length > 0 && <div style={{ marginBottom: 16 }}>{description}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button onClick={handleCancel}>取消</button>
            <button onClick={handleConfirm} style={{ background: "var(--interactive-accent)", color: "var(--text-on-accent)", border: "none", borderRadius: 4, padding: "4px 16px" }}>确定</button>
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