// app/adminpanel/PaskibrakaNasional.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { UrlApi } from "@/app/components/apiUrl";
import axios from "axios";
import { BaseUrl } from "@/app/components/baseUrl";
import Pagination2 from "@/app/components/Pagination2";
import * as XLSX from 'xlsx-js-style';

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

export default function PaskibrakaNasional() {
    const [data, setData] = useState<PaskibrakaNasional[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [limit, setLimit] = useState(10);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        nama_lengkap: "",
        jk: "",
        id_provinsi: "",
        id_kabupaten: "",
        asal_sma: "",
        tahun_tugas: "",
        photo: null as File | null,
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [filterTahun, setFilterTahun] = useState("2025");
    const [tahunList, setTahunList] = useState<number[]>([]); // State untuk daftar tahun
    const [kabupaten, setKabupaten]: any = useState([]);
    const [provinsi, setProvinsi]: any = useState([]);
    const [exporting, setExporting] = useState(false);
    const filteredKabupaten = kabupaten.filter((kabupaten: any) =>
        kabupaten.id_provinsi === Number(formData.id_provinsi)
    );

    // Fetch daftar tahun dari database
    const fetchTahunList = async () => {
        try {
            const response = await fetch(`${UrlApi}/adminpanel/tahun-list/paskibraka-nasional`, {
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success && result.data) {
                setTahunList(result.data);
                if (result.data.length > 0 && !filterTahun) {
                    setFilterTahun(result.data[0].toString());
                }
            }
        } catch (error) {
            console.error("Error fetching tahun list:", error);

        }
    };
    const fetchProvinsi = async () => {
        try {

            const res = await axios.get(`${UrlApi}/provinsi`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setProvinsi(res.data);

        } catch (e) {
            console.error(e);

        }
    };
    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: limit.toFixed(0),
                ...(search && { q: search }),
                ...(filterTahun && { tahun_tugas: filterTahun }),
            });

            const response = await fetch(
                `${UrlApi}/adminpanel/paskibraka-nasional?${params}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error("Gagal fetch data");

            const result: PaginatedResponse = await response.json();
            setData(result.data);
            setTotalPages(result.total_pages);
            setTotalItems(result.total_items);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    const fetchKabupaten = async () => {
        try {
            const res = await axios.get(`${UrlApi}/kabupaten`, {
                withCredentials: true,
            });
            setKabupaten(res.data || []);
        } catch (e) {
            console.error(e);
            setKabupaten([]);
        }
    };

    useEffect(() => {
        fetchTahunList();
        fetchKabupaten();
        fetchProvinsi();
    }, []);

    useEffect(() => {
        fetchData();
    }, [limit, currentPage, search, filterTahun]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append("nama_lengkap", formData.nama_lengkap);
        formDataToSend.append("jk", formData.jk);
        formDataToSend.append("id_provinsi", formData.id_provinsi);
        if (formData.id_kabupaten)
            formDataToSend.append("id_kabupaten", formData.id_kabupaten);
        if (formData.asal_sma)
            formDataToSend.append("asal_sma", formData.asal_sma);
        if (formData.tahun_tugas)
            formDataToSend.append("tahun_tugas", formData.tahun_tugas);
        if (formData.photo) formDataToSend.append("photo", formData.photo);

        try {
            const url = isEditMode
                ? `${UrlApi}/adminpanel/paskibraka-nasional/${selectedId}`
                : `${UrlApi}/adminpanel/paskibraka-nasional`;

            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                credentials: 'include',
                body: formDataToSend,
            });

            if (!response.ok) throw new Error("Gagal menyimpan data");

            toast.success(
                isEditMode
                    ? "Data berhasil diupdate"
                    : "Data berhasil ditambahkan"
            );
            setIsModalOpen(false);
            resetForm();
            fetchData();
            fetchTahunList();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

        try {
            const response = await fetch(
                `${UrlApi}/adminpanel/paskibraka-nasional/${id}`,
                {
                    method: "DELETE",
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error("Gagal menghapus data");

            toast.success("Data berhasil dihapus");
            fetchData();
            fetchTahunList();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus data");
        }
    };

    const handleEdit = (item: PaskibrakaNasional) => {
        setIsEditMode(true);
        setSelectedId(item.id);
        setFormData({
            nama_lengkap: item.nama_lengkap,
            jk: item.jk || "",
            id_provinsi: item.id_provinsi.toString(),
            id_kabupaten: item.id_kabupaten?.toString() || "",
            asal_sma: item.asal_sma || "",
            tahun_tugas: item.tahun_tugas?.toString() || "",
            photo: null,
        });
        if (item.photo) {
            setPhotoPreview(
                `${BaseUrl}${item.photo}`
            );
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            nama_lengkap: "",
            jk: "",
            id_provinsi: "",
            id_kabupaten: "",
            asal_sma: "",
            tahun_tugas: "",
            photo: null,
        });
        setPhotoPreview(null);
        setIsEditMode(false);
        setSelectedId(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 10MB");
                return;
            }
            if (!file.type.match(/image\/(jpeg|png)/)) {
                toast.error("Format file harus JPEG atau PNG");
                return;
            }
            setFormData({ ...formData, photo: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    const exportToExcel = async () => {
        setExporting(true);
        toast.loading("Mengambil semua data...", { id: "export" });

        try {
            // 1. Dapatkan total data tanpa filter tahun
            const firstRes = await fetch(
                `${UrlApi}/adminpanel/paskibraka-nasional?per_page=1`,
                { credentials: "include" }
            );
            const firstData: PaginatedResponse = await firstRes.json();
            const totalItems = firstData.total_items;
            const perPage = 500; // ambil 500 data per request
            const totalPages = Math.ceil(totalItems / perPage);

            let allData: PaskibrakaNasional[] = [];

            // 2. Ambil semua halaman secara paralel (batasi并发)
            for (let page = 1; page <= totalPages; page++) {
                const res = await fetch(
                    `${UrlApi}/adminpanel/paskibraka-nasional?page=${page}&per_page=${perPage}`,
                    { credentials: "include" }
                );
                const result: PaginatedResponse = await res.json();
                allData = [...allData, ...result.data];
                toast.loading(`Mengambil data... ${Math.round((page / totalPages) * 100)}%`, {
                    id: "export",
                });
            }

            if (allData.length === 0) {
                toast.error("Tidak ada data untuk diekspor", { id: "export" });
                return;
            }

            // 3. Kelompokkan berdasarkan tahun_tugas
            const groupedByYear: Record<string, PaskibrakaNasional[]> = {};
            allData.forEach((item) => {
                const year = item.tahun_tugas?.toString() || "Tanpa Tahun";
                if (!groupedByYear[year]) groupedByYear[year] = [];
                groupedByYear[year].push(item);
            });

            // 4. Buat workbook baru
            const workbook = XLSX.utils.book_new();

            // 5. Untuk setiap tahun, buat sheet
            for (const [year, items] of Object.entries(groupedByYear)) {
                // Urutkan data berdasarkan nama (opsional)
                const sorted = [...items].sort((a, b) =>
                    a.nama_lengkap.localeCompare(b.nama_lengkap)
                );

                // Mapping ke format yang rapi untuk excel
                const sheetData = sorted.map((item, idx) => ({
                    No: idx + 1,
                    "Nama Lengkap": item.nama_lengkap,
                    "Jenis Kelamin": item.jk === "Putra" ? "Laki-laki" : item.jk === "Putri" ? "Perempuan" : item.jk,
                    Provinsi: item.nama_provinsi || "-",
                    Kabupaten: item.nama_kabupaten || "-",
                    "Asal SMA": item.asal_sma || "-",
                    "Tahun Tugas": item.tahun_tugas || "-",
                }));

                // Konversi ke sheet
                const worksheet = XLSX.utils.json_to_sheet(sheetData);

                // (Opsional) styling sederhana: lebar kolom
                worksheet["!cols"] = [
                    { wch: 6 },  // No
                    { wch: 35 }, // Nama Lengkap
                    { wch: 15 }, // Jenis Kelamin
                    { wch: 25 }, // Provinsi
                    { wch: 25 }, // Kabupaten
                    { wch: 30 }, // Asal SMA
                    { wch: 12 }, // Tahun Tugas
                ];

                // Nama sheet (tidak boleh lebih dari 31 karakter dan tidak boleh karakter khusus)
                let sheetName = year === "Tanpa Tahun" ? "Tanpa Tahun" : `Tahun ${year}`;
                sheetName = sheetName.slice(0, 31);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }

            // 6. Generate file dan download
            XLSX.writeFile(workbook, `Paskibraka_Nasional.xlsx`);
            toast.success(`Berhasil export ${allData.length} data ke Excel`, { id: "export" });
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengekspor data", { id: "export" });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Toaster position="top-right" />

            <div className="mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-dark rounded-lg shadow mb-6 p-6 ">
                    <div className="flex flex-row justify-between">

                        <h1 className="text-3xl font-bold dark:text-accent text-gray-800 mb-2">
                            Paskibraka Nasional
                        </h1>
                        <button
                            onClick={exportToExcel}
                            disabled={exporting}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {exporting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4h6M4 4h16v16H4z" />
                                </svg>
                            )}
                            Export Excel
                        </button>

                    </div>

                    <p className="text-gray-600 dark:text-white">
                        Kelola data anggota Paskibraka Nasional
                    </p>
                </div>
                {/* Filter & Search */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 justify-between items-end">
                        <div className="flex-1 min-w-50">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cari Nama
                            </label>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                            />
                        </div>

                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                                Filter Tahun
                            </label>
                            <select
                                value={filterTahun}
                                onChange={(e) => {
                                    setFilterTahun(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                            >
                                <option value="" className="dark:bg-dark">Semua Tahun</option>
                                {tahunList.map((tahun) => (
                                    <option key={tahun} value={tahun} className="dark:bg-dark">
                                        {tahun}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Data
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
                        Menampilkan {data.length} dari {totalItems} data
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-dark rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-dark">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Foto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Nama Lengkap
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Jenis Kelamin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Provinsi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Kabupaten
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Asal SMA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Tahun Tugas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y dark:bg-dark divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-2 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-2 text-center dark:text-white">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {index + ((currentPage - 1) * 10) + 1}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                {item.photo ? (
                                                    <img
                                                        src={`${BaseUrl}${item.photo}`}
                                                        alt={item.nama_lengkap}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {item.nama_lengkap}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm dark:text-white">
                                                {item.jk}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm dark:text-white">
                                                {item.nama_provinsi || '-'}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm dark:text-white">
                                                {item.nama_kabupaten || '-'}
                                            </td>
                                            <td className="px-6 py-2 text-sm dark:text-white">
                                                {item.asal_sma || '-'}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm dark:text-white">
                                                {item.tahun_tugas || '-'}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="bg-white dark:bg-dark px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-dark dark:text-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-dark dark:text-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>

                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-200">
                                        Menampilkan <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>{" "}
                                        sampai <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span>{" "}
                                        dari <span className="font-medium">{totalItems}</span> data
                                    </p>
                                </div>
                                <Pagination2
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 dark:text-white dark:bg-dark">Tampilkan:</label>
                                    <select
                                        value={limit}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLimit(Number(e.target.value))}
                                        className='w-full border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span className="text-sm text-gray-600 dark:text-white dark:bg-dark">data</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form - Sama seperti sebelumnya dengan tambahan field JK */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isEditMode ? "Edit Data" : "Tambah Data Baru"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Foto
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="w-full border border-gray-300 rounded-lg"
                                />
                                {photoPreview && (
                                    <div className="mt-2">
                                        <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_lengkap}
                                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kelamin *
                                </label>
                                <select
                                    required
                                    value={formData.jk}
                                    onChange={(e) => setFormData({ ...formData, jk: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="Putra">Putra</option>
                                    <option value="Putri">Putri</option>
                                </select>
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Provinsi *
                                </label>
                                <select
                                    name='id_provinsi'
                                    id='id_provinsi'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, id_provinsi: value })
                                    }}
                                    value={formData.id_provinsi}
                                >
                                    <option value=''>Pilih Salah Satu</option>
                                    {provinsi.map((item: any) => (
                                        <option value={item.id} key={item.id}>
                                            {item.nama_provinsi}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kabupaten
                                </label>
                                <select
                                    name='id_kabupaten'
                                    id='id_kabupaten'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    onChange={(e) => setFormData({ ...formData, id_kabupaten: e.target.value })}
                                    value={formData.id_kabupaten}
                                >
                                    <option value=''>Pilih Salah Satu</option>
                                    {filteredKabupaten.map((item: any) => (
                                        <option value={item.id} key={item.id}>
                                            {item.nama_kabupaten}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asal SMA
                                </label>
                                <input
                                    type="text"
                                    value={formData.asal_sma}
                                    onChange={(e) => setFormData({ ...formData, asal_sma: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tahun Tugas
                                </label>
                                <select
                                    value={formData.tahun_tugas}
                                    onChange={(e) => setFormData({ ...formData, tahun_tugas: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Pilih Tahun</option>
                                    {tahunList.map((tahun) => (
                                        <option key={tahun} value={tahun}>
                                            {tahun}
                                        </option>
                                    ))}
                                </select>
                            </div>



                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-yellow-500 text-black py-2 rounded-lg hover:bg-yellow-800 hover:text-white transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-success text-black py-2 rounded-lg hover:bg-green-800 hover:text-white transition-colors"
                                >
                                    {isEditMode ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}