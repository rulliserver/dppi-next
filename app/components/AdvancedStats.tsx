import React, { useEffect, useState } from 'react';
import { UrlApi } from './apiUrl';

interface VisitorStats {
    total_visitors: number;
    unique_visitors: number;
    page_views: number;
    browsers: Array<{ browser: string; count: number; percentage: number }>;
    os_stats: Array<{ os: string; count: number; percentage: number }>;
    daily_visits: Array<{ date: string; visitors: number; page_views: number }>;
}

const AdvancedStats: React.FC = () => {
    const [stats, setStats] = useState<VisitorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();

        // Refresh stats setiap 30 detik
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${UrlApi}/stats`);
            if (!response.ok) throw new Error('Failed to fetch stats');

            const data: VisitorStats = await response.json();
            setStats(data);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">Error: {error}</p>
                <button
                    onClick={fetchStats}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Visitor Statistics</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Visitors</div>
                    <div className="text-3xl font-bold text-blue-700">{stats.total_visitors.toLocaleString()}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Unique Visitors</div>
                    <div className="text-3xl font-bold text-green-700">{stats.unique_visitors.toLocaleString()}</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Page Views</div>
                    <div className="text-3xl font-bold text-purple-700">{stats.page_views.toLocaleString()}</div>
                </div>
            </div>

            {/* Browser Stats */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🌐 Browser Usage</h3>
                <div className="space-y-2">
                    {stats.browsers.map((browser, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-32 text-sm text-gray-600">{browser.browser}</div>
                            <div className="flex-1">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${browser.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="w-16 text-right text-sm font-medium">
                                {browser.percentage.toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Daily Visits */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">📅 Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-gray-600">Date</th>
                                <th className="text-left py-2 text-gray-600">Visitors</th>
                                <th className="text-left py-2 text-gray-600">Page Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.daily_visits.slice(0, 7).map((day, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2">{new Date(day.date).toLocaleDateString()}</td>
                                    <td className="py-2 font-medium">{day.visitors}</td>
                                    <td className="py-2">{day.page_views}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvancedStats;