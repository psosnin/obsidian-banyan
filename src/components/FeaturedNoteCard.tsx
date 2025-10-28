import * as React from "react";
import { useEffect } from "react";
import { useCombineStore } from "src/store";
import CardNote from "src/pages/cards/CardNote";

export const FeaturedNoteCard = () => {
    const settings = useCombineStore((state) => state.settings);
    const featuredNote = useCombineStore((state) => state.featuredNote);
    const loadNoteByPath = useCombineStore((state) => state.loadNoteByPath);
    const setFeaturedNote = useCombineStore((state) => state.setFeaturedNote);

    useEffect(() => {
        const loadFeatured = async () => {
            if (settings.featuredNotePath) {
                const note = await loadNoteByPath(settings.featuredNotePath);
                setFeaturedNote(note);
            }
        };
        loadFeatured();
    }, [settings.featuredNotePath, loadNoteByPath, setFeaturedNote]);

    if (!featuredNote) {
        return (
            <div className="featured-note-card empty">
                <p>No featured note set. Configure it in settings.</p>
            </div>
        );
    }

    return (
        <div className="featured-note-card">
            <CardNote fileInfo={featuredNote} />
        </div>
    );
};
