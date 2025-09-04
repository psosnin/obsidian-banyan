import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { DefaultRandomReviewFilter, RandomReviewFilter } from "./models/RandomReviewFilters";
import { CardContentMaxHeightType, SortType, TitleDisplayMode, FontTheme } from "./models/Enum";

export interface BanyanPluginSettings {
	// basic
	settingsVersion: number;
	openWhenStartObsidian: boolean;
	cardsDirectory: string;
	cardsColumns: number;
	fontTheme: FontTheme;

	// card note
	titleDisplayMode: TitleDisplayMode;
	cardContentMaxHeight?: CardContentMaxHeightType;
	showBacklinksInCardNote?: boolean;
	useCardNote2?: boolean;

	// add note 
	useZkPrefixerFormat?: boolean;
	showAddNoteRibbonIcon?: boolean;

	// in app
	sortType: SortType;
	firstUseDate: string;
	randomBrowse: boolean;
	randomReviewFilters: RandomReviewFilter[];
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
	
	// UI state
	filterSchemesExpanded: boolean;
	randomReviewExpanded: boolean;
	viewSchemesExpanded: boolean;	
}

export const CUR_SETTINGS_VERSION = 6;

const getToday = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today.toLocaleDateString();
}

export const DEFAULT_SETTINGS: BanyanPluginSettings = {
	// basic
	settingsVersion: CUR_SETTINGS_VERSION,
	openWhenStartObsidian: true,
	cardsDirectory: 'cards',
	cardsColumns: 1,

    // card note 
    titleDisplayMode: 'fileOnly',
	fontTheme: 'normal',
	cardContentMaxHeight: 'normal',
	showBacklinksInCardNote: false,
	useCardNote2: false,

    // add note
	useZkPrefixerFormat: false,
	showAddNoteRibbonIcon: true,	

	// in app
	sortType: 'created',
	firstUseDate: getToday(),
	randomBrowse: false,
	randomReviewFilters: [DefaultRandomReviewFilter],
	filterSchemes: [getDefaultFilterScheme([])],
	viewSchemes: [],
	
	// UI state
	filterSchemesExpanded: true,
	randomReviewExpanded: true,
	viewSchemesExpanded: true,
}