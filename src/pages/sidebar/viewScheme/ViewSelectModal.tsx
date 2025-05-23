import { App, Modal, Platform } from "obsidian";
import * as React from "react";
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

    return <div className="view-select-container" style={ Platform.isMobile ? { padding: '30px 20px 30px 20px' } : {} }>
        <div style={{ marginBottom: 16, fontWeight: "bold" }}>选择要导入的视图</div>
        <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
            {viewSchemes.map((scheme, index) => {
                return <div key={scheme.id} style={{ 
                        borderRadius: '8px', padding: '8px 12px', cursor: "pointer", flex: 1, 
                        background: highlighted === index ? "var(--interactive-accent)" : "var(--background-modifier-border)" }} 
                    onClick={() => handleChoose(index)}>{scheme.name}</div>;                
            })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button onClick={handleCancel}>取消</button>
            <button onClick={handleConfirm} style={{ background: "var(--interactive-accent)", color: "var(--text-on-accent)", border: "none", borderRadius: 4, padding: "4px 16px" }}>确定</button>
        </div>
    </div>;
};