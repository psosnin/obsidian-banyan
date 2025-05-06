import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { TagFilterGroupValue } from "./sidebar/filterScheme/TagFilterGroup";

export interface MyPluginSettings {
	settingsVersion: number;
	cardsDirectory: string;
	sortType: 'created' | 'modified';
	openWhenStartObsidian: boolean;
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
	randomNoteTagFilter: TagFilterGroupValue;
	cardsColumns: number;
}

export const CUR_SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: MyPluginSettings = {
	settingsVersion: CUR_SETTINGS_VERSION,
	cardsDirectory: 'cards',
	sortType: 'created',
	openWhenStartObsidian: true,
	filterSchemes: [getDefaultFilterScheme([])],
	viewSchemes: [],
	randomNoteTagFilter: {
		or: [[]],
		not: [],
	},
	cardsColumns: 1,
}