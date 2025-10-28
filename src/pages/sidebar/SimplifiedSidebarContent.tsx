import * as React from "react";
import { i18n } from 'src/utils/i18n';
import { useCombineStore } from 'src/store';
import { useMemo, useEffect, useRef, useState } from 'react';
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
        const russianFolderCount = allFiles.filter(f => f.file.path.startsWith(settings.russianFolder + '/')).length;

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
            // `russian` will be merged with stateful `russianVocabLines` in render
            russian: russianFolderCount,
        };
    }, [allFiles, allTags, plugin, settings]);

    // State to hold the number of lines in the russian vocab file (if present).
    const [russianVocabLines, setRussianVocabLines] = useState<number | null>(null);

    // State to hold the total number of files in the papers folder (all file types).
    const [papersFileCount, setPapersFileCount] = useState<number | null>(null);
    // State to hold the number of lines in the chess vocab file (if present).
    const [chessVocabLines, setChessVocabLines] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        const findAndCount = async () => {
            if (!plugin || !allFiles) return;

            // Candidate strategies to locate the vocab file:
            // 1) Look for files whose file.name or path contains 'russian vocab' or 'vocab' inside the russian folder
            const candidates = allFiles.filter(f => {
                const p = (f.file.path || '').toLowerCase();
                const name = (f.file.name || '').toLowerCase();
                const inRussianFolder = settings.russianFolder ? p.startsWith(settings.russianFolder.toLowerCase() + '/') : false;
                // prefer filenames that include 'russian vocab' or 'vocab'
                const looksLikeVocab = name.includes('russian vocab') || name.includes('russian-vocab') || name.includes('russian_vocab') || name.includes('vocab');
                return (inRussianFolder && looksLikeVocab) || name.includes('russian vocab') || p.includes('/russian vocab');
            });

            if (candidates.length === 0) {
                // fallback: look for a top-level file called 'russian vocab.md'
                const fallback = allFiles.find(f => (f.file.path || '').toLowerCase().endsWith('/russian vocab.md') || (f.file.name || '').toLowerCase() === 'russian vocab.md');
                if (fallback) candidates.push(fallback);
            }

            if (candidates.length === 0) {
                // No vocab file found — set null to indicate fallback should be used.
                if (mounted) setRussianVocabLines(null);
                return;
            }

            // If explicit vocab path provided in settings, try that first
            if (settings.russianVocabPath && settings.russianVocabPath.trim().length > 0) {
                // Allow any extension — user may specify .txt, .csv, .md, etc.
                const explicitPath = settings.russianVocabPath.trim();
                const explicitFile = plugin.app.vault.getAbstractFileByPath(explicitPath);
                if (explicitFile && (explicitFile as any).path) {
                    try {
                        const text = await plugin.app.vault.cachedRead(explicitFile as any);
                        if (!mounted) return;
                        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).length;
                        setRussianVocabLines(lines);
                        return;
                    } catch (e) {
                        // fall through to candidate logic below
                    }
                }
            }

            // Use the first candidate
            const file = candidates[0].file;
            try {
                const text = await plugin.app.vault.cachedRead(file);
                if (!mounted) return;
                if (typeof text !== 'string') {
                    setRussianVocabLines(null);
                    return;
                }
                // Count non-empty lines. If you prefer counting all lines including empty
                // ones, remove the filter below.
                const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).length;
                setRussianVocabLines(lines);
            } catch (e) {
                if (mounted) setRussianVocabLines(null);
            }
        };

        findAndCount();

        return () => { mounted = false; };
    }, [allFiles, settings.russianFolder, plugin]);

    // Effect to count all files (any extension) inside the papers folder recursively.
    useEffect(() => {
        let mounted = true;
        const countFilesRecursive = (folder: any): number => {
            if (!folder || !folder.children) return 0;
            let cnt = 0;
            for (const child of folder.children) {
                // TFolder has 'children', TFile does not
                if ((child as any).children) {
                    cnt += countFilesRecursive(child);
                } else {
                    cnt += 1;
                }
            }
            return cnt;
        };

        const calc = async () => {
            try {
                if (!plugin) return;
                const folderPath = settings.papersFolder || '';
                if (!folderPath) {
                    if (mounted) setPapersFileCount(null);
                    return;
                }

                // Try to get the abstract file for the folder
                const abs = plugin.app.vault.getAbstractFileByPath(folderPath);
                if (abs && (abs as any).children) {
                    const num = countFilesRecursive(abs as any);
                    if (mounted) setPapersFileCount(num);
                    return;
                }

                // Fallback: try adapter.list to count files
                if (plugin.app.vault.adapter && typeof plugin.app.vault.adapter.list === 'function') {
                    try {
                        const res = await (plugin.app.vault.adapter as any).list(folderPath);
                        let total = 0;
                        if (res && Array.isArray(res.files)) total += res.files.length;
                        if (res && Array.isArray(res.folders)) {
                            // For folders returned by adapter.list we won't recurse deeply here; keep fallback null
                        }
                        if (mounted) setPapersFileCount(total);
                        return;
                    } catch (e) {
                        // ignore adapter listing errors
                    }
                }

                if (mounted) setPapersFileCount(null);
            } catch (e) {
                if (mounted) setPapersFileCount(null);
            }
        };

        calc();

        return () => { mounted = false; };
    }, [settings.papersFolder, plugin]);

    // Effect to locate and count lines in a chess vocab file (similar to russian logic)
    useEffect(() => {
        let mounted = true;

        const findAndCountChess = async () => {
            if (!plugin || !allFiles) return;

            // If explicit vocab path provided in settings, try that first
            if (settings.chessVocabPath && settings.chessVocabPath.trim().length > 0) {
                // Allow any extension for the chess vocab file
                const explicitPath = settings.chessVocabPath.trim();
                const explicitFile = plugin.app.vault.getAbstractFileByPath(explicitPath);
                if (explicitFile && (explicitFile as any).path) {
                    try {
                        const text = await plugin.app.vault.cachedRead(explicitFile as any);
                        if (!mounted) return;
                        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).length;
                        setChessVocabLines(lines);
                        return;
                    } catch (e) {
                        // fall through to candidate logic below
                    }
                }
            }

            // Candidate strategies to locate the vocab file in the chess folder
            const candidates = allFiles.filter(f => {
                const p = (f.file.path || '').toLowerCase();
                const name = (f.file.name || '').toLowerCase();
                const inChessFolder = settings.chessFolder ? p.startsWith(settings.chessFolder.toLowerCase() + '/') : false;
                const looksLikeVocab = name.includes('chess vocab') || name.includes('chess-vocab') || name.includes('chess_vocab') || name.includes('vocab');
                return (inChessFolder && looksLikeVocab) || name.includes('chess vocab') || p.includes('/chess vocab');
            });

            if (candidates.length === 0) {
                // fallback: look for a top-level file called 'chess vocab.md'
                const fallback = allFiles.find(f => (f.file.path || '').toLowerCase().endsWith('/chess vocab.md') || (f.file.name || '').toLowerCase() === 'chess vocab.md');
                if (fallback) candidates.push(fallback);
            }

            if (candidates.length === 0) {
                if (mounted) setChessVocabLines(null);
                return;
            }

            const file = candidates[0].file;
            try {
                const text = await plugin.app.vault.cachedRead(file);
                if (!mounted) return;
                if (typeof text !== 'string') {
                    setChessVocabLines(null);
                    return;
                }
                const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).length;
                setChessVocabLines(lines);
            } catch (e) {
                if (mounted) setChessVocabLines(null);
            }
        };

        findAndCountChess();

        return () => { mounted = false; };
    }, [allFiles, settings.chessFolder, settings.chessVocabPath, plugin]);

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
                <span className="stat-value">{papersFileCount !== null ? papersFileCount : stats.papers}</span>
                <span className="stat-label">Papers</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{chessVocabLines !== null ? chessVocabLines : stats.chess}</span>
                <span className="stat-label">Chess</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{russianVocabLines !== null ? russianVocabLines : stats.russian}</span>
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
