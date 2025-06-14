import React from "react";
import { DefaultRandomReviewFilterID, RandomReviewFilter, createEmptyRandomReviewFilter } from "src/models/RandomReviewFilters";
import { RandomReviewEditModal } from "./RandomReviewEditModal";
import { Icon } from "src/components/Icon";
import { SidebarButton } from "../SidebarButton";
import { Menu } from "obsidian";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";

export const RandomReviewInfo = () => {
    const app = useCombineStore((state) => state.plugin.app);
    const allTags = useCombineStore((state) => state.allTags);
    const plugin = useCombineStore((state) => state.plugin);
    const randomReviewFilters = useCombineStore((state) => state.randomReviewFilters);
    const createRandomReviewFilter = useCombineStore((state) => state.createRandomReviewFilter);
    const updateRandomReviewFilter = useCombineStore((state) => state.updateRandomReviewFilter);
    const deleteRandomReviewFilter = useCombineStore((state) => state.deleteRandomReviewFilter);
    const reorderRandomReviewFilters = useCombineStore((state) => state.reorderRandomReviewFilters);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const handleCreateFilter = () => {
        const maxId = randomReviewFilters.length === 0 ? DefaultRandomReviewFilterID : Math.max(...randomReviewFilters.map(f => f.id));
        const newFilter = createEmptyRandomReviewFilter(maxId + 1, '');
        const modal = new RandomReviewEditModal(app, {
            filter: newFilter,
            allTags,
            isNew: true,
            onSave: (updatedFilter: RandomReviewFilter) => {
                createRandomReviewFilter(updatedFilter);
            }
        });
        modal.open();
    };

    const handleMenuClick = (action: string, index: number) => {
        if (action === 'update') {
            const modal = new RandomReviewEditModal(app, {
                filter: { ...randomReviewFilters[index] },
                allTags,
                isNew: false,
                onSave: (updatedFilter: RandomReviewFilter) => {
                    updateRandomReviewFilter(updatedFilter);
                }
            });
            modal.open();
        } else if (action === 'duplicate') {
            const maxId = randomReviewFilters.length === 0 ? DefaultRandomReviewFilterID : Math.max(...randomReviewFilters.map(f => f.id));
            const newFilter = {
                ...randomReviewFilters[index],
                id: maxId + 1,
                name: `${randomReviewFilters[index].name} ${i18n.t('general_copy')}`
            };
            createRandomReviewFilter(newFilter);
        } else if (action === 'delete') {
            deleteRandomReviewFilter(randomReviewFilters[index].id);
        }
    };

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
        const newFilters = [...randomReviewFilters];
        const [removed] = newFilters.splice(draggedIndex, 1);
        newFilters.splice(index, 0, removed);
        reorderRandomReviewFilters(newFilters);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleSelectFilter = (filter: RandomReviewFilter) => {
        plugin.fileUtils.openRandomFile(filter.tagFilter);
    };

    const icons = React.useMemo(() => ['dice', 'shuffle', 'dices', 'dice-6',
        'dice-5', 'dice-4', 'dice-3', 'dice-2', 'dice-1'], []);

    return (
        <div className='random-review-container'>
            <div className='random-review-header'>
                <div className='random-review-header-title'>
                    <span>{i18n.t('random_review')}</span>
                </div>
                <div className='random-review-header-add'>
                    <button className='random-review-header-add-btn clickable-icon'
                        onClick={handleCreateFilter}>
                        <Icon name='plus' size='m' color='var(--interactive-accent)' />
                    </button>
                </div>
            </div>
            <div className='random-review-list'>
                {randomReviewFilters.map((filter, index) => (
                    <div
                        key={filter.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(index, e)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={() => handleDragEnd()}
                        className={`random-review-item ${draggedIndex === index ? 'random-review-item-dragged' : ''} ${dragOverIndex === index && draggedIndex !== null ? 'random-review-item-dragover' : ''}`}>
                        <SidebarButton
                            leftIconName={icons[filter.id % icons.length]}
                            label={filter.name}
                            onClick={() => handleSelectFilter(filter)}
                            rightIconName='ellipsis'
                            onClickRightIcon={(e) => handleClickMore(e, index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};