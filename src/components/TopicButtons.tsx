import * as React from "react";
import { useCombineStore } from "src/store";
import { useState, useEffect } from "react";

export const TopicButtons = () => {
    const settings = useCombineStore((state) => state.settings);
    const loadNoteByPath = useCombineStore((state) => state.loadNoteByPath);
    const setSelectedTopicNote = useCombineStore((state) => state.setSelectedTopicNote);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);

    // Load the first topic by default
    useEffect(() => {
        if (settings.topicButtons && settings.topicButtons.length > 0 && !activeTopic) {
            const firstTopic = settings.topicButtons[0];
            handleTopicClick(firstTopic.id, firstTopic.notePath);
        }
    }, [settings.topicButtons]);

    const handleTopicClick = async (id: string, notePath: string) => {
        console.log('Topic button clicked:', id, notePath);
        setActiveTopic(id);
        const note = await loadNoteByPath(notePath);
        console.log('Loaded note:', note);
        setSelectedTopicNote(note);
    };

    console.log('TopicButtons render - settings.topicButtons:', settings.topicButtons);

    if (!settings.topicButtons || settings.topicButtons.length === 0) {
        console.log('No topic buttons to display');
        return (
            <div className="topic-buttons-section">
                <h2 className="topic-buttons-header">Topics</h2>
                <div className="topic-buttons-container">
                    <p style={{ color: 'var(--text-muted)', padding: '16px' }}>
                        No topics configured. Add topics in settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="topic-buttons-section">
            <h2 className="topic-buttons-header">Topics</h2>
            <div className="topic-buttons-container">
                {settings.topicButtons.map((topic) => (
                    <button
                        key={topic.id}
                        className={`topic-button ${activeTopic === topic.id ? 'active' : ''}`}
                        onClick={() => handleTopicClick(topic.id, topic.notePath)}
                    >
                        {topic.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
