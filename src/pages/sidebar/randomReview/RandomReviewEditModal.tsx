import { App, Modal, Platform } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { RandomReviewFilter } from "src/models/RandomReviewFilters";
import { i18n } from "src/utils/i18n";
import { TagFilterView } from "src/components/TagFilterView";

interface RandomReviewEditModalProps {
    filter: RandomReviewFilter;
    allTags: string[];
    onSave: (updatedFilter: RandomReviewFilter) => void;
    isNew: boolean;
}

export class RandomReviewEditModal extends Modal {
    props: RandomReviewEditModalProps;
    root: Root | null = null;
    unmount: (() => void) | null = null;

    constructor(app: App, props: RandomReviewEditModalProps) {
        super(app);
        this.props = props;
    }

    onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        this.root.render(
            <React.StrictMode>
                <RandomReviewEditContainer props={this.props} close={() => { this.close() }} />
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
    }
}

const RandomReviewEditContainer = ({ props, close }: { props: RandomReviewEditModalProps, close: () => void }) => {
    const { filter, allTags, onSave, isNew } = props;
    const [editingFilter, setEditingFilter] = React.useState(filter);

    const handleSave = () => {
        onSave(editingFilter);
        close();
    };

    const handleCancel = () => {
        close();
    };

    return <div className="random-review-modal-container">
        <div className="random-review-modal-title">{isNew ? i18n.t('random_review_title_create') : i18n.t('random_review_title_update')}</div>
        <div className="random-review-modal-content">
            <div className="random-review-name-container">
                {!Platform.isMobile && <label>{i18n.t('random_review_name_label')}</label>}
                <input
                    type="text"
                    placeholder={Platform.isMobile ? i18n.t('random_review_name_placeholder') : ""}
                    value={editingFilter.name}
                    onChange={e => setEditingFilter({ ...editingFilter, name: e.target.value })}
                />
            </div>
            <div className="random-review-tags-container">
                <TagFilterView
                    allTags={allTags}
                    value={editingFilter.tagFilter}
                    onChange={v => setEditingFilter({ ...editingFilter, tagFilter: v })}
                    showLabel={!Platform.isMobile}
                />
            </div>
        </div>
        <div className="random-review-button-container">
            <button onClick={handleCancel}>{i18n.t('general_cancel')}</button>
            <button onClick={handleSave} className="mod-cta">{i18n.t('general_save')}</button>
        </div>
    </div>;
};