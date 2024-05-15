'use client';

import React, { useState, useRef } from 'react';
import styles from './page.module.css';

const Home: React.FC = () => {
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPopover, setShowPopover] = useState<boolean>(false);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const generateImage = async () => {
        if (!userPrompt.trim()) {
            alert('Please enter a prompt.');
            return;
        }

        setLoading(true);
        console.log(`Generating image for prompt: "${userPrompt}"`);
        try {
            const response = await fetch('/api/generateImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPrompt }),
            });
            const data = await response.json();
            if (response.ok) {
                setImageUrl(data.url);
                console.log(`Image generated: ${data.url}`);
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error: any) {
            console.error('Image generation failed:', error);
            alert('Image generation failed: ' + (error.message || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleTranslate = async (text: string, language: string) => {
        console.log(`Translating text: "${text}" to ${language}`);
        const placeholder = '__(TRANSLATE)__';

        const textWithSpaces = new RegExp(`(\\s*)${text}(\\s*)`);
        setUserPrompt(currentPrompt => currentPrompt.replace(textWithSpaces, (_, p1, p2) => `${p1}${placeholder}${p2}`));

        try {
            const response = await fetch('/api/translateText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), language }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`Translation result: ${data.translation}`);
                setUserPrompt(currentPrompt => {
                    const updatedPrompt = currentPrompt.replace(placeholder, data.translation.trim());
                    return updatedPrompt;
                });
            } else {
                console.error('Translation error:', data.error);
                throw new Error(data.error || 'Failed to translate text');
            }
        } catch (error: any) {
            console.error('Translation failed:', error);
            alert('Translation failed: ' + (error.message || 'Unknown error'));
        }
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

    const translateText = async (language: string) => {
        const selectedText = window.getSelection()?.toString();
        if (!selectedText) return;

        console.log(`Translating text: "${selectedText}" to ${language}`);
        setShowPopover(false); // Hide popover after selecting an option
        handleTranslate(selectedText, language);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.textAreaContainer} onMouseUp={handleTextSelection}>
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
            <button onClick={generateImage} disabled={loading} className={styles.generateButton}>
                {loading ? 'Processing...' : 'Generate Image'}
            </button>
            {imageUrl && <img src={imageUrl} alt="Generated Image" className={styles.image} />}
        </div>
    );
};

export default Home;
