import { Heatmap, HeatmapData } from './Heatmap';

export const SidebarContent = ( { notesNum, tagsNum, heatmapValues } : {
    notesNum: number, 
    tagsNum: number,
    heatmapValues: HeatmapData[],
}) => {
    return  (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', width: 280, marginRight: 16 }}>
        <StatisticsInfo notesNum={notesNum} tagsNum={tagsNum}/>
        <Heatmap values={heatmapValues}/>
        {/* <AllNotesBtn/> */}
        {/* <FilterSchemesInfo/> */}
    </div>);
}

const StatisticsInfo = ({notesNum, tagsNum}:{notesNum: number, tagsNum: number}) => {
    return (
        <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>{notesNum}</span>
                <br/>
                <span style={{ fontSize: 9}}>笔记</span>
            </div>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>{tagsNum}</span>
                <br/>
                <span style={{ fontSize: 9}}>标签</span>
            </div>
        </div>
    );
}

const AllNotesBtn = () => {
    return (
        <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent:'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>1</span>
                <br/>
                <span style={{ fontSize: 9}}>周</span>
            </div>
        </div>

    );
}

const FilterSchemesInfo = () => {
    return (
        <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent:'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
            <div>
                <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>1</span>
                <br/>
                <span style={{ fontSize: 9}}>周</span>
            </div>
        </div>
    );
}

// 视图空间
// const NoteViews = () => {
//     return (
//         <div style={{ }}>
 
//         </div>
//     );
// }