import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2, Plus } from 'lucide-react';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

interface Session {
    id: number;
    title: string;
    updatedAt: string;
    messages?: Message[];
}

interface ChatProps {
    userId: number;
    apiBaseUrl?: string;
}

export default function Chat({ userId, apiBaseUrl = 'http://localhost:4000/api' }: ChatProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [showSessions, setShowSessions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/chat/sessions?userId=${userId}`);
            const { data } = await response.json();
            setSessions(data || []);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadSession = async (sessionId: number) => {
        try {
            const response = await fetch(`${apiBaseUrl}/chat/sessions/${sessionId}`);
            const { data } = await response.json();
            setCurrentSession(data);
            setMessages(data.messages || []);
            setShowSessions(false);
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const createNewSession = () => {
        setCurrentSession(null);
        setMessages([]);
        setShowSessions(false);
    };

    const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this conversation?')) return;

        try {
            await fetch(`${apiBaseUrl}/chat/sessions/${sessionId}`, {
                method: 'DELETE',
            });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (currentSession?.id === sessionId) {
                createNewSession();
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setLoading(true);

        // Optimistically add user message
        const tempUserMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await fetch(`${apiBaseUrl}/chat/message/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSession?.id,
                    userId,
                    message: userMessage,
                }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';
            let newSessionId = currentSession?.id;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'session') {
                                newSessionId = data.sessionId;
                                if (!currentSession) {
                                    setCurrentSession({ id: newSessionId, title: userMessage.substring(0, 50), updatedAt: new Date().toISOString() });
                                }
                            } else if (data.type === 'chunk') {
                                streamedContent += data.content;
                                setStreamingMessage(streamedContent);
                            } else if (data.type === 'done') {
                                const assistantMessage: Message = {
                                    id: data.messageId,
                                    role: 'assistant',
                                    content: streamedContent,
                                    createdAt: new Date().toISOString(),
                                };
                                setMessages((prev) => [...prev, assistantMessage]);
                                setStreamingMessage('');
                                loadSessions(); // Refresh session list
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        } finally {
            setLoading(false);
            setStreamingMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`${showSessions ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:relative z-20 w-64 bg-white border-r h-full transition-transform duration-300`}
            >
                <div className="p-4 border-b">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-73px)]">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => loadSession(session.id)}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${currentSession?.id === session.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{session.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(session.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b p-4 flex items-center gap-3">
                    <button
                        onClick={() => setShowSessions(!showSessions)}
                        className="lg:hidden text-gray-600"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                        <h1 className="font-semibold text-lg">Dietary Consultant</h1>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !streamingMessage && (
                        <div className="text-center text-gray-500 mt-12">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
                            <p className="text-sm">
                                Ask me about dietary recommendations for your health conditions
                            </p>
                            <div className="mt-6 space-y-2 max-w-md mx-auto">
                                <button
                                    onClick={() => setInput('I have ulcer what should I not eat')}
                                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    I have ulcer what should I not eat?
                                </button>
                                <button
                                    onClick={() => setInput('What foods are good for diabetes?')}
                                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    What foods are good for diabetes?
                                </button>
                                <button
                                    onClick={() => setInput('I need a heart-healthy diet plan')}
                                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    I need a heart-healthy diet plan
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-gray-200'
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                        </div>
                    ))}

                    {streamingMessage && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg p-4 bg-white border border-gray-200">
                                <div className="whitespace-pre-wrap">{streamingMessage}</div>
                                <div className="flex items-center gap-1 mt-2 text-gray-400">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-xs">Typing...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t p-4">
                    <div className="max-w-4xl mx-auto flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about dietary recommendations..."
                            className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="px-6 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {showSessions && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setShowSessions(false)}
                />
            )}
        </div>
    );
}