import { useState, useEffect } from 'react';
import {
    X,
    ChefHat,
    MapPin,
    Sparkles,
    MessageSquare,
    Star,
} from 'lucide-react';

// ==========================
// Types
// ==========================
interface Dish {
    id: number;
    name: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    imageUrl: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface Recommendation {
    id: number;
    userId: number;
    dishId: number | null;
    prompt: string | null;
    createdAt: string;
    user?: {
        name: string | null;
        email: string;
    };
}

interface Feedback {
    id: number;
    userId: number;
    dishId: number;
    rating: number | null;
    comment: string | null;
    createdAt: string;
    user?: {
        name: string | null;
        email: string;
    };
}

interface DishDetailProps {
    dish: Dish;
    onClose: () => void;
    recommendationsApi?: any;
    feedbacksApi?: any;
}

// ==========================
// Helpers
// ==========================
const getFlagUrl = (countryName: string) => {
    const countryCodeMap: Record<string, string> = {
        Italy: 'it',
        France: 'fr',
        Japan: 'jp',
        China: 'cn',
        India: 'in',
        Mexico: 'mx',
        Thailand: 'th',
        Spain: 'es',
        Greece: 'gr',
        Turkey: 'tr',
        'United States': 'us',
        USA: 'us',
        Korea: 'kr',
        Vietnam: 'vn',
        Brazil: 'br',
        Argentina: 'ar',
    };

    const code = countryCodeMap[countryName];
    return code ? `https://flagcdn.com/w640/${code}.png` : null;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// ==========================
// Component
// ==========================
export default function DishDetail({
    dish,
    onClose,
    recommendationsApi,
    feedbacksApi,
}: DishDetailProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] =
        useState<'overview' | 'recommendations' | 'feedbacks'>('overview');

    const flagUrl = dish.country ? getFlagUrl(dish.country) : null;

    // ==========================
    // Fetch data
    // ==========================
    useEffect(() => {
        const fetchDishDetails = async () => {
            setLoading(true);
            try {
                if (recommendationsApi) {
                    const { data: allRecs } = await recommendationsApi.getByDish(dish.id);
                    setRecommendations(allRecs); // No need to filter anymore!
                    setRecommendations(allRecs.filter((r: any) => r.dishId === dish.id));
                }
                if (feedbacksApi) {
                    const { data: feedbackData } = await feedbacksApi.getByDish(dish.id);
                    setFeedbacks(feedbackData);
                }
            } catch (err) {
                console.error('Error fetching dish details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDishDetails();
    }, [dish.id, recommendationsApi, feedbacksApi]);

    const averageRating =
        feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
            feedbacks.filter(f => f.rating).length
            : null;

    // ==========================
    // Render
    // ==========================
    return (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8 flex items-start justify-center">
                <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header Image */}
                    {(flagUrl || dish.imageUrl) && (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg">
                            <img
                                src={flagUrl || dish.imageUrl || ''}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {/* Title and Info */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2">{dish.name}</h2>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                {dish.country && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {dish.country}
                                    </span>
                                )}
                                {dish.cuisine && (
                                    <span className="flex items-center gap-1">
                                        <ChefHat className="w-4 h-4" />
                                        {dish.cuisine}
                                    </span>
                                )}
                                {averageRating && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        {averageRating.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b mb-6">
                            {['overview', 'recommendations', 'feedbacks'].map(section => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section as any)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 capitalize ${activeSection === section
                                        ? 'border-black'
                                        : 'border-transparent text-gray-500'
                                        }`}
                                >
                                    {section}
                                    {section === 'recommendations' && recommendations.length > 0 && (
                                        <span className="ml-1 text-xs">({recommendations.length})</span>
                                    )}
                                    {section === 'feedbacks' && feedbacks.length > 0 && (
                                        <span className="ml-1 text-xs">({feedbacks.length})</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Overview */}
                                {activeSection === 'overview' && (
                                    <div className="space-y-4">
                                        {dish.description && (
                                            <div>
                                                <h3 className="font-medium mb-2">Description</h3>
                                                <p className="text-gray-700">{dish.description}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="border rounded-md p-4">
                                                <div className="text-sm text-gray-600 mb-1">Recommendations</div>
                                                <div className="text-2xl font-semibold">{recommendations.length}</div>
                                            </div>
                                            <div className="border rounded-md p-4">
                                                <div className="text-sm text-gray-600 mb-1">Feedback</div>
                                                <div className="text-2xl font-semibold">{feedbacks.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {activeSection === 'recommendations' && (
                                    <div className="space-y-3">
                                        {recommendations.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>No recommendations yet</p>
                                            </div>
                                        ) : (
                                            recommendations.map(rec => (
                                                <div key={rec.id} className="border rounded-md p-4">
                                                    {rec.user && (
                                                        <div className="text-sm font-medium mb-2">
                                                            {rec.user.name || rec.user.email}
                                                        </div>
                                                    )}
                                                    {rec.prompt && (
                                                        <p className="text-sm text-gray-600 mb-2">"{rec.prompt}"</p>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(rec.createdAt)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Feedbacks */}
                                {activeSection === 'feedbacks' && (
                                    <div className="space-y-3">
                                        {feedbacks.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>No feedback yet</p>
                                            </div>
                                        ) : (
                                            feedbacks.map(feedback => (
                                                <div key={feedback.id} className="border rounded-md p-4">
                                                    {feedback.user && (
                                                        <div className="text-sm font-medium mb-2">
                                                            {feedback.user.name || feedback.user.email}
                                                        </div>
                                                    )}
                                                    {feedback.rating && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < feedback.rating!
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {feedback.comment && (
                                                        <p className="text-sm text-gray-700 mb-2">{feedback.comment}</p>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(feedback.createdAt)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}