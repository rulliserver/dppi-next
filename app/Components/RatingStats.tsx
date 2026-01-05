import React, { useEffect, useState } from 'react';
import { UrlApi } from './apiUrl';

interface RatingStatsData {
    average_rating: number;
    total_ratings: number;
    rating_distribution: Array<{
        stars: number;
        count: number;
        percentage: number;
    }>;
    recent_ratings: Array<{
        id: number;
        name: string;
        rating: number;
        suggestion: string;
        created_at: string;
    }>;
    total_suggestions: number;
}

const RatingStats: React.FC = () => {
    const [stats, setStats] = useState<RatingStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${UrlApi}/ratings/stats`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching rating stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Rating & Ulasan</h2>
                    <p className="text-gray-600">Dari {stats.total_ratings.toLocaleString()} pengunjung</p>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-red-600">
                        {stats?.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0'}
                    </div>
                    <div className="flex justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-xl ${i < Math.floor(stats.average_rating)
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                    }`}
                            >
                                <img src="/assets/images/ico-stars.svg" alt="bintang kosong" />
                            </span>
                        ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Rata-rata rating
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📊 Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        👥 Ulasan Terbaru
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                <div className="space-y-6">
                    {/* Rating Distribution */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Rating
                        </h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const ratingData = stats.rating_distribution.find(r => r.stars === stars);
                                const count = ratingData?.count || 0;
                                const percentage = ratingData?.percentage || 0;

                                return (
                                    <div key={stars} className="flex items-center">
                                        <div className="w-25 text-sm text-gray-600">
                                            <div className="flex">
                                                {[...Array(stars)].map((_, i) => (
                                                    <span key={i} className="text-yellow-500">   <img src="/assets/images/ico-stars.svg" alt="bintang kosong" className='w-5' /></span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-red-500 h-3 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="text-sm font-medium">{count}</span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Ulasan Terbaru ({stats.recent_ratings.length})
                    </h3>
                    {stats.recent_ratings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            Belum ada ulasan yang disetujui
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recent_ratings.map((review) => (
                                <div
                                    key={review.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-800">
                                                {review.name}
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`${i < review.rating
                                                                ? 'text-yellow-500'
                                                                : 'text-gray-300'
                                                                }`}
                                                        >
                                                            <img src="/assets/images/ico-stars.svg" alt="bintang kosong" />
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {review.rating}.0
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-2 line-clamp-3">
                                        {review.suggestion}
                                    </p>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RatingStats;