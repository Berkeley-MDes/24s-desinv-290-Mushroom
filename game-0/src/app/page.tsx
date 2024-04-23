'use client';
import { useState } from 'react';
import './page.module.css'; // Import your styles here

interface TranslationResult {
    lang: string;
    translation: string;
    imageUrl: string;
}

export default function Home() {
    const [userPrompt, setUserPrompt] = useState('');
    const [translations, setTranslations] = useState<TranslationResult[]>([]);
    const [loading, setLoading] = useState(false);

    const languages = ['fr', 'de', 'ja', 'en']; // Defined languages for translation

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
      <div className="page-container">
          <div className="form-container">
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
          <div className="grid-container">
              {translations.map(({ lang, translation, imageUrl }, index) => (
                  <div key={index} className="grid-item">
                      <p>{`Language: ${lang} - Translation: ${translation}`}</p>
                      {imageUrl && <img src={imageUrl} alt={`Generated in ${lang}`} />}
                  </div>
              ))}
          </div>
      </div>
  );
}
