import { openai } from "./client.js";
import { PROMPTS } from "../../prompts/prompts.js";
export async function generateUserPromptSuggestions() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.randomUserPrompts.system,
                },
                {
                    role: 'user',
                    content: 'Generate random short dietary question examples as a JSON array of strings.',
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.9,
        });
        const raw = response.choices[0]?.message?.content;
        if (!raw)
            throw new Error('Empty AI response');
        const parsed = JSON.parse(raw);
        // ✅ handle both direct array or object with .questions
        const prompts = Array.isArray(parsed)
            ? parsed
            : parsed.questions || parsed.prompts || [];
        if (!Array.isArray(prompts) || prompts.length === 0) {
            throw new Error('AI response is not a valid array');
        }
        return prompts;
    }
    catch (err) {
        console.error('🔥 Error generating random prompts:', {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
        });
        return [
            'What foods help reduce stress?',
            'Can I eat eggs daily?',
            'Best dinner ideas for diabetics?',
            'What’s a healthy snack for ulcers?',
            'Is oatmeal good for weight loss?',
        ];
    }
}
//# sourceMappingURL=userPrompts.js.map