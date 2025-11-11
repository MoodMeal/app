// components/FoodMoodApp.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { RecommendationsAPI } from '@/lib/api/recommendations';

interface QuickSuggestion {
    name: string;
    description: string;
}
export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

    const handleAskAI = async () => {
        if (!searchQuery.trim()) return;

        setLoadingSuggestions(true);
        try {
            const res = await RecommendationsAPI.getQuickDishSuggestion(searchQuery);
            setSuggestions(res.data.suggestions);
        } catch (err) {
            console.error('Failed to fetch AI suggestions:', err);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find out what to eat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                </div>
            </div>

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
                                        onClick={() => setSelectedMood(mood.id)}
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

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* AI Chef Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Your Personal AI Chef</h3>
                            </div>

                            <p className="text-gray-600 mb-4">Ask me anything food related.</p>

                            {/* Quick Category Buttons */}
                            <div className="flex gap-2 mb-4">
                                {quickCategories.map((cat, idx) => (
                                    <button
                                        key={idx}
                                        className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Input + Button */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Foods for nursing mothers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-gray-300"
                                />
                                <button
                                    onClick={handleAskAI}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Ask
                                </button>
                            </div>

                            {/* Loading State */}
                            {loadingSuggestions && <p className="text-gray-500 mb-2">Loading suggestions...</p>}

                            {/* Suggestions List */}
                            {Array.isArray(suggestions) && suggestions.length > 0 && (
                                <ul className="space-y-2">
                                    {suggestions.map((s, idx) => (
                                        <li
                                            key={idx}
                                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <strong>{s.name}</strong>: {s.description}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Categories</h3>

                            <div className="flex gap-2 mb-6">
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
                                        <button className="px-4 py-2 bg-gray-300 rounded-lg text-sm font-medium self-center hover:bg-gray-400 transition-colors">
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
