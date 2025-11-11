import { openai } from "./client.js";
import { PROMPTS } from "../../prompts/prompts.js";
/**
 * Generate a short, AI-generated title for a chat session
 */
export async function generateSessionTitle(userMessage, healthConditions = []) {
    if (!userMessage || userMessage.trim().length === 0) {
        return 'New Session';
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.sessionTitle.system(healthConditions)
                },
                {
                    role: 'user',
                    content: `Create a short title for this chat session based on the user's message: "${userMessage.trim()}"`
                }
            ],
            max_tokens: 15,
            temperature: 0.5
        });
        const title = response.choices[0]?.message?.content?.trim();
        return title || 'New Session';
    }
    catch (err) {
        console.error('Error generating session title:', err instanceof Error ? err.message : err);
        return 'New Session';
    }
}
//# sourceMappingURL=sessionTitle.js.map