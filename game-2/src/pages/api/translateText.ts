// pages/api/translateText.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as deepl from 'deepl-node';

type ApiResponse = {
    translation?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    const authKey = process.env.DEEPL_API_TOKEN;
    if (!authKey) {
        console.error('DEEPL_API_TOKEN 환경 변수가 설정되지 않았습니다');
        res.status(500).json({ error: 'DEEPL_API_TOKEN 환경 변수가 설정되지 않았습니다' });
        return;
    }

    if (req.method === 'POST') {
        // 테스트 환경 설정 여부 확인
        if (process.env.TESTING === "true") {
            res.status(200).json({ translation: "가짜 번역" });
            return;
        }

        const { text, language } = req.body;

        if (!text || !language) {
            console.error('잘못된 요청 본문', req.body);
            res.status(400).json({ error: '잘못된 요청 본문' });
            return;
        }

        try {
            console.log("번역 중인 텍스트:", text);
            const translator = new deepl.Translator(authKey);
            const output = await translator.translateText(text, null, language);

            if (Array.isArray(output)) {
                throw new Error('하나의 번역 결과가 예상되었으나, 배열이 반환되었습니다.');
            }

            console.log("번역 성공!", output);
            res.status(200).json({ translation: output.text });
        } catch (error: any) {
            console.error('번역 오류:', error);
            res.status(500).json({ error: error.message || '알 수 없는 오류가 발생했습니다' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`허용되지 않는 메서드: ${req.method}`);
    }
}
