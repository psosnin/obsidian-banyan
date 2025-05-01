import { Heatmap, HeatmapData } from '../components/Heatmap';
import { Icon } from '../components/Icon';
import { SidebarButton } from './SidebarButton';
import { FilterEditModal } from './FilterEditModal';
import { App, Menu } from 'obsidian';
import { DefaultFilterScheme, FilterScheme } from 'src/models/FilterScheme';
import React from 'react';

export interface SidebarContentProps {
    notesNum: number,
    tagsNum: number,
    heatmapValues: HeatmapData[],
    onClickAllNotesBtn: () => void,
    onClickFilterScheme: (index: number) => void,
    filterSchemes: FilterScheme[],
    curFilterSchemeID: number,
    setFilterScheme: (scheme: FilterScheme) => void,
    onDragEnd: (fs: FilterScheme[]) => void,
    pinFilterScheme: (schemeID: number) => void,
    deleteFilterScheme: (schemeID: number) => void,
    app: App,
    allTags: string[],
}

export const SidebarContent = ( { notesNum, tagsNum, heatmapValues, 
    curFilterSchemeID, onClickAllNotesBtn, onClickFilterScheme, filterSchemes, setFilterScheme, app, allTags,
    pinFilterScheme, deleteFilterScheme, onDragEnd
} : SidebarContentProps) => {

    const handleMenuClick = (action: string, index: number) => {
        if (action === 'update') {
            const modal = new FilterEditModal(app, {
                filterScheme: {...filterSchemes[index]},
                allTags,
                isNew: false,
                onSave: (updatedScheme: FilterScheme) => {
                    setFilterScheme(updatedScheme);
                }
            });
            modal.open();
        } else if (action === 'duplicate') {
            const maxId = filterSchemes.length > 0 ? Math.max(...filterSchemes.map(s => s.id)) : 0;
            const newScheme = {
                ...filterSchemes[index],
                id: maxId + 1,
                name: filterSchemes[index].name + ' 副本'
            };
            setFilterScheme(newScheme);
        } else if (action === 'pin') {
            // 置顶逻辑：将该项移到数组首位
            // const newSchemes = [filterSchemes[index], ...filterSchemes.filter((_, i) => i !== index)];
            // setFilterScheme(newSchemes[0]);
            pinFilterScheme(filterSchemes[index].id);
        } else if (action === 'delete') {
            deleteFilterScheme(filterSchemes[index].id);
        }
    };

    // 点击更多按钮弹出菜单
    const handleClickMore = (event: MouseEvent, index: number) => {
        const menu = new Menu();
        menu.addItem((item) => {
            item.setTitle("更新");
            item.onClick(() => handleMenuClick('update', index));
        });
        menu.addItem((item) => {
            item.setTitle("创建副本");
            item.onClick(() => handleMenuClick('duplicate', index));
        });
        menu.addItem((item) => {
            item.setTitle("置顶");
            item.onClick(() => handleMenuClick('pin', index));
        });
        menu.addSeparator();
        menu.addItem((item) => {
            item.setTitle("删除");
            item.onClick(() => handleMenuClick('delete', index));
        });
        menu.showAtMouseEvent(event);
    };

    const handleNewFilterScheme = () => {
        const maxId = filterSchemes.length > 0 ? Math.max(...filterSchemes.map(s => s.id)) : 0;
        const newScheme = {
            id: maxId + 1,
            name: '',
            tagFilter: { or: [[]], not: [] },
            dateRange: { from: "", to: "" },
            keyword: ''
        };
        const modal = new FilterEditModal(app, {
            filterScheme: newScheme,
            allTags,
            isNew: true,
            onSave: (updatedScheme: FilterScheme) => {
                setFilterScheme(updatedScheme);
            }
        });
        modal.open();
    };

    return  (
    <div id='sidebar' style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', width: 320, marginRight: 16}}>
        <StatisticsInfo notesNum={notesNum} tagsNum={tagsNum}/>
        <Heatmap values={heatmapValues}/>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12}}>
            <AllNotesBtn selected={curFilterSchemeID == DefaultFilterScheme.id} onClick={onClickAllNotesBtn} />
            <FilterSchemesInfo 
                filterSchemes={filterSchemes}
                curFilterSchemeID={curFilterSchemeID}
                onClick={onClickFilterScheme}
                onClickMore={handleClickMore}
                onClickAdd={handleNewFilterScheme}
                onDragEnd={onDragEnd}
            />
        </div>
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

const FilterSchemesInfo = ({filterSchemes, curFilterSchemeID, onClick, onClickMore, onClickAdd, onDragEnd} : { 
    filterSchemes: FilterScheme[], curFilterSchemeID: number, 
    onClick: (index: number) => void, 
    onClickMore: (e: MouseEvent, index: number) => void,
    onClickAdd: () => void,
    onDragEnd: (newOrder: FilterScheme[]) => void,
}) => {
    const [draggedIndex, setDraggedIndex] = React.useState<number|null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number|null>(null);
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };
    const handleDragOver = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        setDragOverIndex(index);
    };
    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        const newSchemes = [...filterSchemes];
        const [removed] = newSchemes.splice(draggedIndex, 1);
        newSchemes.splice(index, 0, removed);
        onDragEnd(newSchemes);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };
    return (
        <div className='filter-scheme-container' style={{marginTop: 16}}>
            <div className='filter-scheme-header' style={{marginLeft: 12, display: 'flex', 
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className='filter-scheme-header-title' style={{fontSize: 'var(--font-smaller)', color: 'var(--interactive-accent)'}}>
                    <span>过滤方案</span>
                </div>
                <div className='filter-scheme-header-add' style={{marginRight: 8}}>
                    <button className='filter-scheme-header-add-btn' 
                        style={{padding: '0 4px', background: 'transparent'}} 
                        onClick={onClickAdd}>
                        <Icon name='plus' size='m' color='var(--interactive-accent)'/>
                    </button>
                </div>
            </div>
            <div className='filter-scheme-list' style={{marginTop: 6, display: 'flex', gap: 4, flexDirection: 'column'}}>
                {filterSchemes.map((scheme, index) => (
                    <div
                        key={scheme.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(index, e)}
                        onDrop={() => handleDrop(index)}
                        style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            border: dragOverIndex === index && draggedIndex !== null ? '1px dashed var(--interactive-accent)' : undefined,
                            borderRadius: 4
                        }}
                    >
                        <SidebarButton
                            label={scheme.name}
                            selected={curFilterSchemeID===scheme.id}
                            onClick={() => onClick(index)} 
                            rightIconName='ellipsis'
                            onClickRightIcon={(e) => onClickMore && onClickMore(e, index)}    
                        />
                    </div>
                ))}
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

