// components/FoodMoodApp.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles, X, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecommendationsAPI } from '@/lib/api/recommendations';

interface QuickSuggestion {
    name: string;
    description: string;
}

export default function HomePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [interactionCount, setInteractionCount] = useState(0);

    const moods = [
        { id: 1, label: 'Happy', icon: '😊' },
        { id: 2, label: 'Sad', icon: '😢' },
        { id: 3, label: 'Angry', icon: '😠' },
        { id: 4, label: 'Sleepy', icon: '😴' },
        { id: 5, label: 'Hungry', icon: '🤤' },
        { id: 6, label: 'Tired', icon: '😮‍💨' },
        { id: 7, label: 'Romantic', icon: '💝' },
        { id: 8, label: 'Healthy', icon: '💪' },
    ];

    const foods = [
        { id: 1, name: 'Greek Salad', description: 'Olive Oil, Feta Cheese & Olives' },
        { id: 2, name: 'Greek Salad', description: 'Olive Oil, Feta Cheese & Olives' },
        { id: 3, name: 'Greek Salad', description: 'Olive Oil, Feta Cheese & Olives' },
    ];

    const categories = [
        {
            id: 1,
            title: 'Healthy Foods',
            description: 'Healthy Foods to promote healthy living',
            color: 'bg-gray-400',
        },
        {
            id: 2,
            title: 'Workout prep',
            description: 'Maximize gains with what you eat',
            color: 'bg-gray-400',
        },
        {
            id: 3,
            title: 'Seafoods',
            description: 'Explore different seafoods',
            color: 'bg-gray-400',
        },
        {
            id: 4,
            title: 'Baby Prep',
            description: 'Foods to promote growth of your child and baby',
            color: 'bg-gray-400',
        },
    ];

    const quickCategories = ['Healthy Foods', 'Seafoods', 'Party Foods'];
    const categoryTags = ['More Salads', 'Protein Salads', 'Protein Salads'];

    const handleAskAI = async (query: string) => {
        if (!query.trim()) return;

        setLoadingSuggestions(true);
        setAiPrompt(query);
        setInteractionCount(prev => prev + 1);

        try {
            const res: any = await RecommendationsAPI.getQuickDishSuggestion(query);
            setSuggestions(res.data.suggestions);
        } catch (err) {
            console.error('Failed to fetch AI suggestions:', err);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleMoodSelect = async (moodId: number, moodLabel: string) => {
        setSelectedMood(moodId);
        const query = `Suggest foods for when someone feels ${moodLabel}.`;
        await handleAskAI(query);
    };

    const handleQuickCategory = (category: string) => {
        const query = `Suggest ${category.toLowerCase()}`;
        setSearchQuery(query);
        handleAskAI(query);
    };

    const clearSuggestions = () => {
        setSuggestions([]);
        setSelectedMood(null);
        setAiPrompt('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Find out what to eat"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAskAI(searchQuery)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>
                        <button
                            onClick={() => handleAskAI(searchQuery)}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Ask AI
                        </button>
                    </div>

                    {/* Quick Categories */}
                    <div className="flex gap-2 mt-3">
                        {quickCategories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickCategory(cat)}
                                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Chat Button */}
            <button
                onClick={() => router.push('/chat')}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
                aria-label="Open chat with AI Dietician"
            >
                <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                    AI
                </span>
            </button>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Mood Selection */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6">Select Food Based On Your Mood</h2>
                            <div className="grid grid-cols-4 gap-6">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => handleMoodSelect(mood.id, mood.label)}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${selectedMood === mood.id
                                                ? 'bg-gray-200 scale-105'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
                                            {mood.icon}
                                        </div>
                                        <span className="text-sm font-medium">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions Feed */}
                        {(loadingSuggestions || suggestions.length > 0) && (
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-lg text-white">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-gray-900" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">AI Chef Recommendations</h3>
                                            {aiPrompt && (
                                                <p className="text-sm text-gray-300 mt-1">"{aiPrompt}"</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearSuggestions}
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {loadingSuggestions ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-pulse flex items-center gap-3">
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {suggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all cursor-pointer"
                                                >
                                                    <h4 className="font-bold text-lg mb-2">{suggestion.name}</h4>
                                                    <p className="text-sm text-gray-200">{suggestion.description}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progressive CTA - Shows after 2nd interaction */}
                                        {interactionCount >= 2 && (
                                            <div className="mt-6 pt-6 border-t border-white/20 animate-fadeIn">
                                                <div className="flex flex-col sm:flex-row items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg mb-1">Want More Personalized Advice?</h4>
                                                        <p className="text-sm text-gray-300">Chat with our AI Dietician for detailed recommendations tailored to your needs</p>
                                                    </div>
                                                    <button
                                                        onClick={() => router.push('/chat')}
                                                        className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg"
                                                    >
                                                        Start Full Chat
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Foods Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6">Foods</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {foods.map((food) => (
                                    <div key={food.id} className="space-y-3">
                                        <div className="aspect-square bg-gray-200 rounded-xl" />
                                        <div>
                                            <h3 className="font-semibold text-lg">{food.name}</h3>
                                            <p className="text-sm text-gray-600">{food.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Categories */}
                    <div className="space-y-6">
                        {/* Hero CTA Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">AI Dietician</h3>
                            </div>
                            <p className="text-sm mb-4 text-white/90">
                                Get personalized dietary advice, meal plans, and nutrition guidance tailored to your health goals.
                            </p>
                            <button
                                onClick={() => router.push('/chat')}
                                className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                Start Conversation
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Categories</h3>

                            <div className="flex gap-2 mb-6 flex-wrap">
                                {categoryTags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex gap-4 bg-gray-100 rounded-xl p-4 hover:bg-gray-200 transition-colors"
                                    >
                                        <div
                                            className={`w-20 h-20 ${category.color} rounded-lg flex-shrink-0`}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{category.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {category.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAskAI(`Tell me about ${category.title.toLowerCase()}`)}
                                            className="px-4 py-2 bg-gray-300 rounded-lg text-sm font-medium self-center hover:bg-gray-400 transition-colors"
                                        >
                                            Ask More
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}