import React from "react";
import { DefaultFilterSchemeID, FilterScheme } from "src/models/FilterScheme";
import { FilterEditModal } from "./FilterEditModal";
import { Icon } from "src/components/Icon";
import { SidebarButton } from "../SidebarButton";
import { App, Menu } from "obsidian";

export const FilterSchemesInfo = ({
    app, allTags, filterSchemes, curFilterSchemeID,
    onClick, onDragEnd, setFilterScheme, deleteFilterScheme
}: {
    app: App,
    allTags: string[],
    filterSchemes: FilterScheme[],
    curFilterSchemeID?: number,
    onClick: (index: number) => void,
    onDragEnd: (newOrder: FilterScheme[]) => void,
    setFilterScheme: (scheme: FilterScheme) => void,
    deleteFilterScheme: (schemeID: number) => void
}) => {
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const handleNewFilterScheme = () => {
        const maxId = filterSchemes.length > 0 ? Math.max(...filterSchemes.map(s => s.id)) : 0;
        const newScheme = {
            id: maxId + 1,
            name: '',
            tagFilter: { or: [[]], not: [] },
            dateRange: { from: "", to: "" },
            keyword: '',
            pinned: [],
            type: 'FilterScheme' as const
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

    const handleMenuClick = (action: string, index: number) => {
        if (action === 'update') {
            const modal = new FilterEditModal(app, {
                filterScheme: { ...filterSchemes[index] },
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
        menu.addSeparator();
        menu.addItem((item) => {
            item.setTitle("删除");
            item.onClick(() => handleMenuClick('delete', index));
        });
        menu.showAtMouseEvent(event);
    };

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

    const isDefault = (scheme: FilterScheme) => {
        return scheme.id === DefaultFilterSchemeID;
    };

    return (
        <div className='filter-scheme-container' style={{ marginTop: 16 }}>
            <div className='filter-scheme-header' style={{
                marginLeft: 12, display: 'flex',
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div className='filter-scheme-header-title' style={{ fontSize: 'var(--font-smaller)', color: 'var(--interactive-accent)' }}>
                    <span>常用过滤</span>
                </div>
                <div className='filter-scheme-header-add' style={{ marginRight: 8 }}>
                    <button className='filter-scheme-header-add-btn'
                        style={{ padding: '0 4px', background: 'transparent' }}
                        onClick={handleNewFilterScheme}>
                        <Icon name='plus' size='m' color='var(--interactive-accent)' />
                    </button>
                </div>
            </div>
            <div className='filter-scheme-list' style={{ marginTop: 6, display: 'flex', gap: 4, flexDirection: 'column' }}>
                {filterSchemes.map((scheme, index) => (
                    <div
                        key={scheme.id}
                        draggable
                        onDragStart={isDefault(scheme) ? undefined : () => handleDragStart(index)}
                        onDragOver={isDefault(scheme) ? undefined : (e) => handleDragOver(index, e)}
                        onDrop={isDefault(scheme) ? undefined : () => handleDrop(index)}
                        style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            border: dragOverIndex === index && draggedIndex !== null ? '1px dashed var(--interactive-accent)' : undefined,
                            borderRadius: 4
                        }}
                    >
                        <SidebarButton
                            label={scheme.name}
                            selected={curFilterSchemeID === scheme.id}
                            onClick={() => onClick(index)}
                            rightIconName={isDefault(scheme) ? undefined : 'ellipsis'}
                            onClickRightIcon={isDefault(scheme) ? undefined : (e) => handleClickMore(e, index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}