import React, { useState, useRef } from 'react';
import styles from './TextAreaWithPopover.module.css';

interface TextAreaWithPopoverProps {
    userPrompt: string;
    setUserPrompt: (prompt: string) => void;
    onTranslate: (selectedText: string, language: string) => void;
}

const TextAreaWithPopover: React.FC<TextAreaWithPopoverProps> = ({ userPrompt, setUserPrompt, onTranslate }) => {
    const [showPopover, setShowPopover] = useState<boolean>(false);
    const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const translateText = async (language: string) => {
        const selectedText = window.getSelection()?.toString();
        if (!selectedText) return;

        console.log(`Translating text: "${selectedText}" to ${language}`);
        setShowPopover(false); // Hide popover after selecting an option
        onTranslate(selectedText, language);
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopoverPosition({
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY - 40
            });
            setShowPopover(true);
        } else {
            setShowPopover(false);
        }
    };

    return (
        <div className={styles.container} onMouseUp={handleTextSelection}>
            <textarea
                ref={textAreaRef}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={5}
                className={styles.textArea}
            />
            {showPopover && (
                <div className={styles.popover} style={{ left: `${popoverPosition.x}px`, top: `${popoverPosition.y}px` }}>
                    <button onClick={() => translateText('fr')}>French</button>
                    <button onClick={() => translateText('de')}>German</button>
                    <button onClick={() => translateText('ko')}>Korean</button>
                    <button onClick={() => translateText('es')}>Spanish</button>
                </div>
            )}
        </div>
    );
};

export default TextAreaWithPopover;