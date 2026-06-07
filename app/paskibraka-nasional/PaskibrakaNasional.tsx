// app/paskibraka-nasional/page.tsx
"use client";

import { useState, useEffect } from "react";
import { UrlApi } from "../components/apiUrl";
import { BaseUrl } from "../components/baseUrl";

interface PaskibrakaNasional {
    id: number;
    nama_lengkap: string;
    jk: string;
    id_provinsi: number;
    id_kabupaten: number | null;
    asal_sma: string | null;
    tahun_tugas: number | null;
    photo: string | null;
    nama_provinsi?: string | null;
    nama_kabupaten?: string | null;
}

interface PaginatedResponse {
    data: PaskibrakaNasional[];
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    from: number;
    to: number;
    query: string;
}

export default function PublicPaskibraka() {
    const [data, setData] = useState<PaskibrakaNasional[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [tahunList, setTahunList] = useState<number[]>([]);
    const [filterTahun, setFilterTahun] = useState<string>('');

    // Fetch daftar tahun dari database
    const fetchTahunList = async () => {
        try {
            const response = await fetch(`${UrlApi}/public/tahun-list/paskibraka-nasional`);
            if (!response.ok) throw new Error("Gagal fetch tahun list");
            const result = await response.json();
            if (result.success && result.data) {
                setTahunList(result.data);
                // Set default filter ke tahun terbaru
                if (result.data.length > 0 && !filterTahun) {
                    setFilterTahun(result.data[0].toString());
                }
            }
        } catch (error) {
            console.error("Error fetching tahun list:", error);
            // Fallback: coba ambil dari data
            try {
                const fallbackResponse = await fetch(`${UrlApi}/public/paskibraka-nasional?per_page=1000`);
                const fallbackResult = await fallbackResponse.json();
                const years: any = [...new Set(
                    fallbackResult.data
                        .map((item: PaskibrakaNasional) => item.tahun_tugas)
                        .filter((year: number | null): year is number => year !== null)
                )].sort(({ a, b }: any) => b - a);
                setTahunList(years);
                if (years.length > 0 && !filterTahun) {
                    setFilterTahun(years[0].toString());
                }
            } catch (e) {
                console.error("Fallback juga gagal:", e);
            }
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: "12",
                ...(search && { q: search }),
                ...(filterTahun && { tahun_tugas: filterTahun }),
            });

            const response = await fetch(
                `${UrlApi}/public/paskibraka-nasional?${params}`
            );

            if (!response.ok) throw new Error("Gagal fetch data");

            const result: PaginatedResponse = await response.json();
            setData(result.data);
            setTotalPages(result.total_pages);
            setTotalItems(result.total_items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTahunList();
    }, []);

    useEffect(() => {
        fetchData();
    }, [currentPage, search, filterTahun]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleTahunChange = (tahun: string) => {
        setFilterTahun(tahun);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearch("");
        setFilterTahun(tahunList[0]?.toString() || "");
        setCurrentPage(1);
    };

    // Fungsi untuk pagination dengan ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-red-600 to-red-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Paskibraka Nasional
                    </h1>
                    <p className="text-xl opacity-90">
                        Mengenal para putra-putri terbaik bangsa yang bertugas sebagai Pasukan Pengibar Bendera Pusaka
                    </p>
                </div>
            </div>

            {/* Filter & Search Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Box */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cari nama paskibraka..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Tahun Filter Dropdown */}
                    <div className="w-full md:w-64">
                        <select
                            value={filterTahun}
                            onChange={(e) => handleTahunChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        >
                            <option value="">Semua Tahun</option>
                            {tahunList.map((tahun) => (
                                <option key={tahun} value={tahun}>
                                    Tahun {tahun}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filter Button */}
                    {(search || filterTahun) && (
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Active Filters Info */}
                {(search || filterTahun) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {search && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                Cari: {search}
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCurrentPage(1);
                                    }}
                                    className="ml-2 hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filterTahun && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                Tahun: {filterTahun}
                                <button
                                    onClick={() => {
                                        setFilterTahun("");
                                        setCurrentPage(1);
                                    }}
                                    className="ml-2 hover:text-green-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Result Info */}
                <div className="mt-4 text-sm text-gray-500">
                    Menampilkan {data.length} dari {totalItems} data
                </div>
            </div>

            {/* Grid Cards */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada data</h3>
                        <p className="mt-1 text-gray-500">
                            {search || filterTahun
                                ? "Tidak ditemukan data yang sesuai dengan filter"
                                : "Belum ada data Paskibraka Nasional"}
                        </p>
                    </div>
                ) : (
                    <>

                        {/* Pisahkan data berdasarkan tahun */}
                        {(() => {
                            const latestData = data.filter(item => item.tahun_tugas && item.tahun_tugas >= 2022);
                            const oldData = data.filter(item => item.tahun_tugas && item.tahun_tugas < 2022);

                            return (
                                <>
                                    {/* Grid Cards untuk tahun >= 2022 */}
                                    {latestData.length > 0 && (
                                        <div className="mb-12">
                                            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-4">
                                                    Paskibraka Tahun {Math.min(...latestData.map(d => d.tahun_tugas!))} - {Math.max(...latestData.map(d => d.tahun_tugas!))}
                                                </h2> */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {latestData.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                                                    >
                                                        {/* Photo Section */}
                                                        <div className="relative h-64 bg-linear-to-br from-gray-100 to-gray-200">
                                                            {item.photo ? (
                                                                <img
                                                                    src={`${BaseUrl}${item.photo}`}
                                                                    alt={item.nama_lengkap}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <div className="text-center">
                                                                        <svg className="w-20 h-20 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        <p className="mt-2 text-sm text-gray-400">No Photo</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Year Badge */}
                                                            {item.tahun_tugas && (
                                                                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                                                                    {item.tahun_tugas}
                                                                </div>
                                                            )}
                                                            {/* Gender Badge */}
                                                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
                                                                {item.jk === 'Putra' ? '👨 Putra' : item.jk === 'Putri' ? '👩 Putri' : item.jk}
                                                            </div>
                                                        </div>

                                                        {/* Info Section */}
                                                        <div className="p-4">
                                                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                                                                {item.nama_lengkap}
                                                            </h3>
                                                            <div className="space-y-1.5 text-sm">
                                                                {/* Provinsi */}
                                                                <div className="flex items-start gap-2 text-gray-600">
                                                                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    <span className="line-clamp-1">{item.nama_provinsi || '-'}</span>
                                                                </div>
                                                                {/* Kabupaten */}
                                                                {item.nama_kabupaten && (
                                                                    <div className="flex items-start gap-2 text-gray-600">
                                                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                        </svg>
                                                                        <span className="line-clamp-1">{item.nama_kabupaten}</span>
                                                                    </div>
                                                                )}
                                                                {/* Asal SMA */}
                                                                {item.asal_sma && (
                                                                    <div className="flex items-start gap-2 text-gray-600">
                                                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                                        </svg>
                                                                        <span className="line-clamp-2">{item.asal_sma}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tabel untuk tahun < 2022 */}
                                    {oldData.length > 0 && (
                                        <div className="overflow-x-auto shadow-md rounded-lg">
                                            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-4">
                                                    Paskibraka Tahun Sebelum 2022
                                                </h2> */}
                                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                                <thead className="bg-gray-100 border-b">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provinsi</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kabupaten/Kota</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal SMA</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Tugas</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {oldData.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.nama_lengkap}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jk}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nama_provinsi || '-'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nama_kabupaten || '-'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{item.asal_sma || '-'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tahun_tugas}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Jika kedua kelompok kosong */}
                                    {latestData.length === 0 && oldData.length === 0 && (
                                        <div className="text-center py-12">Tidak ada data</div>
                                    )}
                                </>
                            );
                        })()}


                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12">
                                {/* Pagination Controls */}
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {/* First Page */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                            First
                                        </span>
                                    </button>

                                    {/* Previous */}
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Prev
                                        </span>
                                    </button>

                                    {/* Page Numbers with Ellipsis */}
                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="px-4 py-2 text-gray-500"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page as number)}
                                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === page
                                                    ? "bg-red-600 text-white shadow-md transform scale-105"
                                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    {/* Next */}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            Next
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </button>

                                    {/* Last Page */}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            Last
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                {/* Info Pagination */}
                                <div className="text-center mt-4 text-sm text-gray-500">
                                    Page {currentPage} of {totalPages} • Total {totalItems} data
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}