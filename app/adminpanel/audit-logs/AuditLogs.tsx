'use client';

import { useState, useEffect, useCallback } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Pagination from '@/app/components/UserPagination';
import FormatDateTime from '@/app/components/FormatDateTime';

interface AuditLog {
    id: string;
    user_id: string | null;
    username: string | null;
    role: string | null;
    action: string;
    module: string;
    ip_address: string | null;
    user_agent: string | null;
    status: string;
    details: string | null;
    created_at: string;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setModuleFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // Fetch logs from API
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (statusFilter) params.append('status', statusFilter);
            if (moduleFilter) params.append('module', moduleFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await fetch(`${UrlApi}/adminpanel/audit-logs?${params.toString()}`, {
                credentials: 'include',
            });

            if (res.status === 401 || res.status === 403) {
                setError('Anda tidak memiliki akses ke halaman log aktivitas');
                return;
            }

            if (!res.ok) {
                throw new Error('Gagal mengambil data log');
            }

            const result: PaginatedResponse<AuditLog> = await res.json();
            setLogs(result.data || []);
            setTotal(result.total);
            setTotalPages(result.total_pages);
            setCurrentPage(result.page);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat memuat log');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, debouncedSearch, statusFilter, moduleFilter, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getStatusBadge = (status: string) => {
        if (status === 'SUCCESS') {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    SUCCESS
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                FAILED
            </span>
        );
    };

    const getModuleBadge = (module: string) => {
        const cleanModule = module.replace('_', ' ').toUpperCase();
        return (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {cleanModule}
            </span>
        );
    };

    const formatDetails = (details: string | null) => {
        if (!details) return '-';
        try {
            // Check if details is a JSON string
            if (details.startsWith('{') || details.startsWith('[')) {
                const parsed = JSON.parse(details);
                return JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            // ignore error
        }
        return details;
    };

    return (
        <div className="mb-20">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Aktivitas Sistem</h1>
                    <p className="text-gray-650 dark:text-gray-300">Pantau audit trail dan log tindakan admin/user secara real-time</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="self-start md:self-auto px-4 py-2 bg-primary hover:bg-opacity-90 text-white rounded transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                    Refresh
                </button>
            </div>

            {error ? (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {/* Filter Section */}
            <div className="mb-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-750 dark:text-gray-300 mb-4 flex items-center gap-2">
                    Filter & Pencarian
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pencarian</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Username, Aksi, Detail..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Module Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Modul</label>
                        <select
                            value={moduleFilter}
                            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Modul</option>
                            <option value="AUTH">Auth / Keamanan</option>
                            <option value="USER">Manajemen User / Profile</option>
                            <option value="PENDAFTARAN">Pendaftaran DPPI</option>
                            <option value="RATING">Rating / Testimoni</option>
                            <option value="PASKIBRAKA">Paskibraka</option>
                            <option value="BERITA">Post / Berita</option>
                            <option value="GALLERY">Galeri</option>
                            <option value="KEGIATAN">Kegiatan</option>
                            <option value="REGULASI">Regulasi</option>
                            <option value="MAJELIS_PERTIMBANGAN">Majelis Pertimbangan</option>
                            <option value="PELAKSANA">Pelaksana Daerah</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="FAILED">FAILED</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleClearFilters}
                            className="w-full py-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-300 rounded font-semibold text-xs transition-colors border border-gray-300 dark:border-gray-700"
                        >
                            Bersihkan Filter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tanggal Selesai</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Pengguna</th>
                                <th className="px-6 py-4">Modul</th>
                                <th className="px-6 py-4">Aksi</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span>Memuat log...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data log aktivitas yang cocok dengan kriteria filter.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300 font-medium">
                                            {FormatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {log.username || 'GUEST'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-500">
                                                    {log.role || 'Anonim'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getModuleBadge(log.module)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[11px] text-gray-800 dark:text-gray-200">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-400 font-mono text-[11px]">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(log.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 text-blue-750 dark:text-blue-300 rounded font-semibold transition-colors"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && logs.length > 0 && (
                    <div className="px-6 border-t border-gray-200 dark:border-gray-800">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            limit={limit}
                            total={total}
                            onPageChange={(page) => setCurrentPage(page)}
                            onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
                        />
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Detail Log Aktivitas
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">ID: {selectedLog.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full flex items-center justify-center transition-colors hover:bg-gray-200/50 dark:hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-xs">
                            {/* Grid Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Timestamp</span>
                                        <span className="text-gray-900 dark:text-white">{FormatDateTime(selectedLog.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Username</span>
                                        <span className="text-gray-900 dark:text-white font-bold">{selectedLog.username || 'GUEST'}</span>
                                    </div>
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Role</span>
                                        <span className="text-gray-900 dark:text-white">{selectedLog.role || 'Anonim'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Modul</span>
                                        <span>{getModuleBadge(selectedLog.module)}</span>
                                    </div>
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Aksi</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedLog.action}</span>
                                    </div>
                                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-900">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">Status</span>
                                        <span>{getStatusBadge(selectedLog.status)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Network Info */}
                            <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-lg space-y-3 border border-slate-100 dark:border-gray-850">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-[10px] uppercase tracking-wider flex items-center gap-2 mb-2">
                                    Informasi Jaringan & Browser
                                </h4>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between pb-1 border-b border-slate-200/50 dark:border-slate-800">
                                        <span className="text-gray-500 dark:text-gray-400">IP Address</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{selectedLog.ip_address || '-'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 dark:text-gray-400">User Agent</span>
                                        <span className="text-[10px] text-gray-650 dark:text-gray-300 font-mono break-all bg-white dark:bg-gray-950 p-2 rounded border border-gray-100 dark:border-gray-900">
                                            {selectedLog.user_agent || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Payload */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    Metadata / Payload Detail
                                </label>
                                <pre className="bg-gray-900 text-gray-150 p-4 rounded-lg text-[10px] overflow-auto font-mono max-h-60 border border-gray-850 select-all whitespace-pre-wrap">
                                    {formatDetails(selectedLog.details)}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-850 dark:text-white rounded font-bold text-xs transition-colors"
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
