import { getHeatmapValues, Heatmap } from 'src/components/Heatmap';
import { FilterSchemesInfo } from './filterScheme/FilterSchemesInfo';
import { ViewSchemesInfo } from './viewScheme/ViewSchemesInfo';
import { RandomReviewInfo } from './randomReview/RandomReviewInfo';
import { i18n } from 'src/utils/i18n';
import { useCombineStore } from 'src/store';
import { SearchFilterScheme } from 'src/models/FilterScheme';
import { useMemo } from 'react';

export const SidebarContent = () => {
    const allFiles = useCombineStore((state) => state.allFiles);
    const heatmapValues = useMemo(() => getHeatmapValues(allFiles), [allFiles]);
    const setCurScheme = useCombineStore((state) => state.setCurScheme);
    
    const handleClickDate = (date: string) => {
        setCurScheme({ ...SearchFilterScheme, name: date, dateRange: { from: date, to: date } });
    }

    return (
        <div id='sidebar' style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', width: 320, marginRight: 16 }}>
            <StatisticsInfo />
            <Heatmap values={heatmapValues} onCickDate={handleClickDate} />
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
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
        <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)', }}>{allFiles.length}</span>
                <br />
                <span style={{ fontSize: 'var(--font-smallest)' }}>{i18n.t('note')}</span>
            </div>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)', }}>{allTags.length}</span>
                <br />
                <span style={{ fontSize: 'var(--font-smallest)' }}>{i18n.t('tag')}</span>
            </div>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)', }}>{usedDays}</span>
                <br />
                <span style={{ fontSize: 'var(--font-smallest)' }}>{i18n.t('days')}</span>
            </div>
        </div>
    );
}
