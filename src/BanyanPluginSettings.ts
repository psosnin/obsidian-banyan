import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { TagFilterGroupValue } from "./components/TagFilterGroup";

export interface BanyanPluginSettings {
	settingsVersion: number;
	cardsDirectory: string;
	sortType: 'created' | 'modified';
	openWhenStartObsidian: boolean;
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
	randomNoteTagFilter: TagFilterGroupValue;
	cardsColumns: number;
	showTitle: boolean;
}

export const CUR_SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: BanyanPluginSettings = {
	settingsVersion: CUR_SETTINGS_VERSION,
	cardsDirectory: 'cards',
	sortType: 'created',
	openWhenStartObsidian: true,
	showTitle: true,
	filterSchemes: [getDefaultFilterScheme([])],
	viewSchemes: [],
	randomNoteTagFilter: {
		or: [[]],
		not: [],
	},
	cardsColumns: 1,
}