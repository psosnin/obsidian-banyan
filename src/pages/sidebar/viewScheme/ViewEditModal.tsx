import { App, Modal, Platform } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ViewScheme } from "src/models/ViewScheme";
import { i18n } from "src/utils/i18n";

interface ViewEditModalProps {
    viewScheme: ViewScheme;
    onSave: (updatedScheme: ViewScheme) => void;
    isNew: boolean;
}

export class ViewEditModal extends Modal {
    props: ViewEditModalProps;
    root: Root | null = null;
    unmount: (() => void) | null = null;

    constructor(app: App, props: ViewEditModalProps) {
        super(app);
        this.props = props;
    }

    onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        this.root.render(
            <React.StrictMode>
                <ViewEditContainer props={this.props} close={() => { this.close() }} />
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
    }
}

const ViewEditContainer = ({ props, close }: { props: ViewEditModalProps, close: () => void }) => {
    const { viewScheme, onSave, isNew } = props;
    const [scheme, setScheme] = React.useState(viewScheme);
    const handleSave = () => {
        onSave(scheme);
        close();
    };
    const handleCancel = () => {
        close();
    };
    return <div className="view-modal-container">
        <div className="view-modal-title">{isNew ? i18n.t('view_scheme_title_create') : i18n.t('view_scheme_title_update')}</div>
        <div className="view-modal-content">
            <div className="view-name-container" >
                {!Platform.isMobile && <label className="view-modal-label">{i18n.t('view_scheme_name_label')}</label>}
                <input
                    type="text"
                    placeholder={Platform.isMobile ? i18n.t('view_scheme_name_placeholder') : ""}
                    value={scheme.name}
                    onChange={e => setScheme({ ...scheme, name: e.target.value })}
                />
            </div>
        </div>
        <div className="view-modal-footer">
            <button onClick={handleCancel}>{i18n.t('general_cancel')}</button>
            <button onClick={handleSave} className="mod-cta">{i18n.t('general_save')}</button>
        </div>
    </div>;
};