import type { Request, Response } from 'express';
import { generateRandomUserPrompts } from '../utils/openai.js';

// Gets a list of suggestions that the user can use to ask Dietician
export async function getSuggestedPrompts(req: Request, res: Response): Promise<void> {
    try {
        const prompts = await generateRandomUserPrompts();
        res.json({ data: prompts });
    } catch (error) {
        console.error('Failed to fetch AI prompts:', error);
        res.status(500).json({ error: 'Failed to fetch AI prompts' });
    }
}
