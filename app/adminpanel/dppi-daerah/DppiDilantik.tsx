'use client'
import { UrlApi } from '@/app/components/apiUrl';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Dppi {
    id: number;
    tingkat: string;
    id_provinsi: number | null;
    id_kabupaten: number | null;
    nama_provinsi: string | null;
    nama_kabupaten: string | null;
}

interface Provinsi {
    id: number;
    nama_provinsi: string;
}

interface Kabupaten {
    id: number;
    nama_kabupaten: string;
    id_provinsi: number;
}

const DppiDaerah: React.FC = () => {
    const [dppi, setDppi] = useState<Dppi[]>([]);
    const [loading, setLoading] = useState(true);
    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [filteredKabupaten, setFilteredKabupaten] = useState<Kabupaten[]>([]);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDppi, setSelectedDppi] = useState<Dppi | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    // Form states
    const [formData, setFormData] = useState({
        tingkat: '',
        id_provinsi: null as number | null,
        id_kabupaten: null as number | null,
    });

    useEffect(() => {
        fetchDppi();
        fetchProvinsi();
    }, []);

    useEffect(() => {
        if (formData.id_provinsi) {
            const filtered = kabupatenList.filter(k => k.id_provinsi === formData.id_provinsi);
            setFilteredKabupaten(filtered);
        } else {
            setFilteredKabupaten([]);
        }
    }, [formData.id_provinsi, kabupatenList]);

    const fetchDppi = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${UrlApi}/adminpanel/dppi-dilantik`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setDppi(response.data);
        } catch (error) {
            console.error('Error fetching dppi:', error);
            toast.error('Gagal mengambil data DPPI');
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinsi = async () => {
        try {
            const response = await axios.get(`${UrlApi}/provinsi`, {
                withCredentials: true,
            });
            setProvinsiList(response.data);
        } catch (error) {
            console.error('Error fetching provinsi:', error);
        }
    };

    const fetchKabupaten = async (provinsiId: number) => {
        try {
            const response = await axios.get(`${UrlApi}/kabupaten/${provinsiId}`, {
                withCredentials: true,
            });
            setKabupatenList(response.data);
        } catch (error) {
            console.error('Error fetching kabupaten:', error);
        }
    };
    console.log(formData);

    const handleProvinsiChange = (provinsiId: number | null) => {
        setFormData({ ...formData, id_provinsi: provinsiId, id_kabupaten: null });
        if (provinsiId) {
            fetchKabupaten(provinsiId);
        } else {
            setKabupatenList([]);
            setFilteredKabupaten([]);
        }
    };

    const handleCreate = async () => {
        if (!formData.tingkat) {
            toast.error('Tingkat harus diisi');
            return;
        }

        try {
            await axios.post(`${UrlApi}/adminpanel/dppi-dilantik`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success('DPPI berhasil ditambahkan');
            setIsCreateModalOpen(false);
            resetForm();
            fetchDppi();
        } catch (error) {
            console.error('Error creating dppi:', error);
            toast.error('Gagal menambahkan DPPI');
        }
    };

    const handleEdit = async () => {
        if (!selectedDppi) return;
        if (!formData.tingkat) {
            toast.error('Tingkat harus diisi');
            return;
        }

        try {
            await axios.put(`${UrlApi}/adminpanel/dppi-dilantik/${selectedDppi.id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success('DPPI berhasil diupdate');
            setIsEditModalOpen(false);
            resetForm();
            fetchDppi();
        } catch (error) {
            console.error('Error updating dppi:', error);
            toast.error('Gagal mengupdate DPPI');
        }
    };

    const handleDelete = async () => {
        if (!selectedDppi) return;

        try {
            await axios.delete(`${UrlApi}/adminpanel/dppi-dilantik/${selectedDppi.id}`, {
                withCredentials: true,
            });
            toast.success('DPPI berhasil dihapus');
            setIsDeleteModalOpen(false);
            fetchDppi();
        } catch (error) {
            console.error('Error deleting dppi:', error);
            toast.error('Gagal menghapus DPPI');
        }
    };

    const openEditModal = (item: Dppi) => {
        setSelectedDppi(item);
        setFormData({
            tingkat: item.tingkat,
            id_provinsi: item.id_provinsi,
            id_kabupaten: item.id_kabupaten,
        });
        if (item.id_provinsi) {
            fetchKabupaten(item.id_provinsi);
        }
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (item: Dppi) => {
        setSelectedDppi(item);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            tingkat: '',
            id_provinsi: null,
            id_kabupaten: null,
        });
        setSelectedDppi(null);
        setKabupatenList([]);
        setFilteredKabupaten([]);
    };

    const getNamaDaerah = (item: Dppi) => {
        if (item.tingkat === 'Provinsi' && item.nama_provinsi) {
            return item.nama_provinsi;
        }
        if (item.tingkat === 'Kabupaten/Kota' && item.nama_kabupaten) {
            return item.nama_kabupaten;
        }
        return '-';
    };


    // PAGINATION LOGIC
    const totalItems = dppi.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dppi.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">DPPI DAERAH YANG SUDAH TERBENTUK</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setIsCreateModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Tambah DPPI
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className='w-full border-collapse text-sm'>
                    <thead className='bg-gray-100 dark:bg-gray-700'>
                        <tr>
                            <th className="py-3 px-4 border">#</th>
                            <th className="py-3 px-4 border">Tingkat</th>
                            <th className="py-3 px-4 border">Nama Daerah</th>
                            <th className="py-3 px-4 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    Belum ada data DPPI
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="py-3 px-4 border text-center">{indexOfFirstItem + index + 1}</td>

                                    <td className="py-3 px-4 border">{item.tingkat}</td>
                                    <td className="py-3 px-4 border">{getNamaDaerah(item)}</td>
                                    <td className="py-3 px-4 border text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="text-sm text-gray-500">
                        Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} dari {totalItems} data
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Tombol Previous */}
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            &laquo; Sebelumnya
                        </button>

                        {/* Nomor Halaman */}
                        <div className="flex space-x-1">
                            {getPageNumbers().map((page, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => typeof page === 'number' && paginate(page)}
                                    className={`px-3 py-1 rounded border ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                                    disabled={typeof page !== 'number'}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Tombol Next */}
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Selanjutnya &raquo;
                        </button>
                    </div>

                    {/* Dropdown untuk memilih jumlah item per halaman (opsional) */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Tampilkan</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                // Kalau mau bisa ganti jumlah per halaman
                                // Tapi karena itemsPerPage pakai useState, perlu ditambahkan setter
                                // Contoh sederhana, skip dulu
                            }}
                            className="border rounded px-2 py-1 text-sm"
                            disabled
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-500">data</span>
                    </div>
                </div>
            )}
            {/* Modal Create */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Tambah DPPI Daerah</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tingkat</label>
                                <select
                                    value={formData.tingkat}
                                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Pilih Tingkat</option>
                                    <option value="Provinsi">Provinsi</option>
                                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Provinsi</label>
                                <select
                                    value={formData.id_provinsi || ''}
                                    onChange={(e) => handleProvinsiChange(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinsiList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama_provinsi}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.tingkat === 'Kabupaten/Kota' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kabupaten/Kota</label>
                                    <select
                                        value={formData.id_kabupaten || ''}
                                        onChange={(e) => setFormData({ ...formData, id_kabupaten: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                        disabled={!formData.id_provinsi}
                                    >
                                        <option value="">Pilih Kabupaten/Kota</option>
                                        {filteredKabupaten.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama_kabupaten}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit DPPI Daerah</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tingkat</label>
                                <select
                                    value={formData.tingkat}
                                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Pilih Tingkat</option>
                                    <option value="Provinsi">Provinsi</option>
                                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Provinsi</label>
                                <select
                                    value={formData.id_provinsi || ''}
                                    onChange={(e) => handleProvinsiChange(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinsiList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama_provinsi}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.tingkat === 'Kabupaten/Kota' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kabupaten/Kota</label>
                                    <select
                                        value={formData.id_kabupaten || ''}
                                        onChange={(e) => setFormData({ ...formData, id_kabupaten: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                        disabled={!formData.id_provinsi}
                                    >
                                        <option value="">Pilih Kabupaten/Kota</option>
                                        {filteredKabupaten.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama_kabupaten}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Hapus DPPI Daerah</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Apakah Anda yakin ingin menghapus DPPI {selectedDppi?.tingkat} {getNamaDaerah(selectedDppi!)}?
                        </p>
                        <p className="text-red-500 text-sm mt-2">Tindakan ini tidak dapat dibatalkan!</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DppiDaerah;