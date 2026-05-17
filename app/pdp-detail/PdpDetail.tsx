'use client';

import { useEffect, useState, useCallback } from 'react';
import { UrlApi } from '../components/apiUrl';
import { useSearchParams } from "next/navigation";

export default function PDPDetailPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const nama = searchParams.get('nama');

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    // Debounce search keyword
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // Reset ke halaman pertama saat keyword berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedKeyword]);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${UrlApi}/pdp-detail?id=${id}&page=${currentPage}&limit=${itemsPerPage}`;
            if (debouncedKeyword.trim()) {
                url += `&q=${encodeURIComponent(debouncedKeyword.trim())}`;
            }

            const response = await fetch(url);
            const result = await response.json();
            setData(result.data);
            setTotalPages(result.total_pages);
            setTotalData(result.total);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [id, currentPage, itemsPerPage, debouncedKeyword]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [fetchData, id]);

    // Handle change items per page
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Handle search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchKeyword('');
        setDebouncedKeyword('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b-4 border-red-800 p-6">
                    <h1 className="text-2xl font-bold text-red-800">
                        Detail PDP - {nama ? decodeURIComponent(nama) : 'Provinsi'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total Data: {totalData} PDP
                    </p>
                </div>
                <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Filter & Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Cari PDP..."
                            value={searchKeyword}
                            onChange={handleSearchChange}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {searchKeyword && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Tampilkan:</label>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">data</span>
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg">Tidak ada data ditemukan</p>
                            {searchKeyword && (
                                <button
                                    onClick={clearSearch}
                                    className="mt-2 text-red-600 hover:text-red-700"
                                >
                                    Hapus pencarian &quot;{searchKeyword}&quot;
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-red-800 text-white sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left">No</th>
                                        <th className="px-4 py-3 text-left">Nama Lengkap</th>
                                        <th className="px-4 py-3 text-left">Tingkat Penugasan</th>
                                        <th className="px-4 py-3 text-left">Kabupaten/Kota Penugasan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item: any, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.nama}</td>
                                            <td className="px-4 py-3">{item.tingkat}</td>
                                            <td className="px-4 py-3">{item.kabupaten_kota}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
