import { Heatmap, HeatmapData } from '../components/Heatmap';
import { SidebarButton } from './SidebarButton';
import { App } from 'obsidian';
import { DefaultFilterScheme, FilterScheme } from 'src/models/FilterScheme';
import { ViewScheme } from 'src/models/ViewScheme';
import { FilterSchemesInfo } from './filterScheme/FilterSchemesInfo';
import { ViewSchemesInfo } from './viewScheme/ViewSchemesInfo';

export interface SidebarContentProps {
    notesNum: number,
    tagsNum: number,
    heatmapValues: HeatmapData[],
    onClickAllNotesBtn: () => void,
    onClickFilterScheme: (index: number) => void,
    filterSchemes: FilterScheme[],
    curFilterSchemeID?: number,
    setFilterScheme: (scheme: FilterScheme) => void,
    onFilterDragEnd: (fs: FilterScheme[]) => void,
    pinFilterScheme: (schemeID: number) => void,
    deleteFilterScheme: (schemeID: number) => void,
    app: App,
    allTags: string[],
    viewSchemes: ViewScheme[],
    curViewSchemeID?: number,
    setViewScheme: (scheme: ViewScheme) => void,
    onViewDragEnd: (vs: ViewScheme[]) => void,
    deleteViewScheme: (schemeID: number) => void,
    onClickViewScheme: (index: number) => void,
    pinViewScheme: (schemeID: number) => void,
}

export const SidebarContent = ({
    app, allTags, notesNum, tagsNum, heatmapValues, curFilterSchemeID, filterSchemes, viewSchemes, curViewSchemeID,
    onClickAllNotesBtn,
    onClickFilterScheme, setFilterScheme, pinFilterScheme, deleteFilterScheme, onFilterDragEnd,
    onClickViewScheme, setViewScheme, onViewDragEnd, deleteViewScheme, pinViewScheme
}: SidebarContentProps) => {

    return (
        <div id='sidebar' style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', width: 320, marginRight: 16 }}>
            <StatisticsInfo notesNum={notesNum} tagsNum={tagsNum} />
            <Heatmap values={heatmapValues} />
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                <AllNotesBtn selected={curFilterSchemeID == DefaultFilterScheme.id} onClick={onClickAllNotesBtn} />
                <FilterSchemesInfo
                    app={app}
                    allTags={allTags}
                    filterSchemes={filterSchemes}
                    curFilterSchemeID={curFilterSchemeID}
                    onClick={onClickFilterScheme}
                    setFilterScheme={setFilterScheme}
                    deleteFilterScheme={deleteFilterScheme}
                    pinFilterScheme={pinFilterScheme}
                    onDragEnd={onFilterDragEnd} />
                <ViewSchemesInfo
                    app={app}
                    viewSchemes={viewSchemes}
                    curViewSchemeID={curViewSchemeID}
                    onClick={onClickViewScheme}
                    setViewScheme={setViewScheme}
                    deleteViewScheme={deleteViewScheme}
                    pinViewScheme={pinViewScheme}
                    onDragEnd={onViewDragEnd} />
            </div>
        </div>);
}

const StatisticsInfo = ({ notesNum, tagsNum }: { notesNum: number, tagsNum: number }) => {
    return (
        <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)', }}>{notesNum}</span>
                <br />
                <span style={{ fontSize: 9 }}>笔记</span>
            </div>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)', }}>{tagsNum}</span>
                <br />
                <span style={{ fontSize: 9 }}>标签</span>
            </div>
        </div>
    );
}

const AllNotesBtn = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => {
    return (
        <SidebarButton
            iconName="notebook"
            label="所有笔记"
            selected={selected}
            onClick={onClick}
        />
    );
}
