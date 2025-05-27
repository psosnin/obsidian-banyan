import { emptyTagFilter, TagFilter } from './TagFilter';
import { i18n } from '../utils/i18n';

export type RandomReviewFilter = {
    id: number;
    name: string;
    tagFilter: TagFilter;
};

export const DefaultRandomReviewFilterID = 0;

export const createEmptyRandomReviewFilter = (id: number = -1, name: string = ''): RandomReviewFilter => {
    return {
        id,
        name,
        tagFilter: emptyTagFilter()
    };
};

export const DefaultRandomReviewFilter = createEmptyRandomReviewFilter(
    DefaultRandomReviewFilterID,
    i18n.t('random_review')
);