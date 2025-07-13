import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { emptyTagFilter, TagFilter } from "./models/TagFilter";
import { DefaultRandomReviewFilter, RandomReviewFilter } from "./models/RandomReviewFilters";
import { SortType } from "./models/Enum";

export interface BanyanPluginSettings {
	settingsVersion: number;
	cardsDirectory: string;
	openWhenStartObsidian: boolean;
	cardsColumns: number;
	titleDisplayMode: 'propertyOrNone' | 'propertyThenFile' | 'fileOnly' | 'none';
	randomNoteTagFilter: TagFilter;
	firstUseDate: string;

	sortType: SortType;
	randomBrowse: boolean; // 新增：乱序浏览开关
	filterSchemes: FilterScheme[];
	viewSchemes: ViewScheme[];
	randomReviewFilters: RandomReviewFilter[];
	showBacklinksInCardNote?: boolean;
	useCardNote2?: boolean; // 新增，是否使用新版CardNote2
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
	titleDisplayMode: 'none',
	filterSchemes: [getDefaultFilterScheme([])],
	viewSchemes: [],
	randomNoteTagFilter: emptyTagFilter(),
	cardsColumns: 1,
	firstUseDate: getToday(),
	randomBrowse: false, // 新增：默认关闭乱序浏览
	randomReviewFilters: [DefaultRandomReviewFilter],
	showBacklinksInCardNote: false,
	useCardNote2: false,
}