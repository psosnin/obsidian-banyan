import { App, Modal } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ViewScheme } from "src/models/ViewScheme";

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
    return <div className="view-modal-container" style={{ minWidth: 320 }}>
        <div style={{ marginBottom: 16, fontWeight: "bold" }}>{isNew ? "创建" : "更新"}视图</div>
        <div style={{ marginBottom: '0.5em', display: 'flex', gap: '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
            <div className="view-name-container" >
                <label style={{ marginRight: 12 }}>名称</label>
                <input
                    type="text"
                    value={scheme.name}
                    onChange={e => setScheme({ ...scheme, name: e.target.value })}
                    style={{ marginRight: 4, padding: '20px 16px', backgroundColor: 'var(--background-secondary)', border: 'none', outline: 'none' }}
                />
            </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button onClick={handleCancel}>取消</button>
            <button onClick={handleSave} style={{ background: "var(--interactive-accent)", color: "var(--text-on-accent)", border: "none", borderRadius: 4, padding: "4px 16px" }}>保存</button>
        </div>
    </div>;
};