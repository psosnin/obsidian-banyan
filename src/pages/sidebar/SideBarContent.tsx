import { Heatmap } from 'src/pages/sidebar/heatmap/Heatmap';
import { FilterSchemesInfo } from './filterScheme/FilterSchemesInfo';
import { ViewSchemesInfo } from './viewScheme/ViewSchemesInfo';
import { RandomReviewInfo } from './randomReview/RandomReviewInfo';
import { i18n } from 'src/utils/i18n';
import { useCombineStore } from 'src/store';
import { SearchFilterScheme } from 'src/models/FilterScheme';
import { useMemo, useState } from 'react';
import { SidebarButton } from './SidebarButton';
import { SidebarSwitchButton } from './SidebarSwitchButton';

export const SidebarContent = () => {
    const setCurScheme = useCombineStore((state) => state.setCurScheme);
    const plugin = useCombineStore((state) => state.plugin);

    const handleClickDate = (date: string) => {
        setCurScheme({ ...SearchFilterScheme, name: date, dateRange: { from: date, to: date } });
    }

    return (
        <div className="sidebar-content-container">
            <StatisticsInfo />
            <Heatmap onCickDate={handleClickDate} />
            <div className="sidebar-btn-create-note">
                <SidebarButton leftIconName="lightbulb"
                    label={i18n.t('create_note')}
                    onClick={async () => await plugin.fileUtils.addFile()} />
            </div>
            <RandomBrowseSwitch />
            <div className="sidebar-section-container">
                <RandomReviewInfo />
                <FilterSchemesInfo />
                <ViewSchemesInfo />
            </div>
        </div>);
}

const StatisticsInfo = () => {
    const allFiles = useCombineStore((state) => state.allFiles);
    const allTags = useCombineStore((state) => state.allTags);
    const settings = useCombineStore((state) => state.settings);

    const usedDays = useMemo(() => {
        if (!settings.firstUseDate) return 0;
        const firstUseDate = new Date(settings.firstUseDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstUseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [settings.firstUseDate]);

    return (
        <div className="statistics-info-container">
            <div>
                <span className="statistics-info-item-value">{allFiles.length}</span>
                <br />
                <span className="statistics-info-item-label">{i18n.t('note')}</span>
            </div>
            <div>
                <span className="statistics-info-item-value">{allTags.length}</span>
                <br />
                <span className="statistics-info-item-label">{i18n.t('tag')}</span>
            </div>
            <div>
                <span className="statistics-info-item-value">{usedDays}</span>
                <br />
                <span className="statistics-info-item-label">{i18n.t('days')}</span>
            </div>
        </div>
    );
}

const RandomBrowseSwitch = () => {
    const settings = useCombineStore((state) => state.settings);
    const updateRandomBrowse = useCombineStore((state) => state.updateRandomBrowse);

    const [isRandomBrowseOn, setIsRandomBrowseOn] = useState(settings.randomBrowse);

    const handleRandomBrowseToggle = () => {
        const newValue = !isRandomBrowseOn;
        setIsRandomBrowseOn(newValue);
        updateRandomBrowse(newValue);
    }
    return <SidebarSwitchButton
        leftIconName='shuffle'
        label={i18n.t('random_browse')}
        isOn={isRandomBrowseOn}
        onSwitch={handleRandomBrowseToggle} />;
}