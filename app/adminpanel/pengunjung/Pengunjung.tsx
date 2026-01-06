'use client'
import { UrlApi } from '@/app/components/apiUrl';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';


interface Visitor {
    id: string;
    session_id: string;
    ip_address: string;
    user_agent: string;
    browser: string;
    os: string;
    device_type: string;
    referrer: string | null;
    page_url: string;
    country: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    screen_resolution: string | null;
    language: string | null;
    time_on_page: number | null;
    created_at: string;
}

interface RecentVisitorsProps {
    limit?: number;
}

export const RecentVisitors: React.FC<RecentVisitorsProps> = ({ limit = 10 }) => {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentVisitors();
    }, []);

    const fetchRecentVisitors = async () => {
        try {
            const response = await fetch(`${UrlApi}/visitors/recent`);
            const data = await response.json();
            setVisitors(data.slice(0, limit));
        } catch (error) {
            console.error('Failed to fetch recent visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Recent Visitors ({visitors.length})
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Browser / OS
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Page
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {visitors.map((visitor) => (
                            <tr key={visitor.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(visitor.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    <div className="text-xs text-gray-400">
                                        {new Date(visitor.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900">
                                        {visitor.browser}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {visitor.os} • {visitor.device_type}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                        {visitor.user_agent.substring(0, 50)}...
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                        {visitor.country || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {visitor.city || 'Unknown city'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        IP: {visitor.ip_address}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <a
                                        href={visitor.page_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                                        title={visitor.page_url}
                                    >
                                        {new URL(visitor.page_url).pathname || '/'}
                                    </a>
                                    {visitor.referrer && (
                                        <div className="text-xs text-gray-500">
                                            From: {new URL(visitor.referrer).hostname}
                                        </div>
                                    )}
                                    {visitor.time_on_page && (
                                        <div className="text-xs text-green-600">
                                            Time: {visitor.time_on_page}s
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const VisitorSessionDetails: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [visits, setVisits] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            fetchSessionVisits();
        }
    }, [sessionId]);

    const fetchSessionVisits = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/visitors/session/${sessionId}`
            );
            const data = await response.json();
            setVisits(data);
        } catch (error) {
            console.error('Failed to fetch session visits:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading session details...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Session: {sessionId}</h2>
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded">
                        <div className="text-sm text-blue-600">Total Visits</div>
                        <div className="text-2xl font-bold">{visits.length}</div>
                    </div>
                    {visits[0] && (
                        <>
                            <div className="bg-green-50 p-4 rounded">
                                <div className="text-sm text-green-600">Browser</div>
                                <div className="text-lg font-semibold">{visits[0].browser}</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded">
                                <div className="text-sm text-purple-600">OS</div>
                                <div className="text-lg font-semibold">{visits[0].os}</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded">
                                <div className="text-sm text-yellow-600">Device</div>
                                <div className="text-lg font-semibold">{visits[0].device_type}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Visit History</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">Page</th>
                            <th className="px-4 py-2 text-left">Duration</th>
                            <th className="px-4 py-2 text-left">Screen</th>
                            <th className="px-4 py-2 text-left">Language</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visits.map((visit) => (
                            <tr key={visit.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    {new Date(visit.created_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                        href={visit.page_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {new URL(visit.page_url).pathname}
                                    </a>
                                </td>
                                <td className="px-4 py-2">
                                    {visit.time_on_page ? `${visit.time_on_page}s` : 'N/A'}
                                </td>
                                <td className="px-4 py-2">{visit.screen_resolution || 'N/A'}</td>
                                <td className="px-4 py-2">{visit.language || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};