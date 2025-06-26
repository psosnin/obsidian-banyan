import { App, Modal, Platform } from "obsidian";
import * as React from "react";
import {i18n} from 'src/utils/i18n';

import { createRoot, Root } from "react-dom/client";
import { ViewScheme } from "src/models/ViewScheme";

interface ViewSelectModalProps {
    viewSchemes: ViewScheme[];
    onSelect: (scheme: ViewScheme) => void;
}

export class ViewSelectModal extends Modal {
    props: ViewSelectModalProps;
    container: HTMLDivElement;
    root: Root | null = null;
    unmount: (() => void) | null = null;

    constructor(app: App, props: ViewSelectModalProps) {
        super(app);
        this.props = props;
    }

    onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        this.root.render(
            <React.StrictMode>
                <ViewSelectContainer props={this.props} close={() => { this.close() }} />
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
    }
}

const ViewSelectContainer = ({ props, close }: {
    props: ViewSelectModalProps, close: () => void
}) => {
    const { viewSchemes, onSelect } = props;

    const [highlighted, setHighlighted] = React.useState(-1);

    const handleChoose = (index: number) => {
        setHighlighted(index);
    }

    const handleConfirm = () => {
        if (highlighted >= 0) {
            onSelect(viewSchemes[highlighted]);
        }
        close();
    };

    const handleCancel = () => {
        close();
    };

    return <div className={"view-select-container " + (Platform.isMobile ? "view-select-mobile-padding" : "")}>
        <div className="view-select-title">{i18n.t('select_view_to_import')}</div>
        <div className="view-select-schemes-container">
            {viewSchemes.map((scheme, index) => {
                return <div key={scheme.id} 
                    className={"view-select-scheme-item " + (highlighted === index ? "view-select-scheme-item-highlighted" : "view-select-scheme-item-normal")}
                    onClick={() => handleChoose(index)}>{scheme.name}</div>;                
            })}
        </div>
        <div className="view-select-buttons">
            <button onClick={handleCancel}>{i18n.t('general_cancel')}</button>
            <button onClick={handleConfirm} className="view-select-confirm-button">{i18n.t('general_confirm')}</button>
        </div>
    </div>;
};