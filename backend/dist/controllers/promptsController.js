import { generateRandomUserPrompts } from '../utils/openai.js';
// Gets a list of suggestions that the user can use to ask Dietician
export async function getSuggestedPrompts(req, res) {
    try {
        const prompts = await generateRandomUserPrompts();
        res.json({ data: prompts });
    }
    catch (error) {
        console.error('Failed to fetch AI prompts:', error);
        res.status(500).json({ error: 'Failed to fetch AI prompts' });
    }
}
//# sourceMappingURL=promptsController.js.map