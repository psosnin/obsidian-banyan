import { CardContentMaxHeightType, TitleDisplayMode, FontTheme } from "./models/Enum";

export interface TopicButton {
	id: string;
	name: string;
	notePath: string;
}

export interface BanyanPluginSettings {
	// basic
	settingsVersion: number;
	openWhenStartObsidian: boolean;
	fontTheme: FontTheme;

	// card note
	titleDisplayMode: TitleDisplayMode;
	cardContentMaxHeight?: CardContentMaxHeightType;

	// topics
	topicButtons: TopicButton[];
	featuredNotePath: string;
	sidebarNotePath: string;
	
	// stats
	firstUseDate: string;
	papersFolder: string;
	chessFolder: string;
	russianFolder: string;
}

export const CUR_SETTINGS_VERSION = 7;

const getToday = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today.toLocaleDateString();
}

export const DEFAULT_SETTINGS: BanyanPluginSettings = {
	// basic
	settingsVersion: CUR_SETTINGS_VERSION,
	openWhenStartObsidian: true,
	fontTheme: 'normal',

    // card note 
    titleDisplayMode: 'fileOnly',
	cardContentMaxHeight: 'normal',

	// topics
	topicButtons: [],
	featuredNotePath: '',
	sidebarNotePath: '',
	
	// stats
	firstUseDate: getToday(),
	papersFolder: 'papers',
	chessFolder: 'chess',
	russianFolder: 'russian',
}