import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface VisitorData {
    session_id: string;
    page_url: string;
    referrer?: string;
    screen_resolution?: string;
    language?: string;
    time_on_page?: number;
}

interface VisitorStats {
    total_visitors: number;
    unique_visitors: number;
    page_views: number;
    browsers: Array<{ browser: string; count: number; percentage: number }>;
    os_stats: Array<{ os: string; count: number; percentage: number }>;
    countries: Array<{ country: string; count: number; percentage: number }>;
    daily_visits: Array<{ date: string; visitors: number; page_views: number }>;
}

const VisitorTracker: React.FC = () => {
    const [sessionId] = useState<string>(() => {
        // Try to get existing session ID from localStorage
        const savedSessionId = localStorage.getItem('visitor_session_id');
        if (savedSessionId) {
            return savedSessionId;
        }
        // Generate new session ID
        const newSessionId = uuidv4();
        localStorage.setItem('visitor_session_id', newSessionId);
        return newSessionId;
    });

    const startTimeRef = useRef<number>(Date.now());
    const hasTrackedRef = useRef<boolean>(false);
    const [stats, setStats] = useState<VisitorStats | null>(null);

    useEffect(() => {
        const trackVisit = async () => {
            if (hasTrackedRef.current) return;

            const visitorData: VisitorData = {
                session_id: sessionId,
                page_url: window.location.href,
                referrer: document.referrer || undefined,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
            };

            try {
                const response = await fetch('http://localhost:8080/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(visitorData),
                });

                if (response.ok) {
                    console.log('Visitor tracked successfully');
                    hasTrackedRef.current = true;
                }
            } catch (error) {
                console.error('Failed to track visitor:', error);
            }
        };

        trackVisit();

        // Track time on page before unload
        const handleBeforeUnload = () => {
            const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Send time on page update (you might want to implement a separate endpoint for this)
            navigator.sendBeacon(
                'http://localhost:8080/api/track',
                JSON.stringify({
                    session_id: sessionId,
                    page_url: window.location.href,
                    time_on_page: timeOnPage,
                })
            );
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sessionId]);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/stats');
            const data: VisitorStats = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className="visitor-tracker">
            <button
                onClick={fetchStats}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Load Visitor Statistics
            </button>

            {stats && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Total Visitors</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.total_visitors}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Unique Visitors</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.unique_visitors}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Page Views</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.page_views}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Session ID</h3>
                        <p className="text-sm text-gray-600 truncate" title={sessionId}>
                            {sessionId.substring(0, 8)}...
                        </p>
                    </div>

                    {/* Browser Stats */}
                    <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Browser Usage</h3>
                        <div className="space-y-2">
                            {stats.browsers.map((browser, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-600">{browser.browser}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${browser.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500">{browser.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OS Stats */}
                    <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Operating Systems</h3>
                        <div className="space-y-2">
                            {stats.os_stats.map((os, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-600">{os.os}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${os.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500">{os.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Visits */}
                    <div className="md:col-span-2 lg:col-span-4 bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Daily Visits (Last 30 days)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unique Visitors
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Page Views
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.daily_visits.map((day, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(day.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {day.visitors}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {day.page_views}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorTracker;