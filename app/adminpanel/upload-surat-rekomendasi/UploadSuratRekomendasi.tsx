//app/components/UploadSuratRekomendasi.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UrlApi } from "@/app/components/apiUrl";

interface SuratRekomendasi {
    id: number;
    nomor_surat: string;
    keterangan: string;
    file_surat: string;
    file_path: string;
    created_at: string;
}

export default function UploadSuratRekomendasi() {
    const [nomorSurat, setNomorSurat] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [suratList, setSuratList] = useState<SuratRekomendasi[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [notification, setNotification] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'info';
        message: string;
    }>({ show: false, type: 'success', message: '' });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        fetchSuratList();
    }, []);

    const fetchSuratList = async () => {
        try {
            const response = await axios.post(
                `${UrlApi}/surat-rekomendasi/list`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === "success") {
                setSuratList(response.data.data);
            }
        } catch (error) {
            showNotification('error', 'Gagal mengambil data surat');
            console.error("Error fetching surat list:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                showNotification('error', 'Hanya file PDF yang diperbolehkan');
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                showNotification('error', 'Ukuran file maksimal 5MB');
                return;
            }

            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nomorSurat || !file) {
            showNotification('error', 'Semua field harus diisi');
            return;
        }

        setLoading(true);

        try {
            const base64File = await convertToBase64(file);

            const response = await axios.post(
                `${UrlApi}/upload-surat-rekomendasi`,

                {
                    nomor_surat: nomorSurat,
                    keterangan: keterangan,
                    file_surat: base64File,
                    filename: file.name
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === "success") {
                showNotification('success', 'Surat rekomendasi berhasil diupload');
                // Reset form
                setNomorSurat("");
                setKeterangan("");
                setFile(null);
                setFileName("");
                // Refresh list
                fetchSuratList();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal mengupload surat';
            showNotification('error', errorMessage);
            console.error("Error uploading surat:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus surat ini?')) return;

        try {
            const response = await axios.post(
                `${UrlApi}/surat-rekomendasi/delete/${id}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === "success") {
                showNotification('success', 'Surat berhasil dihapus');
                fetchSuratList();
            }
        } catch (error) {
            showNotification('error', 'Gagal menghapus surat');
            console.error("Error deleting surat:", error);
        }
    };

    const handleDownload = async (id: number, nomorSurat: string) => {
        try {
            const response = await axios.post(
                `${UrlApi}/surat-rekomendasi/download/${id}`,
                {},

                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Surat_Rekomendasi_${nomorSurat}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification('success', 'Download berhasil');
        } catch (error) {
            showNotification('error', 'Gagal mendownload surat');
            console.error("Error downloading surat:", error);
        }
    };

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: 'success', message: '' });
        }, 3000);
    };

    // Filter surat based on search
    const filteredSurat = suratList.filter(surat =>
        surat.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surat.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSurat.length / itemsPerPage);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    } text-white`}>
                    {notification.message}
                </div>
            )}


            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Upload Surat Rekomendasi</h1>
                <p className="text-gray-600">Upload dan kelola surat rekomendasi</p>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nomor Surat
                            </label>
                            <input
                                type="text"
                                value={nomorSurat}
                                onChange={(e) => setNomorSurat(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan nomor surat"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                File PDF (Max 5MB)
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-center">
                                        {fileName || "Pilih file PDF"}
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keterangan
                            </label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan keterangan surat"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </span>
                            ) : 'Upload Surat'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Surat */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Daftar Surat Rekomendasi</h2>
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Cari nomor surat atau keterangan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nomor Surat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Keterangan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal Upload
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((surat, index) => (
                                    <tr key={surat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {surat.nomor_surat}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {surat.keterangan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {surat.file_surat}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(surat.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                               
                                                <button
                                                    onClick={() => handleDownload(surat.id, surat.nomor_surat)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Download"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(surat.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        {searchTerm ? 'Tidak ada surat yang sesuai' : 'Belum ada surat rekomendasi'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredSurat.length > 0 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-700">
                            Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, filteredSurat.length)}
                            </span>{' '}
                            dari <span className="font-medium">{filteredSurat.length}</span> data
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-lg ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>
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
                                        className={`px-4 py-2 border rounded-lg ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded-lg ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}