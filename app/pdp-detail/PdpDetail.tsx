'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import axios from 'axios';

export default function PDPDetailPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [namaProvinsi, setNamaProvinsi] = useState('');

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    const [kabupaten, setKabupaten] = useState<any[]>([]);
    const [provinsi, setProvinsi] = useState<any[]>([]);

    const selectedProvinsi = id;
    const filteredKabupaten = useMemo(() => {
        if (!selectedProvinsi) return [];
        return kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsi));
    }, [kabupaten, selectedProvinsi]);

    const [selectedKabupaten, setSelectedKabupaten] = useState('');

    // Debounce search keyword
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // Reset ke halaman pertama saat keyword atau kabupaten berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedKeyword, selectedKabupaten]);

    // Reset selectedKabupaten saat ganti provinsi
    useEffect(() => {
        setSelectedKabupaten('');
    }, [id]);

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {

            let url = `${UrlApi}/pdp-detail?id=${id}&page=${currentPage}&limit=${itemsPerPage}`;

            if (selectedKabupaten) {
                url += `&kab=${selectedKabupaten}`;
            }

            if (debouncedKeyword.trim()) {
                url += `&q=${encodeURIComponent(debouncedKeyword.trim())}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            setData(result.data || []);
            setTotalPages(result.total_pages || 0);
            setTotalData(result.total || 0);


            if (result.data && result.data.length > 0 && result.data[0].nama_provinsi) {
                setNamaProvinsi(result.data[0].nama_provinsi);
            } else {
                // Cari dari list provinsi
                const prov = provinsi.find(p => p.id === Number(id));
                if (prov) setNamaProvinsi(prov.nama_provinsi);
            }
        } catch (error) {
            console.error('Error:', error);
            setData([]);
            setTotalPages(0);
            setTotalData(0);
        } finally {
            setLoading(false);
        }
    }, [id, currentPage, itemsPerPage, debouncedKeyword, selectedKabupaten, provinsi]);

    const getProvinsi = useCallback(() => {
        axios
            .get(`${UrlApi}/provinsi`)
            .then((response: any) => {
                setProvinsi(response.data);
                // Set nama provinsi dari data yang didapat
                const prov = response.data.find((p: any) => p.id === Number(id));
                if (prov) setNamaProvinsi(prov.nama_provinsi);
            })
            .catch((error) => {
                console.error('Error fetching provinsi:', error);
            });
    }, [id]);

    const getKabupaten = useCallback(() => {
        axios
            .get(`${UrlApi}/kabupaten`)
            .then((response: any) => {
                setKabupaten(response.data);
            })
            .catch((error) => {
                console.error('Error fetching kabupaten:', error);
            });
    }, []);


    useEffect(() => {
        if (id) {
            getProvinsi();
            getKabupaten();
        }
    }, [id, getProvinsi, getKabupaten]);


    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const generatePagination = useCallback(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    }, [currentPage, totalPages]);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
    };

    const clearSearch = () => {
        setSearchKeyword('');
        setDebouncedKeyword('');
    };

    const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            window.location.href = `/pdp-detail?id=${value}`;
        }
    };

    const handleKabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedKabupaten(value);

    };


    const getTingkatPenugasan = (item: any) => {
        if (item.tingkat_penugasan) return item.tingkat_penugasan;
        if (item.nama_kabupaten) return "Paskibraka Tingkat Kabupaten/Kota";
        return "Paskibraka Tingkat Provinsi";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b-4 border-red-800 p-6">
                    <h1 className="text-2xl font-bold text-red-800">
                        PDP Provinsi {namaProvinsi ? namaProvinsi : ''} {selectedKabupaten ? " - " + kabupaten.find(k => k.id === Number(selectedKabupaten))?.nama_kabupaten : ''}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total Data: {totalData} PDP
                    </p>
                </div>

                <div className="bg-white p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Suspense fallback={<div>Loading...</div>}>
                            {/* Search Input */}
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

                            {/* Provinsi Select */}
                            <div className='w-full sm:w-auto'>
                                <select
                                    name='id_provinsi'
                                    id='id_provinsi'
                                    onChange={handleProvinsiChange}
                                    value={id || ''}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value=''>--Pilih Provinsi--</option>
                                    {provinsi && provinsi.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_provinsi}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Kabupaten Select */}
                            <div className='w-full sm:w-auto'>
                                <select
                                    name='id_kabupaten'
                                    id='id_kabupaten'
                                    disabled={!selectedProvinsi}
                                    onChange={handleKabChange}
                                    value={selectedKabupaten}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value=''>--Pilih Kabupaten--</option>
                                    {filteredKabupaten.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_kabupaten}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Suspense>

                        {/* Items per page selector */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Tampilkan:</label>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className='w-full border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-600">data</span>
                        </div>
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
                                    Hapus pencarian "{searchKeyword}"
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-red-800 text-white sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left">No</th>
                                            <th className="px-4 py-3 text-left">Nama Lengkap</th>
                                            <th className="px-4 py-3 text-left">Tingkat Penugasan</th>
                                            <th className="px-4 py-3 text-left">Kabupaten/Kota Penugasan</th>
                                            <th className="px-4 py-3 text-left">Asal SMA/SMK/MA</th>
                                            <th className="px-4 py-3 text-left">Tahun Tugas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item: any, index: number) => (
                                            <tr key={item.id} className="border-b hover:bg-red-50">
                                                <td className="px-4 py-3">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {item.nama_lengkap?.toUpperCase() || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getTingkatPenugasan(item)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.nama_kabupaten || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.asal_sma.toUpperCase() || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.tahun_tugas || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 gap-4">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
                                        {Math.min(currentPage * itemsPerPage, totalData)} dari {totalData} data
                                    </div>

                                    <div className="flex items-center gap-1 flex-wrap justify-center">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            «
                                        </button>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ‹
                                        </button>

                                        {generatePagination().map((page, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                disabled={page === '...'}
                                                className={`min-w-9 h-9 px-2 rounded border transition-colors ${currentPage === page
                                                    ? 'bg-red-700 text-white border-red-700'
                                                    : page === '...'
                                                        ? 'border-transparent bg-transparent cursor-default'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ›
                                        </button>

                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            »
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}