import { Icon } from "src/components/Icon";
import { SearchView } from "./SearchView";
import { useState } from "react";
import { FilterScheme, SearchFilterScheme } from "src/models/FilterScheme";
import React from "react";
import { Platform } from "obsidian";
import { i18n } from "src/utils/i18n";

interface SearchbarProps {
    allTags: string[];
    setCurFilterScheme: (scheme: FilterScheme) => void;
}

export const Searchbar: React.FC<SearchbarProps> = ({ allTags, setCurFilterScheme }) => {
    const [tempFilterScheme, setTempFilterScheme] = useState({ ...SearchFilterScheme });
    const [showFilterBox, setShowFilterBox] = useState(false);

    const handleSearch = () => {
        setCurFilterScheme(tempFilterScheme);
        setShowFilterBox(false);
    };

    const handleReset = () => {
        setTempFilterScheme(SearchFilterScheme);
    };

    const handleCancel = () => {
        setTempFilterScheme(SearchFilterScheme);
        setShowFilterBox(false);
    }

    if (Platform.isMobile) {
        return (
            <div style={{ position: 'relative' }}>
                <div onClick={() => setShowFilterBox(v => !v)} style={{ cursor: 'pointer', marginLeft: 4, marginRight: 16 }}><Icon name="search" /></div>
                {showFilterBox && (
                    <div style={{ position: 'absolute', top: '100%', marginTop: 6, right: 0, zIndex: 10, background: 'var(--background-primary)', boxShadow: '0 2px 8px 8px rgba(0,0,0,0.15)', borderRadius: 8, padding: 16, width: '90vw' }}>
                        <div style={{ marginBottom: 12, fontSize: 'var(--font-text-size)', fontWeight: 'var(--font-semibold)' }}>i18n.t('search_view_title')</div>
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
                            <button onClick={handleSearch} style={{ padding: '4px 16px', background: 'var(--interactive-accent)' }}>{i18n.t('general_search')}</button>
                            <button onClick={handleReset} style={{ padding: '4px 16px', backgroundColor: 'transparent' }}>{i18n.t('general_reset')}</button>
                            <div style={{ flex: 1 }}></div>
                            <button onClick={handleCancel} style={{ padding: '4px 16px' }}>{i18n.t('general_cancel')}</button>
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
            <div onClick={() => setShowFilterBox(v => !v)} style={{ cursor: 'pointer', marginLeft: 4 }}><Icon name="sliders-horizontal" /></div>
            {showFilterBox && (
                <div style={{ position: 'absolute', top: '100%', marginTop: 6, right: 0, zIndex: 10, background: 'var(--background-primary)', boxShadow: '0 2px 8px 4px rgba(0,0,0,0.15)', borderRadius: 8, padding: 16, minWidth: 360 }}>
                    <div style={{ marginBottom: 12, fontSize: 'var(--font-text-size)' }}>{i18n.t('search_view_title')}</div>
                    <SearchView
                        allTags={allTags}
                        filterScheme={tempFilterScheme}
                        setFilterScheme={setTempFilterScheme}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, marginTop: 16 }}>
                        <button onClick={handleSearch} style={{ padding: '4px 16px', background: 'var(--interactive-accent)' }}>{i18n.t('general_search')}</button>
                        <button onClick={handleReset} style={{ padding: '4px 16px', backgroundColor: 'transparent' }}>{i18n.t('general_reset')}</button>
                        <div style={{ flex: 1 }}></div>
                        <button onClick={handleCancel} style={{ padding: '4px 16px' }}>{i18n.t('general_cancel')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}