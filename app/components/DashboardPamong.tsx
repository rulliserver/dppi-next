// app/pamong/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Swal from 'sweetalert2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DailyStats {
    tanggal: string;
    jumlah_sikap: number;
    jumlah_penampilan: number;
    total_penilaian: number;
    rata_rata_sikap: number;
    rata_rata_penampilan: number;
}

interface CandidateStats {
    id: number;
    nama_lengkap: string;
    jk: string;
    total_sikap: number;
    total_penampilan: number;
    total_penilaian: number;
    rata_rata_sikap: number;
    rata_rata_penampilan: number;
    nilai_keseluruhan?: number;
    nilai_rata_rata?: number;
}

interface DashboardData {
    daily_stats: DailyStats[];
    candidate_stats: CandidateStats[];
    total_candidates: number;
    total_entries: number;
}

export default function PamongDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('30');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/pemusatan/pamong/dashboard`, {
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Gagal memuat data dashboard');
            }

            const data = await res.json();
            setDashboardData(data);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat data dashboard...</p>
            </div>
        );
    }

    if (!dashboardData || dashboardData.daily_stats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="text-6xl">📊</div>
                <p className="text-gray-500 text-lg">Belum ada data penilaian</p>
                <p className="text-gray-400 text-sm">Mulai lakukan penilaian harian untuk melihat grafik perkembangan</p>
            </div>
        );
    }

    // Filter data berdasarkan time range
    const filteredDailyStats = dashboardData.daily_stats.slice(0, parseInt(timeRange));

    // Chart data untuk Line Chart
    const chartData = {
        labels: filteredDailyStats.map(item => {
            const date = new Date(item.tanggal);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }).reverse(),
        datasets: [
            {
                label: 'Jumlah SIKAP',
                data: filteredDailyStats.map(item => item.jumlah_sikap).reverse(),
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: false,
                tension: 0.3,
                pointBackgroundColor: 'rgb(139, 92, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Jumlah PENAMPILAN',
                data: filteredDailyStats.map(item => item.jumlah_penampilan).reverse(),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: false,
                tension: 0.3,
                pointBackgroundColor: 'rgb(16, 185, 129)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Penilaian KESELURUHAN (Sikap & Penampilan)',
                data: filteredDailyStats.map(item => item.jumlah_sikap + item.jumlah_penampilan).reverse(),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        let value = context.parsed.y;
                        if (value !== null && value !== undefined) {
                            return `${label}: ${Number(value).toFixed(2)}`;
                        }
                        return `${label}: -`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: 11 },
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 11 },
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    // Statistik ringkasan
    const totalSikap = dashboardData.daily_stats.reduce((sum, item) => sum + item.jumlah_sikap, 0);
    const totalPenampilan = dashboardData.daily_stats.reduce((sum, item) => sum + item.jumlah_penampilan, 0);
    const avgSikapPerDay = dashboardData.daily_stats.length > 0
        ? (totalSikap / dashboardData.daily_stats.length)
        : 0;
    const avgPenampilanPerDay = dashboardData.daily_stats.length > 0
        ? (totalPenampilan / dashboardData.daily_stats.length)
        : 0;

    return (
        <div className="mx-auto mb-20 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        📊 Dashboard Pamong
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Perkembangan penilaian harian Sikap dan Penampilan peserta
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Rentang Waktu:</label>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '7' | '14' | '30')}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    >
                        <option value="7">7 Hari Terakhir</option>
                        <option value="14">14 Hari Terakhir</option>
                        <option value="30">30 Hari Terakhir</option>
                    </select>
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                        title="Refresh data"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Penilaian</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.total_entries}
                    </p>
                    <p className="text-xs text-gray-400">{dashboardData.total_candidates} peserta</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total SIKAP</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {totalSikap}
                    </p>
                    <p className="text-xs text-gray-400">Rata-rata {avgSikapPerDay.toFixed(1)}/hari</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total PENAMPILAN</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {totalPenampilan}
                    </p>
                    <p className="text-xs text-gray-400">Rata-rata {avgPenampilanPerDay.toFixed(1)}/hari</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-indigo-200 dark:border-indigo-900/50 shadow-sm bg-linear-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Nilai Keseluruhan</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {dashboardData.candidate_stats.length > 0
                            ? (dashboardData.candidate_stats.reduce((acc, c) => acc + (c.nilai_keseluruhan || (c.rata_rata_sikap + c.rata_rata_penampilan)), 0) / dashboardData.candidate_stats.length).toFixed(1)
                            : '0'}
                    </p>
                    <p className="text-xs text-gray-400">Rata-rata peserta</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hari Aktif</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.daily_stats.length}
                    </p>
                    <p className="text-xs text-gray-400">dari {timeRange} hari</p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Grafik Perkembangan Penilaian Harian
                    </h2>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                            KESELURUHAN
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                            SIKAP
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            PENAMPILAN
                        </span>
                    </div>
                </div>
                <div className="h-75 md:h-87.5">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Stats per Candidate */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    📋 Statistik per Peserta
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Nama Peserta</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">JK</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Total Jurnal</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-violet-600 dark:text-violet-400">SIKAP</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">PENAMPILAN</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Rata-rata SIKAP</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Rata-rata PENAMPILAN</th>
                                <th className="text-center py-3 px-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">Nilai Keseluruhan</th>
                                <th className="text-center py-3 px-2 text-xs text-purple-600 dark:text-purple-400 font-bold">Rata-Rata Keseluruhan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...dashboardData.candidate_stats]
                                .sort((a, b) => (b.nilai_keseluruhan ?? (b.rata_rata_sikap + b.rata_rata_penampilan)) - (a.nilai_keseluruhan ?? (a.rata_rata_sikap + a.rata_rata_penampilan)))
                                .map((candidate, index) => (
                                <tr
                                    key={candidate.id}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="py-2 px-2 text-gray-500 font-bold">{index + 1}</td>
                                    <td className="py-2 px-2 font-medium text-gray-800 dark:text-gray-200">
                                        {candidate.nama_lengkap}
                                    </td>
                                    <td className="py-2 px-2 text-gray-500">
                                        {candidate.jk.toUpperCase()}
                                    </td>
                                    <td className="py-2 px-2 text-center font-bold text-gray-800 dark:text-gray-200">
                                        {candidate.total_penilaian}
                                    </td>
                                    <td className="py-2 px-2 text-center text-violet-600 dark:text-violet-400 font-semibold">
                                        {candidate.total_sikap}
                                    </td>
                                    <td className="py-2 px-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                                        {candidate.total_penampilan}
                                    </td>
                                    <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-400 font-mono">
                                        {candidate.rata_rata_sikap.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-400 font-mono">
                                        {candidate.rata_rata_penampilan.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-2 text-center font-mono">
                                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                                            {candidate.nilai_keseluruhan ? candidate.nilai_keseluruhan.toFixed(2) : (candidate.rata_rata_sikap + candidate.rata_rata_penampilan).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="py-2 px-2 text-center font-mono">
                                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold text-xs">
                                            {candidate.nilai_rata_rata ? candidate.nilai_rata_rata.toFixed(2) : ((candidate.rata_rata_sikap + candidate.rata_rata_penampilan) / 2).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}