import type { Request, Response } from 'express';
interface SessionParams {
    sessionId: string;
}
export declare const getAllSessions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getChatBySessionId: (req: Request<SessionParams>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createChatSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteChatSession: (req: Request<SessionParams>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const streamMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=chatController.d.ts.map