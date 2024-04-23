// pages/api/generateImage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as deepl from 'deepl-node';

type ApiResponse = {
    translation?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    
    const authKey = process.env.DEEPL_API_TOKEN;
    if (!authKey) {
        res.status(500).json({ error: 'DEEPL_API_TOKEN environment variable not set' });
        return;
    }
    
    if (req.method === 'POST') {
        // Check if the environment is set for testing
        if (process.env.TESTING === "true") {
            res.status(200).json({ translation: "a fake translation" });
            return;
        }

        console.log("translateText");
        //console.log(req.body);
        const { text, language } = req.body;

        try {
            const translator = new deepl.Translator(authKey);

            const output = await translator.translateText(text, null, language); 

            if (Array.isArray(output)) {
                throw new Error('Expected a single translation result, but got an array.');
            }
            
            console.log("success!");
            console.log(output);
            res.status(200).json({ translation: output.text });
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'An unknown error occurred' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
