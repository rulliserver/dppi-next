import React, { useEffect, useState } from 'react';
import { UrlApi } from './apiUrl';

interface AdvancedStats {
    hourly_visits: Array<{ hour: number; count: number }>;
    top_pages: Array<{ page_url: string; count: number }>;
    avg_time_on_page: number;
    bounce_rate: number;
    returning_visitors: number;
    traffic_sources: Array<{ source: string; count: number; percentage: number }>;
}

export const AdvancedStats: React.FC = () => {
    const [stats, setStats] = useState<AdvancedStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

    useEffect(() => {
        fetchAdvancedStats();
    }, [timeRange]);

    const fetchAdvancedStats = async () => {
        try {
            const response = await fetch(
                `${UrlApi}/stats/advanced?range=${timeRange}`
            );
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch advanced stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Memuat statistik pengunjung...</div>;
    }

    if (!stats) {
        return <div className="text-center py-8">Statistik pengunjung tidak ditemukan</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Analisa Statistik Pengunjung</h2>
                <div className="flex space-x-2">
                    {['24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            className={`px-4 py-2 rounded-lg ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Avg. Time on Page</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {Math.round(stats.avg_time_on_page)}s
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Persentase Pengunjung Kembali</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {stats.bounce_rate.toFixed(1)}%
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Jumlah Pengunjung Kembali</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {stats.returning_visitors}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Halaman Unik</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {stats.top_pages.length}
                    </p>
                </div>
            </div>

            {/* Hourly Traffic */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Pola traffic per jam</h3>
                <div className="flex items-end h-48 space-x-1">
                    {stats.hourly_visits.map((hour) => (
                        <div key={hour.hour} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-blue-500 rounded-t"
                                style={{ height: `${(hour.count / Math.max(...stats.hourly_visits.map(h => h.count))) * 100}%` }}
                            ></div>
                            <div className="text-xs mt-2">{hour.hour}:00</div>
                            <div className="text-xs text-gray-500">{hour.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Pages */}
        </div>
    );
};