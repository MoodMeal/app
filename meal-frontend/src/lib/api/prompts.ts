import { fetcher } from '../utils/fetcher';

export const PromptsAPI = {
    suggest: () => fetcher<{ data: string[] }>(`/prompts/suggest`),
};
