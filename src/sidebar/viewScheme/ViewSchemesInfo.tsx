import React from "react";
import { Icon } from "src/components/Icon";
import { ViewScheme } from "src/models/ViewScheme";
import { SidebarButton } from "../SidebarButton";
import { App, Menu } from "obsidian";
import { ViewEditModal } from "./ViewEditModal";

export const ViewSchemesInfo = ({
    app, viewSchemes, curViewSchemeID,
    onClick, onDragEnd, setViewScheme, deleteViewScheme
}: {
    app: App,
    viewSchemes: ViewScheme[],
    curViewSchemeID?: number,
    onClick: (index: number) => void,
    onDragEnd: (newOrder: ViewScheme[]) => void,
    setViewScheme: (scheme: ViewScheme) => void,
    deleteViewScheme: (schemeID: number) => void
}) => {

    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const handleNewViewScheme = () => {
        const maxId = viewSchemes.length > 0 ? Math.max(...viewSchemes.map(s => s.id)) : 0;
        const newScheme = {
            id: maxId + 1,
            name: '',
            files: [],
            pinned: [],
            type: 'ViewScheme' as const
        };
        const modal = new ViewEditModal(app, {
            viewScheme: newScheme,
            isNew: true,
            onSave: (updatedScheme: ViewScheme) => {
                setViewScheme(updatedScheme);
            }
        });
        modal.open();
    }

    const handleMenuClick = (action: string, index: number) => {
        if (action === 'update') {
            const modal = new ViewEditModal(app, {
                viewScheme: { ...viewSchemes[index] },
                isNew: false,
                onSave: (updatedScheme: ViewScheme) => {
                    setViewScheme(updatedScheme);
                }
            });
            modal.open();
        } else if (action === 'duplicate') {
            const maxId = viewSchemes.length > 0 ? Math.max(...viewSchemes.map(s => s.id)) : 0;
            const newScheme = {
                ...viewSchemes[index],
                id: maxId + 1,
                name: viewSchemes[index].name + ' 副本'
            };
            setViewScheme(newScheme);
        } else if (action === 'delete') {
            deleteViewScheme(viewSchemes[index].id);
        }
    };

    const handleViewSchemeClickMore = (event: MouseEvent, index: number) => {
        const menu = new Menu();
        menu.addItem((item) => {
            item.setTitle("更新");
            item.onClick(() => handleMenuClick('update', index));
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
        if (draggedIndex === null) return;
        const newSchemes = [...viewSchemes];
        const [removed] = newSchemes.splice(draggedIndex, 1);
        newSchemes.splice(index, 0, removed);
        onDragEnd(newSchemes);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className='view-scheme-container' style={{ marginTop: 16 }}>
            <div className='view-scheme-header' style={{ marginLeft: 12, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='view-scheme-header-title' style={{ fontSize: 'var(--font-smaller)', color: 'var(--interactive-accent)' }}>
                    <span>视图空间</span>
                </div>
                <div className='view-scheme-header-add' style={{ marginRight: 8 }}>
                    <button className='view-scheme-header-add-btn'
                        style={{ padding: '0 4px', background: 'transparent' }}
                        onClick={handleNewViewScheme}>
                        <Icon name='plus' size='m' color='var(--interactive-accent)' />
                    </button>
                </div>
            </div>
            <div className='view-scheme-list' style={{ marginTop: 6, display: 'flex', gap: 4, flexDirection: 'column' }}>
                {viewSchemes.map((scheme, index) => (
                    <div
                        key={scheme.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(index, e)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={() => handleDragEnd()}
                        style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            border: dragOverIndex === index && draggedIndex !== null ? '1px dashed var(--interactive-accent)' : undefined,
                            borderRadius: 4
                        }}>
                        <SidebarButton
                            label={scheme.name}
                            selected={curViewSchemeID === scheme.id}
                            onClick={() => onClick(index)}
                            rightIconName='ellipsis'
                            rightLabel={`${scheme.files.length}`}
                            onClickRightIcon={(e) => handleViewSchemeClickMore(e, index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

