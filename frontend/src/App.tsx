import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2, Plus, ChefHat, Heart } from 'lucide-react';

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
interface RecommendedDish {
  id: number;
  name: string;
  description: string;
  cuisine?: string;
  country?: string;
  reasoning?: string;
}
interface ChatSideBySideProps {
  userId: number;
  apiBaseUrl?: string;
}

export default function ChatSideBySide({ userId = 1, apiBaseUrl = 'http://localhost:4000/api' }: ChatSideBySideProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [suggestions, setSuggestions] = useState<any>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [recommendedDishes, setRecommendedDishes] = useState<RecommendedDish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
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

      setLoadingDishes(true);
      const dishResponse = await fetch(`${apiBaseUrl}/recommendations/session/${sessionId}`);
      const dishData = await dishResponse.json();
      setRecommendedDishes(dishData?.length ? dishData : []);
    } catch (error) {
      console.error('Failed to load session or dishes:', error);
      setRecommendedDishes([]);
    } finally {
      setLoadingDishes(false);
    }
  };

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setRecommendedDishes([]);
    setShowSessions(false);
  };

  useEffect(() => {
    const getRandomSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const cached = localStorage.getItem("dietary_suggestions");
        const cachedAt = localStorage.getItem("dietary_suggestions_timestamp");
        const now = Date.now();
        if (cached && cachedAt && now - parseInt(cachedAt) < 60 * 1000) {
          setSuggestions(JSON.parse(cached));
          return;
        }
        const response = await fetch(`${apiBaseUrl}/prompts/suggest`);
        const { data } = await response.json();
        if (response.ok && data) {
          setSuggestions(data);
          localStorage.setItem("dietary_suggestions", JSON.stringify(data));
          localStorage.setItem("dietary_suggestions_timestamp", now.toString());
        }
      } catch (err: any) {
        console.error("Failed to load suggestions:", err.message);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    getRandomSuggestions();
  }, [apiBaseUrl]);

  const deleteDishRecommendation = async (dishId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this dish?')) return;
    try {
      await fetch(`${apiBaseUrl}/recommendations/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId })
      });
      setRecommendedDishes((prev) => prev.filter((s) => s.id !== dishId));
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
    }
  };

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      await fetch(`${apiBaseUrl}/chat/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) createNewSession();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setLoadingDishes(true);

    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    let streamedContent = '';
    let actualSessionId = currentSession?.id;
    setStreamingMessage('Typing...');

    try {
      const chatResponse = await fetch(`${apiBaseUrl}/chat/message/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: actualSessionId || null,
          userId,
          message: userMessage,
          firstMessage: !actualSessionId ? userMessage : undefined,
        }),
      });

      if (!chatResponse.body) throw new Error('No response body from chat');

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'session') {
            actualSessionId = data.sessionId;
            const sessionRes = await fetch(`${apiBaseUrl}/chat/sessions/${actualSessionId}`);
            const { data: sessionData } = await sessionRes.json();
            setCurrentSession(sessionData);
            setMessages(sessionData.messages || []);
            loadSessions();
          }

          if (data.type === 'chunk') {
            streamedContent += data.content;
          }

          if (data.type === 'done') {
            const assistantMessage: Message = {
              id: data.messageId || Date.now() + 1,
              role: 'assistant',
              content: streamedContent,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingMessage('');
            streamedContent = '';
            fetchDishRecommendations(actualSessionId, userId, assistantMessage.content);
          }

          if (data.type === 'error') {
            console.error('Chat streaming error:', data.error);
            alert('Failed to process message. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
      setLoadingDishes(false);
      setStreamingMessage('');
    }
  };

  const fetchDishRecommendations = async (sessionId: number | undefined, userId: number, message: string) => {
    try {
      const dishResponse = await fetch(`${apiBaseUrl}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, message, healthConditions: [] }),
      });
      const dishData = await dishResponse.json();
      if (dishData?.data?.length) {
        const newDishes: RecommendedDish[] = dishData.data.map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          cuisine: dish.cuisine,
          country: dish.country,
          reasoning: dish.reasoning,
        }));
        setRecommendedDishes(newDishes);
      } else setRecommendedDishes([]);
    } catch (err) {
      console.error('Failed to fetch dish recommendations:', err);
      setRecommendedDishes([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-y-hidden bg-primary text-primary">
      {/* Sidebar */}
      <div className={`${showSessions ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-20 w-64 bg-secondary border-r border-primary h-full transition-transform duration-300`}>
        <div className="p-4 border-b border-primary">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-4 py-2 bg-accent text-secondary rounded-lg hover:brightness-90 transition"
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
              className={`p-3 border-b border-primary cursor-pointer hover:bg-tertiary ${currentSession?.id === session.id ? 'bg-accent/10' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-secondary">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="text-muted hover:text-error flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingMessage && (
            <div className="text-center text-secondary mt-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted" />
              <h2 className="text-xl font-semibold mb-2">Ask Your Dietary Consultant</h2>
              <p className="text-sm mb-6">Get personalized dietary recommendations based on your health conditions</p>
            </div>
          )}
          <div className="max-w-2xl mx-auto mt-15">
            {messages.length === 0 && (
              !loadingSuggestions ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="text-left p-3 border border-primary rounded-lg hover:bg-tertiary text-sm transition flex-1"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4 text-muted">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                </div>
              )
            )}
          </div>

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-accent text-secondary' : 'bg-secondary border border-primary'}`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-secondary border border-primary">
                <div className="whitespace-pre-wrap">{streamingMessage}</div>
                <div className="flex items-center gap-1 mt-2 text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-secondary border-t border-primary p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="lg:hidden px-3 border border-primary rounded-lg hover:bg-tertiary transition"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about dietary recommendations..."
              className="flex-1 border border-primary rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-6 bg-accent text-secondary rounded-lg hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Panel */}
      <div className="hidden xl:block w-96 border-l border-primary bg-secondary flex flex-col h-full">
        <div className="p-4 border-b border-primary flex-shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            <h2 className="font-semibold">Recommended Dishes</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100%-64px)]">
          {recommendedDishes.map((dish, i) => (
            <div key={i} className="p-4 rounded-lg border-2 border-accent/50 bg-tertiary hover:border-accent transition-colors relative">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-sm mb-1">{dish.name}</h3>
                  {dish.cuisine && dish.country && (
                    <p className="text-xs text-secondary">{dish.cuisine} • {dish.country}</p>
                  )}
                </div>
                <Heart className="w-5 h-5 text-accent flex-shrink-0" />
              </div>
              <p className="text-xs text-secondary mb-2">{dish.description}</p>
              {dish.reasoning && (
                <div className="mt-2 pt-2 border-t border-primary">
                  <p className="text-xs text-secondary italic">💡 {dish.reasoning}</p>
                </div>
              )}
              <button
                onClick={(e) => deleteDishRecommendation(dish.id, e)}
                className="absolute top-2 right-2 text-muted hover:text-error"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {loadingDishes && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted mb-2" />
              <p className="text-sm text-secondary">Finding perfect dishes for you...</p>
            </div>
          )}

          {!loadingDishes && recommendedDishes.length === 0 && (
            <div className="text-center text-secondary py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-2 text-muted" />
              <p className="text-sm">Ask about your dietary needs to see dish recommendations</p>
            </div>
          )}
        </div>
      </div>

      {showSessions && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setShowSessions(false)} />
      )}
    </div>
  );
}
