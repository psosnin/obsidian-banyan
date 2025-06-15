import { Heatmap } from 'src/pages/sidebar/heatmap/Heatmap';
import { FilterSchemesInfo } from './filterScheme/FilterSchemesInfo';
import { ViewSchemesInfo } from './viewScheme/ViewSchemesInfo';
import { RandomReviewInfo } from './randomReview/RandomReviewInfo';
import { i18n } from 'src/utils/i18n';
import { useCombineStore } from 'src/store';
import { SearchFilterScheme } from 'src/models/FilterScheme';
import { useMemo } from 'react';

export const SidebarContent = () => {
    const setCurScheme = useCombineStore((state) => state.setCurScheme);
    
    const handleClickDate = (date: string) => {
        setCurScheme({ ...SearchFilterScheme, name: date, dateRange: { from: date, to: date } });
    }

    return (
        <div className="sidebar-content-container">
            <StatisticsInfo />
            <Heatmap onCickDate={handleClickDate} />
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
    const plugin = useCombineStore((state) => state.plugin);
    
    const usedDays = useMemo(() => {
        if (!plugin.settings.firstUseDate) return 0;
        const firstUseDate = new Date(plugin.settings.firstUseDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstUseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

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
