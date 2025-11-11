import { openai } from "./openai/client.js";
export async function generateHomeAIPromptReply(prompt) {
    if (!prompt)
        return "";
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: "You are a concise AI food assistant. Answer in 1-2 sentences, friendly and actionable."
                },
                { role: 'user', content: prompt }
            ],
            max_tokens: 60,
            temperature: 0.8,
        });
        return response.choices[0]?.message?.content?.trim() || "";
    }
    catch (err) {
        console.error("Error generating home AI reply:", err);
        return "";
    }
}
//# sourceMappingURL=homePrompt.js.map