'use client'

import { UrlApi } from '@/app/components/apiUrl';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    DocumentIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface PendaftaranDppi {
    id: number;
    id_kabupaten: number;
    nama_provinsi: string;
    nama_pic: string;
    jabatan_pic: string;
    nip_pic: string;
    no_telp_pic: string;
    email_pic: string;
    status: string;
    created_at: string;
    path_surat_sekda: string | null;
    path_daftar_riwayat_hidup: string | null;
    path_portofolio: string | null;
    path_kartu_keluarga: string | null;
}

interface DashboardStats {
    total: number;
    pending: number;
    review: number;
    approved: number;
    rejected: number;
    completed: number;
    total_kabupaten: number;
}

export default function ListKabKota() {
    const [pendaftaranList, setPendaftaranList] = useState<PendaftaranDppi[]>([]);
    const [filteredList, setFilteredList] = useState<PendaftaranDppi[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        pending: 0,
        review: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        total_kabupaten: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPendaftaran, setSelectedPendaftaran] = useState<PendaftaranDppi | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch data
    const fetchPendaftaran = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${UrlApi}/pendaftaran-dppi-provinsi`, {
                withCredentials: true,
                params: {
                    page: currentPage,
                    per_page: itemsPerPage,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    search: searchTerm || undefined
                }
            });

            if (response.data) {
                setPendaftaranList(response.data.data || []);
                setFilteredList(response.data.data || []);
                setTotalPages(response.data.total_pages || 1);

                // Calculate stats from data
                calculateStats(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal memuat data pendaftaran',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${UrlApi}/pendaftaran-dppi-provinsi/stats`, { withCredentials: true });
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const calculateStats = (data: PendaftaranDppi[]) => {
        const stats: DashboardStats = {
            total: data.length,
            pending: data.filter(item => item.status === 'pending').length,
            review: data.filter(item => item.status === 'review').length,
            approved: data.filter(item => item.status === 'approved').length,
            rejected: data.filter(item => item.status === 'rejected').length,
            completed: data.filter(item => item.status === 'completed').length,
            total_kabupaten: new Set(data.map(item => item.id_kabupaten)).size
        };
        setStats(stats);
    };

    useEffect(() => {
        fetchPendaftaran();
        fetchStats();
    }, [currentPage, statusFilter, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleViewDetail = (pendaftaran: PendaftaranDppi) => {
        setSelectedPendaftaran(pendaftaran);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        const result = await Swal.fire({
            title: 'Update Status',
            text: `Yakin ingin mengubah status menjadi "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Update',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`${UrlApi}/pendaftaran-dppi-provinsi/${id}/status`, {
                    status: newStatus
                }, { withCredentials: true });

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Status berhasil diupdate',
                });

                fetchPendaftaran();
                fetchStats();
            } catch (error) {
                console.error('Error updating status:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal mengupdate status',
                });
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Hapus Data',
            text: 'Yakin ingin menghapus data ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${UrlApi}/pendaftaran-dppi-provinsi/${id}`, { withCredentials: true });

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data berhasil dihapus',
                });

                fetchPendaftaran();
                fetchStats();
            } catch (error) {
                console.error('Error deleting data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Tidak dapat menghapus data yang sudah berubah status',
                });
            }
        }
    };

    const handleDownloadDocument = async (id: number, documentType: string, filename: string) => {
        try {
            const response = await axios.get(
                `${UrlApi}/pendaftaran-dppi-provinsi/${id}/download/${documentType}`,
                {
                    withCredentials: true,
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Dokumen berhasil didownload',
            });
        } catch (error) {
            console.error('Error downloading document:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mendownload dokumen',
            });
        }
    };


    const handleDownloadExcel = async (simple: boolean = false) => {
        try {
            const response = await axios.get(`${UrlApi}/pendaftaran-dppi-provinsi/download`, {
                withCredentials: true,
                responseType: 'blob',
                params: {
                    simple: simple
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const dateStr = new Date().toISOString().split('T')[0];
            const filename = simple
                ? `pendaftaran-dppi-simple-${dateStr}.xlsx`
                : `pendaftaran-dppi-lengkap-${dateStr}.xlsx`;

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Data berhasil diunduh`,
            });
        } catch (error) {
            console.error('Error Downloading data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengunduh data',
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800',
                icon: <ClockIcon className="w-4 h-4 mr-1" />,
                label: 'Pending'
            },
            review: {
                color: 'bg-blue-100 text-blue-800',
                icon: <EyeIcon className="w-4 h-4 mr-1" />,
                label: 'Review'
            },
            approved: {
                color: 'bg-green-100 text-green-800',
                icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
                label: 'Disetujui'
            },
            rejected: {
                color: 'bg-red-100 text-red-800',
                icon: <XCircleIcon className="w-4 h-4 mr-1" />,
                label: 'Ditolak'
            },
            completed: {
                color: 'bg-purple-100 text-purple-800',
                icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
                label: 'Selesai'
            }
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            icon: <ClockIcon className="w-4 h-4 mr-1" />,
            label: status
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pendaftaran Pengangkatan DPPI Tingkat Provinsi</h1>
                    <p className="text-gray-600 mt-2">Kelola data pendaftaran pengangkatan pertama kali Duta Pancasila Paskibraka Indonesia Tingkat Provinsi</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pendaftaran</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <DocumentIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <ClockIcon className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Provinsi</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.total_kabupaten}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <DocumentIcon className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Semua ({stats.total})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('pending')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('review')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'review' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Review ({stats.review})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('approved')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Disetujui ({stats.approved})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Ditolak ({stats.rejected})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('completed')}
                            className={`px-4 py-2 rounded-lg ${statusFilter === 'completed' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            Selesai ({stats.completed})
                        </button>
                    </div>
                </div>

                {/* Search and Download */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1">

                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama kabupaten, PIC, atau NIP..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-20 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownloadExcel(false)}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                title="Download lengkap dengan semua kolom"
                            >
                                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                                Download xlsx
                            </button>

                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Provinsi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                PIC
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal Pendaftaran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredList.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    Tidak ada data pendaftaran
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredList.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {index + 1 + (currentPage - 1) * itemsPerPage}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.nama_provinsi}</div>
                                                            <div className="text-sm text-gray-500">{item.nama_provinsi}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.nama_pic}</div>
                                                            <div className="text-sm text-gray-500">{item.jabatan_pic}</div>
                                                            <div className="text-sm text-gray-500">{item.nip_pic}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(item.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleViewDetail(item)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Lihat Detail"
                                                            >
                                                                <EyeIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'review')}
                                                                className="text-yellow-600 hover:text-yellow-900"
                                                                title="Set Review"
                                                            >
                                                                <EyeIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Setujui"
                                                            >
                                                                <CheckCircleIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Tolak"
                                                            >
                                                                <XCircleIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Hapus"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                                                    <span className="font-medium">
                                                        {Math.min(currentPage * itemsPerPage, stats.total)}
                                                    </span>{' '}
                                                    dari <span className="font-medium">{stats.total}</span> data
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i;
                                                        } else {
                                                            pageNum = currentPage - 2 + i;
                                                        }

                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                    ? 'z-10 bg-blue-50 border-blue-400 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedPendaftaran && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Detail Pendaftaran #{selectedPendaftaran.id}
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Informasi Kabupaten */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Provinsi</h4>
                                    <p className="text-lg font-semibold text-gray-900">{selectedPendaftaran.nama_provinsi}</p>
                                    <p className="text-gray-600">{selectedPendaftaran.nama_provinsi}</p>
                                </div>

                                {/* Status */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                                    {getStatusBadge(selectedPendaftaran.status)}
                                </div>

                                {/* Informasi PIC */}
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Data PIC</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Nama PIC</p>
                                            <p className="font-medium">{selectedPendaftaran.nama_pic}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Jabatan</p>
                                            <p className="font-medium">{selectedPendaftaran.jabatan_pic}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">NIP</p>
                                            <p className="font-medium">{selectedPendaftaran.nip_pic}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">No. Telepon</p>
                                            <p className="font-medium">{selectedPendaftaran.no_telp_pic}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{selectedPendaftaran.email_pic}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dokumen */}
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Dokumen</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { type: 'surat_sekda', label: 'Surat Sekretaris Daerah', path: selectedPendaftaran.path_surat_sekda },
                                            { type: 'daftar_riwayat_hidup', label: 'Daftar Riwayat Hidup', path: selectedPendaftaran.path_daftar_riwayat_hidup },
                                            { type: 'portofolio', label: 'Portofolio', path: selectedPendaftaran.path_portofolio },
                                            { type: 'kartu_keluarga', label: 'Kartu Keluarga', path: selectedPendaftaran.path_kartu_keluarga },
                                        ].map((doc) => (
                                            <div key={doc.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.label}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {doc.path ? 'Sudah diupload' : 'Belum diupload'}
                                                    </p>
                                                </div>
                                                {doc.path && (
                                                    <button
                                                        onClick={() => handleDownloadDocument(
                                                            selectedPendaftaran.id,
                                                            doc.type,
                                                            `${doc.type}_${selectedPendaftaran.nama_provinsi}.pdf`
                                                        )}
                                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                    >
                                                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                                        Download
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Informasi Pendaftaran</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Tanggal Pendaftaran</p>
                                            <p className="font-medium">{formatDate(selectedPendaftaran.created_at)}</p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleUpdateStatus(selectedPendaftaran.id, 'review')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                >
                                    Set Review
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPendaftaran.id, 'approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Setujui
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPendaftaran.id, 'rejected')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Tolak
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}