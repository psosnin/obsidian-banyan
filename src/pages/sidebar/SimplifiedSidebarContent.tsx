import * as React from "react";
import { i18n } from 'src/utils/i18n';
import { useCombineStore } from 'src/store';
import { useMemo, useEffect, useRef } from 'react';
import { TopicButtons } from "src/components/TopicButtons";
import { MarkdownRenderer, TFile } from 'obsidian';

export const SimplifiedSidebarContent = () => {
    return (
        <div className="sidebar-content-container">
            <StatisticsInfo />
            <div className="sidebar-margin-top" />
            <TopicButtons />
            <SidebarPersistentNote />
        </div>
    );
};

const StatisticsInfo = () => {
    const allFiles = useCombineStore((state) => state.allFiles);
    const allTags = useCombineStore((state) => state.allTags);
    const plugin = useCombineStore((state) => state.plugin);
    const settings = useCombineStore((state) => state.settings);

    const stats = useMemo(() => {
        // Count notes in specific folders (using configured paths)
        const papersCount = allFiles.filter(f => f.file.path.startsWith(settings.papersFolder + '/')).length;
        const chessCount = allFiles.filter(f => f.file.path.startsWith(settings.chessFolder + '/')).length;
        const russianCount = allFiles.filter(f => f.file.path.startsWith(settings.russianFolder + '/')).length;

        // Count total words in vault
        let totalWords = 0;
        allFiles.forEach(fileInfo => {
            const content = plugin.app.vault.cachedRead(fileInfo.file);
            if (content) {
                // Simple word count - split by whitespace and filter empty strings
                const words = content.toString().split(/\s+/).filter(w => w.length > 0);
                totalWords += words.length;
            }
        });

        return {
            notes: allFiles.length,
            words: totalWords,
            tags: allTags.length,
            papers: papersCount,
            chess: chessCount,
            russian: russianCount,
        };
    }, [allFiles, allTags, plugin, settings]);

    return (
        <div className="statistics-info-grid">
            <div className="stat-item">
                <span className="stat-value">{stats.notes}</span>
                <span className="stat-label">Notes</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{stats.words}</span>
                <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{stats.tags}</span>
                <span className="stat-label">Tags</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{stats.papers}</span>
                <span className="stat-label">Papers</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{stats.chess}</span>
                <span className="stat-label">Chess</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{stats.russian}</span>
                <span className="stat-label">Russian</span>
            </div>
        </div>
    );
};

const SidebarPersistentNote = () => {
    const settings = useCombineStore((state) => state.settings);
    const plugin = useCombineStore((state) => state.plugin);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!settings.sidebarNotePath || !contentRef.current) {
            return;
        }

        const loadNote = async () => {
            const file = plugin.app.vault.getAbstractFileByPath(settings.sidebarNotePath + '.md');
            if (!file || !(file instanceof TFile)) {
                return;
            }

            const content = await plugin.app.vault.cachedRead(file);
            if (contentRef.current) {
                contentRef.current.innerHTML = '';
                await MarkdownRenderer.render(
                    plugin.app,
                    content,
                    contentRef.current,
                    file.path,
                    plugin
                );
            }
        };

        loadNote();
    }, [settings.sidebarNotePath, plugin]);

    if (!settings.sidebarNotePath) {
        return null;
    }

    return (
        <div className="sidebar-persistent-note">
            <div ref={contentRef} className="sidebar-note-content" />
        </div>
    );
};
