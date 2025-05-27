import * as React from "react";
import { TagFilterView } from "src/components/TagFilterView";
import { RandomReviewFilter } from "src/models/RandomReviewFilters";
import { Platform } from "obsidian";
import { i18n } from "src/utils/i18n";

export interface RandomReviewViewProps {
    allTags: string[];
    filter: RandomReviewFilter;
    setFilter: (filter: RandomReviewFilter) => void;
    showName?: boolean;
    showLabel?: boolean;
}

export const RandomReviewView: React.FC<RandomReviewViewProps> = ({
    allTags,
    filter,
    setFilter,
    showName = true,
    showLabel = true
}) => {
    return (
        <div style={{ marginBottom: '0.5em', display: 'flex', gap: Platform.isMobile ? '1.2em' : '1em', flexWrap: 'wrap', flexDirection: 'column' }}>
            {showName && <div className="random-review-name-container" >
                {showLabel && <label style={{ marginRight: 12 }}>{i18n.t('random_review_name_label')}</label>}
                <input
                    type="text"
                    value={filter.name}
                    placeholder={showLabel ? "" : i18n.t('random_review_name_placeholder')}
                    onChange={e => setFilter({ ...filter, name: e.target.value })}
                    style={{ marginRight: 4, padding: '20px 16px', backgroundColor: 'var(--background-secondary)', border: 'none', outline: 'none' }}
                />
            </div>}
            <div className="random-review-tags-container" style={{ display: "flex", flexDirection: 'row' }}>
                <TagFilterView
                    allTags={allTags}
                    value={filter.tagFilter}
                    onChange={v => setFilter({ ...filter, tagFilter: v })}
                    showLabel={showLabel}
                />
            </div>
        </div>
    );
};