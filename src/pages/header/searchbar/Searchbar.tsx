import { Icon } from "src/components/Icon";
import { SearchView } from "./SearchView";
import { useState, useEffect, useRef } from "react";
import { createEmptySearchFilterScheme, SearchFilterScheme, SearchFilterSchemeID } from "src/models/FilterScheme";
import { Platform } from "obsidian";
import { i18n } from "src/utils/i18n";
import { useCombineStore } from "src/store";

export const Searchbar = () => {

    const allTags = useCombineStore((state) => state.allTags);
    const setCurScheme = useCombineStore((state) => state.setCurScheme);
    const curSchemeIsSearch = useCombineStore((state) => state.curScheme.type === 'ViewScheme' && state.curScheme.id === SearchFilterSchemeID);

    const [tempFilterScheme, setTempFilterScheme] = useState(curSchemeIsSearch ? { ...SearchFilterScheme } : createEmptySearchFilterScheme());
    const [showFilterBox, setShowFilterBox] = useState(false);
    const filterBoxRef = useRef<HTMLDivElement>(null);
    const filterButtonRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        setCurScheme(tempFilterScheme);
        setShowFilterBox(false);
    };

    const handleReset = () => {
        setTempFilterScheme(SearchFilterScheme);
    };

    const handleCancel = () => {
        setTempFilterScheme(SearchFilterScheme);
        setShowFilterBox(false);
    }
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 防止事件处理期间搜索框已经关闭的情况
            if (!showFilterBox) return;
            
            const targetElement = event.target as HTMLElement;
            
            // 如果点击的是过滤框内部或者是触发按钮，则不关闭
            if (
                (filterBoxRef.current && filterBoxRef.current.contains(targetElement)) ||
                (filterButtonRef.current && filterButtonRef.current.contains(targetElement))
            ) {
                return;
            }
            
            // 检查是否点击的是标签选择器的下拉菜单、标签元素或其他浮动元素
            // 这些元素可能在DOM中不是filterBoxRef的子元素，但在UI上是属于搜索框的一部分
            if (
                targetElement.closest('.card-note-tag') 
                || targetElement.closest('.tag-input-container')
                || targetElement.closest('.tag-input-inputarea')
                || targetElement.closest('.tag-input-suggest')
            ) {
                return;
            }
            
            // 否则关闭过滤框
            handleCancel();
        };

        // 只有当过滤框显示时才添加事件监听
        if (showFilterBox) {
            // 使用较低优先级的事件，确保其他点击事件先处理
            // 延迟执行以确保其他元素的点击事件已经处理完毕
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilterBox]);

    if (Platform.isMobile) {
        return (
            <div style={{ position: 'relative' }}>
                <div ref={filterButtonRef} onClick={() => setShowFilterBox(v => !v)} style={{ cursor: 'pointer', marginLeft: 4, marginRight: 16 }}><Icon name="search" /></div>
                {showFilterBox && (
                    <div ref={filterBoxRef} style={{ position: 'absolute', top: '100%', marginTop: 6, right: 0, zIndex: 10, background: 'var(--background-primary)', boxShadow: '0 2px 8px 8px rgba(0,0,0,0.15)', borderRadius: 8, padding: 16, width: '90vw' }}>
                        <div style={{ marginBottom: 12, fontSize: 'var(--font-text-size)', fontWeight: 'var(--font-semibold)' }}>{i18n.t('search_view_title')}</div>
                        <input
                            type="text"
                            placeholder={i18n.t('search_input_placeholder')}
                            value={tempFilterScheme.keyword}
                            onChange={e => {
                                const newKeyword = e.target.value;
                                setTempFilterScheme(prev => ({ ...prev, keyword: newKeyword }));
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            style={{ background: 'var(--background-secondary)', border: 'none', outline: 'none', flex: 1, marginBottom: 16 }}
                        />
                        <SearchView
                            allTags={allTags}
                            filterScheme={tempFilterScheme}
                            setFilterScheme={setTempFilterScheme}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, marginTop: 16 }}>                            
                            <button onClick={handleReset}>{i18n.t('general_reset')}</button>
                            <div style={{ flex: 1 }}></div>
                            <button onClick={handleSearch} className="mod-cta">{i18n.t('general_search')}</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="main-header-searchbar" style={{ position: 'relative', display: 'flex', marginLeft: 16, alignItems: 'center', backgroundColor: 'var(--background-secondary)', borderRadius: 8, padding: '0 8px', height: 32, minWidth: 220, }}>
            <Icon name="search" />
            <input
                type="text"
                placeholder={i18n.t('search_bar_placeholder')}
                value={tempFilterScheme.keyword}
                onChange={e => {
                    const newKeyword = e.target.value;
                    setTempFilterScheme(prev => ({ ...prev, keyword: newKeyword }));
                }}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                }}
                style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
            />
            <div ref={filterButtonRef} onClick={() => setShowFilterBox(v => !v)} style={{ cursor: 'pointer', marginLeft: 4 }}><Icon name="sliders-horizontal" /></div>
            {showFilterBox && (
                <div ref={filterBoxRef} style={{ position: 'absolute', top: '100%', marginTop: 6, right: 0, zIndex: 10, background: 'var(--background-primary)', boxShadow: '0 2px 8px 4px rgba(0,0,0,0.15)', borderRadius: 8, padding: 16, minWidth: 360 }}>
                    <div style={{ marginBottom: 12, fontSize: 'var(--font-text-size)' }}>{i18n.t('search_view_title')}</div>
                    <SearchView
                        allTags={allTags}
                        filterScheme={tempFilterScheme}
                        setFilterScheme={setTempFilterScheme}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, marginTop: 16 }}>                        
                        <button onClick={handleReset}>{i18n.t('general_reset')}</button>
                        <div style={{ flex: 1 }}></div>
                        <button onClick={handleSearch} className="mod-cta">{i18n.t('general_search')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}