import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { emptyTagFilter, TagFilter } from "./models/TagFilter";

export interface BanyanPluginSettings {
	settingsVersion: number;
	cardsDirectory: string;
	openWhenStartObsidian: boolean;
	cardsColumns: number;
	showTitle: boolean;
	randomNoteTagFilter: TagFilter;

	sortType: 'created' | 'modified';
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
}

export const CUR_SETTINGS_VERSION = 2;

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
}