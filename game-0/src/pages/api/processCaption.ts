// pages/api/processCaption.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type ApiResponse = {
    translation?: string;
    imageUrl?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    

    try {
        // Call the translateText API
        console.log("processCaption");
        //console.log(req.body);
        const { text, language } = req.body;

        let translatedText;

        if (language == 'en') {
            // If the language is English, use the original text as the translation
            translatedText = text;
        } else {
            // Make an API call to translate the text
            const translateResponse = await fetch('http://localhost:3000/api/translateText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, language })
            });
            const translateData = await translateResponse.json();
            if (!translateResponse.ok) {
                // Throw an error if the translation API fails
                throw new Error(translateData.error || 'Failed to translate text');
            }
            translatedText = translateData.translation; // Assign the translation from the response
        }
        

        // Call the generateImage API with the translated text
        const imageResponse = await fetch('http://localhost:3000/api/generateImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userPrompt: translatedText })
        });
        const imageData = await imageResponse.json();

        if (!imageResponse.ok) {
            throw new Error(imageData.error || 'Failed to generate image');
        }

        // Respond with both translation and image URL
        res.status(200).json({ translation: translatedText, imageUrl: imageData.url });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
}
