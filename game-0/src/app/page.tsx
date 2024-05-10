// Use client directive
'use client';

import React, { useState } from 'react';
import styles from './page.module.css'; // Make sure the import name matches the file name

interface TranslationResult {
    lang: string;
    translation: string;
    imageUrl: string;
}

const Home: React.FC = () => {
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [translations, setTranslations] = useState<TranslationResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const languages = ['en', 'de', 'ja', 'fr']; // Defined languages for translation

    const doProcessCaptions = async () => {
        setLoading(true);
        setTranslations([]); // Clear previous translations
        try {
            // Process all languages
            const promises = languages.map(lang => {
                return fetch('/api/processCaption', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ text: userPrompt, language: lang }),
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.error) {
                        return { lang, translation: data.translation, imageUrl: data.imageUrl };
                    } else {
                        throw new Error(data.error);
                    }
                });
            });
            
            // Wait for all promises to resolve
            const results = await Promise.all(promises);
            setTranslations(results);
        } catch (error: any) {
            console.error('Processing failed:', error);
            alert('Processing failed: ' + (error.message || 'Unknown error'));
        }
        setLoading(false);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                />
                <button onClick={doProcessCaptions} disabled={loading}>
                    {loading ? 'Processing...' : 'Translate and Generate Image'}
                </button>
            </div>
            <div className={styles.gridContainer}>
                {translations.map(({ lang, translation, imageUrl }, index) => (
                    <div key={index} className={styles.gridItem}>
                        <p>{`Language: ${lang} - Translation: ${translation}`}</p>
                        {imageUrl && <img src={imageUrl} alt={`Generated in ${lang}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
