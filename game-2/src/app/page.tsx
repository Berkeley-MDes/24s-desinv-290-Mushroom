'use client';

import React, { useState } from 'react';
import TextAreaWithPopover from './TextAreaWithPopover';
import styles from './page.module.css';


const Home: React.FC = () => {
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const generateImage = async (prompt: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/generateImage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userPrompt: prompt }),
            });
            const data = await response.json();
            if (response.ok) {
                setImageUrl(data.url);
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error: any) {
            console.error('Image generation failed:', error);
            alert('Image generation failed: ' + (error.message || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleTranslate = (text: string, language: string) => {
        // Temporarily show something during loading
        setUserPrompt(currentPrompt => currentPrompt.replace(text, '... '));
    
        fetch('/api/translateText', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text, language }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.translation) {
                // Update prompt with the translation and then regenerate the image
                setUserPrompt(currentPrompt => {
                    // Replace the placeholder '...' with the actual translation
                    const updatedPrompt = currentPrompt.replace('...', data.translation + ' ');
                    // Call generateImage only here, after state is guaranteed to be updated
                    generateImage(updatedPrompt);
                    return updatedPrompt; // Update the state to the new prompt
                });
            }
        })
        .catch(error => {
            console.error('Translation failed:', error);
            alert('Translation failed: ' + (error.message || 'Unknown error'));
        });
    };
    
    

    return (
        <div className={styles.pageContainer}>
            <TextAreaWithPopover
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                onTranslate={handleTranslate}
            />
            {imageUrl && <img src={imageUrl} alt="Generated Image" className={styles.image} />}
        </div>
    );
};

export default Home;
