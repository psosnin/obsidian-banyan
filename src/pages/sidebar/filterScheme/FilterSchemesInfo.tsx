import React from "react";
import { createEmptyFilterScheme, DefaultFilterSchemeID, FilterScheme } from "src/models/FilterScheme";
import { FilterEditModal } from "./FilterEditModal";
import { Icon } from "src/components/Icon";
import { SidebarButton } from "../SidebarButton";
import { Menu } from "obsidian";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";

export const FilterSchemesInfo = () => {

    const app = useCombineStore((state) => state.plugin.app);
    const allTags = useCombineStore((state) => state.allTags);
    const filterSchemes = useCombineStore((state) => state.filterSchemes);
    const curScheme = useCombineStore((state) => state.curScheme);
    const curFilterSchemeID = curScheme.type === 'FilterScheme' ? curScheme.id : undefined;
    const setCurScheme = useCombineStore((state) => state.setCurScheme);
    const reorderFilterSchemes = useCombineStore((state) => state.reorderFilterSchemes);
    const updateFilterScheme = useCombineStore((state) => state.updateFilterScheme);
    const createFilterScheme = useCombineStore((state) => state.createFilterScheme);
    const deleteFilterScheme = useCombineStore((state) => state.deleteFilterScheme);

    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const handleCreateFilterScheme = () => {
        const maxId = filterSchemes.length > 0 ? Math.max(...filterSchemes.map(s => s.id)) : 0;
        const newScheme = createEmptyFilterScheme(maxId + 1);
        const modal = new FilterEditModal(app, {
            filterScheme: newScheme,
            allTags,
            isNew: true,
            onSave: (updatedScheme: FilterScheme) => {
                createFilterScheme(updatedScheme);
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
                    updateFilterScheme(updatedScheme);
                }
            });
            modal.open();
        } else if (action === 'duplicate') {
            const maxId = filterSchemes.length > 0 ? Math.max(...filterSchemes.map(s => s.id)) : 0;
            const newScheme = {
                ...filterSchemes[index],
                id: maxId + 1,
                name: `${filterSchemes[index].name} ${i18n.t('general_copy')}`
            };
            createFilterScheme(newScheme);
        } else if (action === 'delete') {
            deleteFilterScheme(filterSchemes[index].id);
        }
    };

    // 点击更多按钮弹出菜单
    const handleClickMore = (event: MouseEvent, index: number) => {
        const menu = new Menu();
        menu.addItem((item) => {
            item.setTitle(i18n.t('general_update'));
            item.onClick(() => handleMenuClick('update', index));
        });
        menu.addItem((item) => {
            item.setTitle(i18n.t('create_copy'));
            item.onClick(() => handleMenuClick('duplicate', index));
        });
        menu.addSeparator();
        menu.addItem((item) => {
            item.setTitle(i18n.t('general_delete'));
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
        if (draggedIndex === null) return;
        const newSchemes = [...filterSchemes];
        const [removed] = newSchemes.splice(draggedIndex, 1);
        newSchemes.splice(index, 0, removed);
        reorderFilterSchemes(newSchemes);
    };

    const handleDragEnd = () => {
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
                    <span>{i18n.t('filter_schemes')}</span>
                </div>
                <div className='filter-scheme-header-add' style={{ marginRight: 8 }}>
                    <button className='filter-scheme-header-add-btn'
                        style={{ padding: '0 4px', background: 'transparent' }}
                        onClick={handleCreateFilterScheme}>
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
                        onDragEnd={handleDragEnd}
                        style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            border: dragOverIndex === index && draggedIndex !== null ? '1px dashed var(--interactive-accent)' : undefined,
                            borderRadius: 4
                        }}
                    >
                        <SidebarButton
                            label={scheme.name}
                            selected={curFilterSchemeID === scheme.id}
                            onClick={() => setCurScheme(scheme)}
                            rightIconName={isDefault(scheme) ? undefined : 'ellipsis'}
                            onClickRightIcon={isDefault(scheme) ? undefined : (e) => handleClickMore(e, index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}