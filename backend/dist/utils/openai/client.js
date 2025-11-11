import OpenAI from 'openai';
import { config } from '../../config.js';
if (!config.openaiKey)
    throw new Error("OPENAI_API_KEY is missing");
export const openai = new OpenAI({ apiKey: config.openaiKey });
//# sourceMappingURL=client.js.map