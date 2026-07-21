'use client';

import { useState, useEffect, useRef } from 'react';
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
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import Select from 'react-select';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

interface Overview {
    total_capaska: number;
    total_pamong: number;
    total_pelatih: number;
    total_dokter: number;
    total_journal_today: number;
    total_unassigned_capaska: number;
    avg_sikap: number;
    avg_penampilan: number;
}

interface DailyStat {
    tanggal: string;
    total_sikap: number;
    total_penampilan: number;
    total_journal: number;
}

interface PamongStat {
    id: string;
    nama_user: string;
    total_capaska: number;
    total_journal: number;
    avg_sikap: number;
    avg_penampilan: number;
    last_active: string | null;
}

interface CapaskaProgress {
    id: number;
    nama_lengkap: string;
    no_peserta: string;
    pamong_name: string | null;
    total_journal_pamong: number;
    total_journal_pelatih: number;
    total_journal_dokter: number;
    status: string | null;
    pamong_sikap_avg?: number;
    pamong_penampilan_avg?: number;
    pelatih_pbb_avg?: number;
    pelatih_bendera_avg?: number;
    nilai_keseluruhan?: number;
    nilai_rata_rata?: number;
}

interface RecentActivity {
    id: string;
    user_id: string;
    nama_user: string;
    role: string;
    action: string;
    module: string;
    status: string;
    created_at: string;
}

interface RoleActivityStat {
    role: string;
    total: number;
}

interface DashboardData {
    overview: Overview;
    daily_stats: DailyStat[];
    pamong_stats: PamongStat[];
    capaska_progress: CapaskaProgress[];
    recent_activities: RecentActivity[];
    role_activity_stats: RoleActivityStat[];
}

interface PerkembanganHarian {
    tanggal: string;
    pamong_sikap: number | null;
    pamong_penampilan: number | null;
    pelatih_pbb: number | null;
    pelatih_bendera: number | null;
}

export default function DashboardAdminPemusatan() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [days, setDays] = useState<number>(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Modal & Grafik Perkembangan States
    const [selectedCapaska, setSelectedCapaska] = useState<{ id: number; name: string } | null>(null);
    const [chartDataCapaska, setChartDataCapaska] = useState<PerkembanganHarian[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [exportingPertanggal, setExportingPertanggal] = useState(false);
    const [exportingRatarata, setExportingRatarata] = useState(false);

    const handleExportPerTanggal = async () => {
        try {
            setExportingPertanggal(true);
            const res = await fetch(`${UrlApi}/pemusatan/admin/export/pertanggal`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal mengunduh data ekspor');
            const records = await res.json();
            
            // Format Excel
            const header = [
                'No',
                'No. Peserta',
                'Nama Lengkap',
                'Provinsi',
                'Tanggal',
                'Rata² Sikap (Pamong)',
                'Rata² Penampilan (Pamong)',
                'Rata² PBB (Pelatih)',
                'Rata² Bendera (Pelatih)'
            ];
            
            const rows = records.map((r: any, idx: number) => [
                idx + 1,
                r.no_peserta || '-',
                r.nama_lengkap || '-',
                r.provinsi || '-',
                r.tanggal || '-',
                r.pamong_sikap !== null ? Number(r.pamong_sikap.toFixed(2)) : '-',
                r.pamong_penampilan !== null ? Number(r.pamong_penampilan.toFixed(2)) : '-',
                r.pelatih_pbb !== null ? Number(r.pelatih_pbb.toFixed(2)) : '-',
                r.pelatih_bendera !== null ? Number(r.pelatih_bendera.toFixed(2)) : '-'
            ]);
            
            const title = 'Data Nilai Capaska Per Tanggal (Pemusatan)';
            const aoa = [
                [title, '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', ''],
                header,
                ...rows
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }];
            
            for (let c = 0; c < header.length; c++) {
                const addr = XLSX.utils.encode_cell({ r: 0, c });
                const cell = ws[addr] || (ws[addr] = { t: 's', v: c === 0 ? title : '' });
                cell.s = {
                    font: { bold: true, sz: 14, color: { rgb: '1E1B4B' } },
                    alignment: { vertical: 'center', horizontal: 'center' }
                };
            }
            
            const thin = { style: 'thin', color: { rgb: 'CCCCCC' } };
            for (let c = 0; c < header.length; c++) {
                const addr = XLSX.utils.encode_cell({ r: 2, c });
                const cell = ws[addr] || (ws[addr] = { t: 's', v: header[c] });
                cell.s = {
                    font: { bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { patternType: 'solid', fgColor: { rgb: '4F46E5' } },
                    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
                    border: { top: thin, bottom: thin, left: thin, right: thin }
                };
            }
            
            for (let r = 3; r < aoa.length; r++) {
                for (let c = 0; c < header.length; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    const cell = ws[addr];
                    if (!cell) continue;
                    cell.s = {
                        alignment: {
                            vertical: 'center',
                            horizontal: c === 0 || c === 1 || c === 4 ? 'center' : 'left'
                        },
                        border: { top: thin, bottom: thin, left: thin, right: thin }
                    };
                }
            }
            
            const colWidths = header.map((h, i) => {
                let max = h.length;
                for (let r = 3; r < aoa.length; r++) {
                    const val = String(aoa[r][i] || '');
                    if (val.length > max) max = val.length;
                }
                return { wch: Math.min(50, max + 3) };
            });
            ws['!cols'] = colWidths;
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Per Tanggal');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, `nilai_capaska_pertanggal_${new Date().toISOString().split('T')[0]}.xlsx`);
            
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal mengekspor data', 'error');
        } finally {
            setExportingPertanggal(false);
        }
    };

    const handleExportRataRata = async () => {
        try {
            setExportingRatarata(true);
            const res = await fetch(`${UrlApi}/pemusatan/admin/export/ratarata`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal mengunduh data ekspor');
            const records = await res.json();
            
            const header = [
                'No',
                'No. Peserta',
                'Nama Lengkap',
                'Provinsi',
                'Rata² Sikap (Pamong)',
                'Rata² Penampilan (Pamong)',
                'Rata² PBB (Pelatih)',
                'Rata² Bendera (Pelatih)'
            ];
            
            const rows = records.map((r: any, idx: number) => [
                idx + 1,
                r.no_peserta || '-',
                r.nama_lengkap || '-',
                r.provinsi || '-',
                Number(r.pamong_sikap_avg.toFixed(2)),
                Number(r.pamong_penampilan_avg.toFixed(2)),
                Number(r.pelatih_pbb_avg.toFixed(2)),
                Number(r.pelatih_bendera_avg.toFixed(2))
            ]);
            
            const title = 'Data Nilai Rata-rata Capaska (Pemusatan)';
            const aoa = [
                [title, '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                header,
                ...rows
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }];
            
            for (let c = 0; c < header.length; c++) {
                const addr = XLSX.utils.encode_cell({ r: 0, c });
                const cell = ws[addr] || (ws[addr] = { t: 's', v: c === 0 ? title : '' });
                cell.s = {
                    font: { bold: true, sz: 14, color: { rgb: '1E1B4B' } },
                    alignment: { vertical: 'center', horizontal: 'center' }
                };
            }
            
            const thin = { style: 'thin', color: { rgb: 'CCCCCC' } };
            for (let c = 0; c < header.length; c++) {
                const addr = XLSX.utils.encode_cell({ r: 2, c });
                const cell = ws[addr] || (ws[addr] = { t: 's', v: header[c] });
                cell.s = {
                    font: { bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { patternType: 'solid', fgColor: { rgb: '059669' } },
                    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
                    border: { top: thin, bottom: thin, left: thin, right: thin }
                };
            }
            
            for (let r = 3; r < aoa.length; r++) {
                for (let c = 0; c < header.length; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    const cell = ws[addr];
                    if (!cell) continue;
                    cell.s = {
                        alignment: {
                            vertical: 'center',
                            horizontal: c === 0 || c === 1 ? 'center' : 'left'
                        },
                        border: { top: thin, bottom: thin, left: thin, right: thin }
                    };
                }
            }
            
            const colWidths = header.map((h, i) => {
                let max = h.length;
                for (let r = 3; r < aoa.length; r++) {
                    const val = String(aoa[r][i] || '');
                    if (val.length > max) max = val.length;
                }
                return { wch: Math.min(50, max + 3) };
            });
            ws['!cols'] = colWidths;
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Rata-rata');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, `rata_rata_nilai_capaska_${new Date().toISOString().split('T')[0]}.xlsx`);
            
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal mengekspor data', 'error');
        } finally {
            setExportingRatarata(false);
        }
    };

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        fetchDashboardData();
    }, [days]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/pemusatan/admin/dashboard?days=${days}`, {
                credentials: 'include'
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal memuat dashboard');
            }
            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal memuat data dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProgressionData = async (capaskaId: number) => {
        try {
            setLoadingChart(true);
            const res = await fetch(`${UrlApi}/pemusatan/admin/grafik-perkembangan/${capaskaId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat grafik perkembangan');
            const result = await res.json();
            setChartDataCapaska(result);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal memuat grafik', 'error');
        } finally {
            setLoadingChart(false);
        }
    };

    const handleSelectCapaskaChange = (newValue: any) => {
        if (newValue) {
            setSelectedCapaska({ id: newValue.value, name: newValue.label });
            fetchProgressionData(newValue.value);
        } else {
            setSelectedCapaska(null);
            setChartDataCapaska([]);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat Dashboard Admin Pemusatan...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Gagal terhubung dengan backend / data tidak valid.</p>
            </div>
        );
    }

    // Chart 1: Daily Activity Trend
    const dailyLabels = data.daily_stats.map(d => d.tanggal);
    const dailyChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Total Jurnal Terinput',
                data: data.daily_stats.map(d => d.total_journal),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Jumlah Kriteria Sikap Dinilai',
                data: data.daily_stats.map(d => d.total_sikap),
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                tension: 0.3,
                borderDash: [5, 5],
            },
            {
                label: 'Jumlah Kriteria Penampilan Dinilai',
                data: data.daily_stats.map(d => d.total_penampilan),
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                tension: 0.3,
                borderDash: [2, 2],
            }
        ]
    };

    // Chart 2: Role Activity Distribution
    const roleLabels = data.role_activity_stats.map(r => r.role);
    const roleTotals = data.role_activity_stats.map(r => r.total);
    const roleChartData = {
        labels: roleLabels,
        datasets: [
            {
                data: roleTotals,
                backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
                borderWidth: 0,
            }
        ]
    };

    // Progression Chart for single Capaska
    const progressLabels = chartDataCapaska.map(c => c.tanggal);
    const progressChartData = {
        labels: progressLabels,
        datasets: [
            {
                label: 'Pamong: Rata-Rata Sikap',
                data: chartDataCapaska.map(c => c.pamong_sikap),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.2,
                pointRadius: 4,
            },
            {
                label: 'Pamong: Rata-Rata Penampilan',
                data: chartDataCapaska.map(c => c.pamong_penampilan),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.2,
                pointRadius: 4,
            },
            {
                label: 'Pelatih: Rata-Rata PBB',
                data: chartDataCapaska.map(c => c.pelatih_pbb),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.2,
                pointRadius: 4,
            },
            {
                label: 'Pelatih: Rata-Rata Bendera',
                data: chartDataCapaska.map(c => c.pelatih_bendera),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.2,
                pointRadius: 4,
            }
        ]
    };

    // Options for chart
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: isDark ? '#ffffff' : '#374151'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: isDark ? '#1f2937' : '#e5e7eb'
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#4b5563'
                }
            },
            y: {
                grid: {
                    color: isDark ? '#1f2937' : '#e5e7eb'
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#4b5563'
                }
            }
        }
    };

    const capaskaOptions = data.capaska_progress.map(c => ({
        value: c.id,
        label: c.nama_lengkap
    }));

    const filteredCapaska = data.capaska_progress.filter(c =>
        c.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.no_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.pamong_name && c.pamong_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredCapaska.length / itemsPerPage);
    const paginatedCapaska = filteredCapaska.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pemusatan Diklat Capaska</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Dashboard Monitoring, Statistik Harian, & Analisis Perkembangan</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Periode:</label>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    >
                        <option value={7}>7 Hari Terakhir</option>
                        <option value={14}>14 Hari Terakhir</option>
                        <option value={30}>30 Hari Terakhir</option>
                        <option value={60}>60 Hari Terakhir</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Capaska</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{data.overview.total_capaska}</p>
                        {data.overview.total_unassigned_capaska > 0 && (
                            <span className="text-[10px] text-red-500 bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 rounded-full font-bold">
                                {data.overview.total_unassigned_capaska} Belum Terplot
                            </span>
                        )}
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full text-lg">👥</div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Pamong Terdaftar</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{data.overview.total_pamong}</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-full text-lg">🛡️</div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Pelatih & Dokter</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {data.overview.total_pelatih} <span className="text-xs text-gray-400">/</span> {data.overview.total_dokter}
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full text-lg">🩺</div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Jurnal Hari Ini</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.overview.total_journal_today}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 rounded-full text-lg">📝</div>
                </div>
            </div>

            {/* Averages display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-lg border border-indigo-500/20 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Indeks Sikap Capaska</h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">Rata-rata kumulatif seluruh jurnal pamong</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            {data.overview.avg_sikap.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Indeks Penampilan Capaska</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Rata-rata kerapihan & kebersihan kamar/pribadi</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {data.overview.avg_penampilan.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Activity Chart */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Tren Entri Jurnal Harian</h3>
                    <div className="h-64">
                        <Line data={dailyChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Role Activity Distribution */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Aktivitas Modul per Peran (30 hari)</h3>
                    <div className="h-48 flex items-center justify-center">
                        {roleTotals.length > 0 ? (
                            <Doughnut data={roleChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        ) : (
                            <p className="text-xs text-gray-500">Tidak ada aktivitas audit log.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Capaska Progress Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Progress Penilaian Capaska</h3>
                        <p className="text-xs text-gray-500">Daftar Capaska beserta pemenuhan kuota jurnal evaluasi harian</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExportPerTanggal}
                            disabled={exportingPertanggal}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                            {exportingPertanggal ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Exporting...
                                </>
                            ) : (
                                '📥 Export Per Tanggal'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleExportRataRata}
                            disabled={exportingRatarata}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                            {exportingRatarata ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Exporting...
                                </>
                            ) : (
                                '📥 Export Rata-rata'
                            )}
                        </button>
                        <input
                            type="text"
                            placeholder="Cari Capaska atau Pamong..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none placeholder-gray-400"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                                <th className="p-3">No. Peserta</th>
                                <th className="p-3">Nama Capaska</th>
                                <th className="p-3">Pamong</th>
                                <th className="p-3 text-center">Nilai Rata²</th>
                                <th className="p-3 text-center">Nilai Keseluruhan</th>
                                <th className="p-3 text-center">Jurnal (P/P/D)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {paginatedCapaska.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{c.no_peserta}</td>
                                    <td className="p-3 font-bold text-gray-900 dark:text-white">{c.nama_lengkap}</td>
                                    <td className="p-3">
                                        {c.pamong_name ? (
                                            <span className="text-gray-750 dark:text-gray-350">{c.pamong_name}</span>
                                        ) : (
                                            <span className="text-red-500 italic font-medium">Belum Diplot</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center font-mono">
                                        <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
                                            {c.nilai_rata_rata ? c.nilai_rata_rata.toFixed(2) : '0.00'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center font-mono">
                                        <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold">
                                            {c.nilai_keseluruhan ? c.nilai_keseluruhan.toFixed(1) : '0.0'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                                        <span className="text-violet-600 dark:text-violet-400" title="Pamong">{c.total_journal_pamong}</span> / <span className="text-blue-600 dark:text-blue-400" title="Pelatih">{c.total_journal_pelatih}</span> / <span className="text-emerald-600 dark:text-emerald-400" title="Dokter">{c.total_journal_dokter}</span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            c.status === 'Aktif' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' 
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300'
                                        }`}>
                                            {c.status || 'Aktif'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCapaska({ id: c.id, name: c.nama_lengkap });
                                                fetchProgressionData(c.id);
                                            }}
                                            className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-[10px] shadow-sm transition-colors"
                                        >
                                            📈 Lihat Grafik
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCapaska.length)} dari {filteredCapaska.length} Capaska
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
                            >
                                ◀
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                        currentPage === page
                                            ? 'bg-violet-600 text-white'
                                            : 'border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
                            >
                                ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pamong Performance & Audit Logs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Pamong Stats */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Aktivitas Evaluasi Pamong</h3>
                        <p className="text-xs text-gray-500">Memonitor kedisiplinan penginputan jurnal pamong</p>
                    </div>
                    <div className="overflow-x-auto text-xs flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                                    <th className="p-3">Nama Pamong</th>
                                    <th className="p-3 text-center">Plot Capaska</th>
                                    <th className="p-3 text-center">Jurnal Terinput</th>
                                    <th className="p-3 text-center">Rata² Sikap / Penampilan</th>
                                    <th className="p-3">Aktif Terakhir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {data.pamong_stats.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                        <td className="p-3 font-bold text-gray-900 dark:text-white">{p.nama_user}</td>
                                        <td className="p-3 text-center font-mono font-bold">{p.total_capaska} Anak</td>
                                        <td className="p-3 text-center font-mono font-bold text-violet-600 dark:text-violet-400">{p.total_journal}</td>
                                        <td className="p-3 text-center font-mono text-[11px]">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{p.avg_sikap.toFixed(1)}</span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.avg_penampilan.toFixed(1)}</span>
                                        </td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400 text-[10px]">
                                            {p.last_active ? new Date(p.last_active).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Trail */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-250 dark:border-gray-850 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Aktifitas Log Sistem</h3>
                        <p className="text-xs text-gray-500">Log operasional pemusatan real-time</p>
                    </div>
                    <div className="overflow-y-auto max-h-80 flex-1">
                        <div className="p-4 space-y-3.5">
                            {data.recent_activities.length > 0 ? (
                                data.recent_activities.map(act => (
                                    <div key={act.id} className="flex gap-3 text-xs border-b border-gray-50 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0">
                                        <div className="flex flex-col items-center">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                                                {act.role}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono">
                                                {new Date(act.created_at).toLocaleTimeString('id-ID')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">
                                                {act.nama_user}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                                                {act.action}
                                            </p>
                                            <span className={`text-[9px] font-mono px-1 rounded ${
                                                act.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {act.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-6">Belum ada aktivitas tercatat.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progression Chart Modal */}
            {selectedCapaska && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full border border-gray-250 dark:border-gray-800 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white text-base">Grafik Perkembangan Harian</h3>
                                <p className="text-xs text-gray-500">Menganalisis kemajuan penilaian harian untuk Capaska</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCapaska(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Selector to switch Capaska directly inside the modal */}
                            <div className="max-w-xs">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Ganti Capaska:</label>
                                <Select
                                    value={capaskaOptions.find(opt => opt.value === selectedCapaska.id) || null}
                                    onChange={handleSelectCapaskaChange}
                                    options={capaskaOptions}
                                    styles={{
                                        control: (provided) => ({ ...provided, backgroundColor: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#000' }),
                                        singleValue: (provided) => ({ ...provided, color: isDark ? '#fff' : '#000' }),
                                        menu: (provided) => ({ ...provided, backgroundColor: isDark ? '#1f2937' : '#fff' })
                                    }}
                                    placeholder="-- Pilih Capaska --"
                                    isSearchable
                                />
                            </div>

                            <div className="border border-gray-150 dark:border-gray-800 rounded p-4 dark:bg-gray-950">
                                <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2">
                                    Peserta: {selectedCapaska.name}
                                </h4>
                                <div className="h-96">
                                    {loadingChart ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : chartDataCapaska.length > 0 ? (
                                        <Line data={progressChartData} options={chartOptions} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-xs text-gray-500">Belum ada entri evaluasi pamong maupun pelatih untuk peserta ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedCapaska(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white text-xs font-bold rounded transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
