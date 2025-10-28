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
                // Render markdown into the container
                await MarkdownRenderer.render(
                    plugin.app,
                    content,
                    contentRef.current,
                    file.path,
                    plugin
                );

                // Add delegated click handler to support opening links from rendered markdown.
                // This handles internal vault links via `app.workspace.openLinkText` and
                // opens external links in a new browser tab.
                const container = contentRef.current;
                const handleClick = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (!target) return;
                    const anchor = target.closest('a') as HTMLAnchorElement | null;
                    if (!anchor) return;

                    // Prevent the default navigation performed by the renderer
                    e.preventDefault();

                    const href = anchor.getAttribute('href') || anchor.getAttribute('data-href') || '';
                    if (!href) return;

                    // External links -> open in browser
                    if (/^https?:\/\//.test(href) || /^mailto:/.test(href)) {
                        window.open(href, '_blank');
                        return;
                    }

                    // Internal / vault links. If it's a hash-only link (#heading), open the
                    // persistent note file and let Obsidian navigate to the heading. Otherwise
                    // pass the path (may include a fragment) to openLinkText.
                    try {
                        if (href.startsWith('#')) {
                            plugin.app.workspace.openLinkText(file.path + href, file.path, false);
                        } else {
                            const path = href.startsWith('/') ? href.slice(1) : href;
                            plugin.app.workspace.openLinkText(path, file.path, false);
                        }
                    } catch (err) {
                        // Fallback: log and do nothing
                        // (opening may fail for unusual link formats)
                        // keep console trace for debugging during development
                        // console.warn('Failed to open link from sidebar persistent note', href, err);
                    }
                };

                container.addEventListener('click', handleClick);

                // Cleanup handler when note changed / effect re-runs
                const cleanup = () => {
                    try { container.removeEventListener('click', handleClick); } catch (e) { }
                };

                // Attach cleanup to node dataset so subsequent renders can remove if needed.
                // Also ensure React effect cleanup removes it.
                (container as any).__banyan_cleanup = cleanup;
            }
        };

        loadNote();

        return () => {
            // If a handler was attached to the previous container, remove it
            if (contentRef.current && (contentRef.current as any).__banyan_cleanup) {
                try { (contentRef.current as any).__banyan_cleanup(); } catch (e) { }
                delete (contentRef.current as any).__banyan_cleanup;
            }
        };
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
