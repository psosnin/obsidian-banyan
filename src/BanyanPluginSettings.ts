import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { emptyTagFilter, TagFilter } from "./models/TagFilter";
import { DefaultRandomReviewFilter, RandomReviewFilter } from "./models/RandomReviewFilters";

export interface BanyanPluginSettings {
	settingsVersion: number;
	cardsDirectory: string;
	openWhenStartObsidian: boolean;
	cardsColumns: number;
	showTitle: boolean;
	randomNoteTagFilter: TagFilter;
	firstUseDate: string;

	sortType: 'created' | 'modified';
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
	randomReviewFilters: RandomReviewFilter[];
}

export const CUR_SETTINGS_VERSION = 3;

const getToday = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today.toLocaleDateString();
}

export const DEFAULT_SETTINGS: BanyanPluginSettings = {
	settingsVersion: CUR_SETTINGS_VERSION,
	cardsDirectory: 'cards',
	sortType: 'created',
	openWhenStartObsidian: true,
	showTitle: true,
	filterSchemes: [getDefaultFilterScheme([])],
	viewSchemes: [],
	randomNoteTagFilter: emptyTagFilter(),
	cardsColumns: 1,
	firstUseDate: getToday(),
	randomReviewFilters: [DefaultRandomReviewFilter],
}