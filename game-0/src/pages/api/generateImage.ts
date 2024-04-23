// pages/api/generateImage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

type ApiResponse = {
    url?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    
    
    if (req.method === 'POST') {
        // Check if the environment is set for testing
        if (process.env.TESTING === "true") {
            res.status(200).json({ url: "https://upload.wikimedia.org/wikipedia/en/e/ed/Nyan_cat_250px_frame.PNG" });
            return;
        }
  
        // ADJUST PARAMETERS HERE
        // based on options listed here: https://replicate.com/stability-ai/sdxl
        const input = {
            width: 1024,
            height: 1024,
            prompt: req.body.userPrompt,
            refine: "expert_ensemble_refiner",
            apply_watermark: false,
            num_inference_steps: 25
        };

        try {
            const replicate = new Replicate();
            const output = await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", { input });

            if (!Array.isArray(output) || output.length === 0 || typeof output[0] !== 'string') {
                throw new Error('Invalid or no image URLs returned.');
            }
    
            console.log("success!");
            console.log(output);
            res.status(200).json({ url: output[0] });
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'An unknown error occurred' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
