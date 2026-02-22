'use client';
import { useState, FormEvent, useEffect } from 'react';
import Swal from 'sweetalert2';
import { UrlApi } from '@/app/components/apiUrl';
import FormatLongDate from '@/app/components/FormatLongDate';
import Link from 'next/link';
import Pagination from '@/app/components/Pagination';
import InputLabel from '@/app/components/InputLabel';
import { BaseUrl } from '@/app/components/baseUrl';
import Image from 'next/image';
import axios from 'axios';
import { useUser } from '@/app/components/UserContext';
import * as XLSX from 'xlsx-js-style';
interface Wilayah {
    id: number;
    nama_provinsi: string;
    nama_kabupaten: string;
}
// Interface untuk data PDP - SESUAI DENGAN BACKEND
interface PdpData {
    id: number;
    no_simental: string | null;
    no_piagam: string | null;
    nama_lengkap: string;
    jk: string | null;
    tempat_lahir: string | null;
    tgl_lahir: string | null;
    alamat: string | null;
    id_kabupaten_domisili: number | null;
    id_provinsi_domisili: number | null;
    kabupaten_domisili: string | null;
    provinsi_domisili: string | null;
    email: string | null;
    telepon: string | null;
    posisi: string | null;
    tingkat_penugasan: string | null;
    id_kabupaten: number | null;
    id_provinsi: number | null;
    kabupaten: string | null;
    provinsi: string | null;
    thn_tugas: number | null;
    status: string | null;
    photo: string | null;
}

// Interface response dari backend - SESUAI DENGAN BACKEND
interface PaginationResponse {
    data: PdpData[];
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    last_page: number;
    from: number;
    to: number;
    query: string;
}

// interface untuk data Excel
interface ExcelPdpData {
    'ID PDP': number;
    'No Simental': string;
    'No Piagam': string;
    'Nama Lengkap': string;
    'Jenis Kelamin': string;
    'Tempat Lahir': string;
    'Tanggal Lahir': string;
    'Alamat': string;
    'Kabupaten Domisili': string;
    'Provinsi Domisili': string;
    'Email': string;
    'Telepon': string;
    'Posisi': string;
    'Tingkat Penugasan': string;
    'Kabupaten Penugasan': string;
    'Provinsi Penugasan': string;
    'Tahun Tugas': number | string;
    'Status': string;
}
function PdpVerified() {
    const { user } = useUser()
    const [pdp, setPdp] = useState<PaginationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // State untuk filter wilayah
    const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Wilayah[]>([]);
    const [selectedProvinsi, setSelectedProvinsi] = useState<number | ''>('');
    const [selectedKabupaten, setSelectedKabupaten] = useState<number | ''>('');
    const [loadingWilayah, setLoadingWilayah] = useState(false);

    const [dataStatus, setDataStatus] = useState<{
        id?: number,
        status?: string,
        keterangan?: string
    }>({});
    const [modalUpdateStatus, setModalUpdateStatus] = useState(false);
    const [showRejectionReason, setShowRejectionReason] = useState(false);

    const getProvinsi = async () => {
        try {
            const response = await axios.get(`${UrlApi}/provinsi`);
            setProvinsiList(response.data);
        } catch (error) {
            console.error('Error fetching provinsi:', error);
        }
    };

    // Ambil data kabupaten berdasarkan provinsi
    const getKabupaten = async (provinsiId: number) => {
        if (!provinsiId) {
            setKabupatenList([]);
            return;
        }

        setLoadingWilayah(true);
        try {
            const response = await axios.get(`${UrlApi}/wilayah/kabupaten/${provinsiId}`);
            setKabupatenList(response.data);
        } catch (error) {
            console.error('Error fetching kabupaten:', error);
            setKabupatenList([]);
        } finally {
            setLoadingWilayah(false);
        }
    };

    //delete Data
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');

    const openDelete = (row: PdpData) => {
        setDeleteId(row.id);
        setDeleteName(row.nama_lengkap);
        document.getElementById('deleteModal')?.classList.remove('hidden');
        document.getElementById('deleteModal')?.classList.add('flex');
    };
    const closeDelete = () => {
        document.getElementById('deleteModal')?.classList.add('hidden');
        document.getElementById('deleteModal')?.classList.remove('flex');
    };

    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        if (!deleteId) return;
        try {
            await axios.delete(`${UrlApi}/adminpanel/pdp/${deleteId}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            Swal.fire({ icon: 'success', text: 'Pelaksana berhasil dihapus', confirmButtonColor: '#2563eb' });
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal menghapus data' });
        }
    };

    // Reset filter kabupaten ketika provinsi berubah
    useEffect(() => {
        if (selectedProvinsi) {
            getKabupaten(selectedProvinsi);
        } else {
            setKabupatenList([]);
            setSelectedKabupaten('');
        }
    }, [selectedProvinsi]);

    // ambil data
    const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDataStatus({
            ...dataStatus,
            [name]: value,
        });

        // Jika status dipilih menjadi "Ditolak", tampilkan form alasan
        if (name === 'status' && value === 'Ditolak') {
            setShowRejectionReason(true);
        } else if (name === 'status') {
            setShowRejectionReason(false);
        }
    };

    const clickModalStatus = (item: PdpData) => {
        setModalUpdateStatus(true);
        setDataStatus({
            id: item.id,
            status: item.status || '',
            keterangan: ''
        });
        setShowRejectionReason(false);
    };

    const submitUpdateStatus = async (e: FormEvent) => {
        e.preventDefault();

        if (!dataStatus.id) {
            Swal.fire({
                icon: 'error',
                text: 'ID PDP tidak valid',
            });
            return;
        }

        // Validasi untuk status Ditolak
        if (dataStatus.status === 'Ditolak' && (!dataStatus.keterangan || dataStatus.keterangan.trim() === '')) {
            Swal.fire({
                icon: 'error',
                text: 'Alasan penolakan wajib diisi',
            });
            return;
        }

        // Konfirmasi khusus untuk status Ditolak
        let confirmationMessage = '';
        let confirmButtonColor = '#2563eb';

        if (dataStatus.status === 'Verified') {
            confirmationMessage = 'Anda yakin ingin mengubah status menjadi "Verified"?';
            confirmButtonColor = '#28a745';
        } else if (dataStatus.status === 'Ditolak') {
            confirmationMessage =
                'PERHATIAN: Data PDP akan dihapus permanen dari sistem!\n\n' +
                'Alasan: ' + dataStatus.keterangan + '\n\n' +
                '\n\n. User dapat mendaftar ulang dengan email yang sama setelah data dihapus.\n' +
                'Lanjutkan penolakan?';
            confirmButtonColor = '#dc3545';
        } else {
            confirmationMessage = `Anda yakin ingin mengubah status menjadi "${dataStatus.status}"?`;
        }

        Swal.fire({
            icon: dataStatus.status === 'Ditolak' ? 'warning' : 'question',
            title: dataStatus.status === 'Ditolak' ? 'Konfirmasi Penolakan' : 'Konfirmasi Status',
            text: confirmationMessage,
            showDenyButton: true,
            denyButtonText: 'Batal',
            confirmButtonText: dataStatus.status === 'Ditolak' ? 'Ya, Tolak & Hapus' : 'Ya',
            confirmButtonColor: confirmButtonColor,
            customClass: {
                actions: 'my-actions',
                denyButton: 'order-1 right-gap',
                confirmButton: 'order-3',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {

                Swal.fire({
                    title: 'Mohon menunggu',
                    text: dataStatus.status === 'Verified' ? 'Sedang mengirim email...' : 'Sedang memproses...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                try {
                    const formData = new FormData();
                    formData.append('status', dataStatus.status || '');

                    // Tambahkan keterangan jika status Ditolak
                    if (dataStatus.status === 'Ditolak' && dataStatus.keterangan) {
                        formData.append('keterangan', dataStatus.keterangan);
                    }

                    const response = await fetch(`${UrlApi}/adminpanel/pdp-update-status/${dataStatus.id}`, {
                        method: 'PUT',
                        body: formData,
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    let successMessage = result.message || 'Status berhasil diupdate!';

                    if (dataStatus.status === 'Verified') {
                        successMessage += ' Password telah dikirim ke alamat email yang didaftarkan';
                    } else if (dataStatus.status === 'Ditolak') {
                        successMessage += ' Alasan penolakan telah dikirim via email';
                    }

                    Swal.fire({
                        icon: 'success',
                        text: successMessage,
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2563eb',
                    }).then(() => {
                        setModalUpdateStatus(false);
                        setShowRejectionReason(false);
                        setDataStatus({});
                        getPdp(currentPage, searchQuery);
                    });
                } catch (error: any) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        text: error.message || 'Terjadi kesalahan saat mengirim data',
                    });
                }
            }

        });
    };

    useEffect(() => {
        getPdp();
        getProvinsi(); // Load data provinsi saat komponen mount
    }, []);


    const getPdp = async (page: number = 1, query: string = '', provinsiId: number | '' = '', kabupatenId: number | '' = '') => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (query) {
            params.append('q', query);
        }
        if (provinsiId) {
            params.append('provinsi_id', provinsiId.toString());
        }
        if (kabupatenId) {
            params.append('kabupaten_id', kabupatenId.toString());
        }

        try {
            if (user?.role === "Administrator" || user?.role === "Superadmin") {
                const response = await axios.get(`${UrlApi}/adminpanel/pdp-verified?${params.toString()}`, {
                    withCredentials: true
                });
                setPdp(response.data);
            } else {
                const response = await axios.get(`${UrlApi}/kesbangpol/pdp-verified?${params.toString()}`, {
                    withCredentials: true
                });
                setPdp(response.data);
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };


    // Handle filter provinsi
    const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? parseInt(e.target.value) : '';
        setSelectedProvinsi(value);
        setSelectedKabupaten(''); // Reset kabupaten ketika provinsi berubah
        setCurrentPage(1);
        getPdp(1, searchQuery, value, '');
    };

    // Handle filter kabupaten
    const handleKabupatenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? parseInt(e.target.value) : '';
        setSelectedKabupaten(value);
        setCurrentPage(1);
        getPdp(1, searchQuery, selectedProvinsi, value);
    };

    // Reset semua filter
    const handleResetFilter = () => {
        setSelectedProvinsi('');
        setSelectedKabupaten('');
        setSearchQuery('');
        setCurrentPage(1);
        getPdp(1);
    };

    // Update handleSearch untuk include filter wilayah
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        getPdp(1, searchQuery, selectedProvinsi, selectedKabupaten);
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Memuat data...</div>
            </div>
        );
    }

    const handlePageChange = (url: string, page: number) => {
        console.log('Navigating to page:', page, 'URL:', url);
        setCurrentPage(page);
        getPdp(page, searchQuery, selectedProvinsi, selectedKabupaten);
    };

    const generateLinks = () => {
        if (!pdp) return [];

        const links = [];

        // Previous page link
        links.push({
            url: pdp.current_page > 1 ? `?page=${pdp.current_page - 1}&q=${searchQuery}&provinsi_id=${selectedProvinsi}&kabupaten_id=${selectedKabupaten}` : null,
            label: '<<',
            active: false
        });

        // Page number links
        for (let i = 1; i <= pdp.last_page; i++) {
            links.push({
                url: `?page=${i}&q=${searchQuery}&provinsi_id=${selectedProvinsi}&kabupaten_id=${selectedKabupaten}`,
                label: i.toString(),
                active: i === pdp.current_page
            });
        }

        // Next page link
        links.push({
            url: pdp.current_page < pdp.last_page ? `?page=${pdp.current_page + 1}&q=${searchQuery}&provinsi_id=${selectedProvinsi}&kabupaten_id=${selectedKabupaten}` : null,
            label: '>>',
            active: false
        });

        return links;
    };

    const downloadAllExcel = async () => {
        try {
            Swal.fire({
                title: 'Mengumpulkan Data',
                text: 'Sedang mengambil semua data...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const params = new URLSearchParams();
            if (searchQuery) {
                params.append('q', searchQuery);
            }
            if (selectedProvinsi) {
                params.append('provinsi_id', selectedProvinsi.toString());
            }
            if (selectedKabupaten) {
                params.append('kabupaten_id', selectedKabupaten.toString());
            }

            let response;
            if (user?.role === "Administrator" || user?.role === "Superadmin") {
                // Gunakan endpoint pdp-verified-all yang mengembalikan SEMUA data sekaligus
                response = await axios.get(`${UrlApi}/adminpanel/pdp-verified-all?${params.toString()}`, {
                    withCredentials: true
                });
            } else {
                // Untuk role lain, tetap gunakan endpoint biasa (mungkin perlu dibuat endpoint all juga)
                response = await axios.get(`${UrlApi}/kesbangpol/pdp-verified-all?${params.toString()}`, {
                    withCredentials: true
                });
            }

            // Untuk pdp-verified-all, response.data adalah array langsung, bukan object pagination
            let allData: PdpData[] = [];

            if (user?.role === "Administrator" || user?.role === "Superadmin") {
                // Endpoint pdp-verified-all mengembalikan array langsung
                allData = response.data;
            } else {
                // Endpoint biasa mengembalikan object pagination
                allData = response.data;
            }

            if (allData.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    text: 'Tidak ada data untuk diunduh',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }

            if (allData.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    text: 'Tidak ada data untuk diunduh',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }

            // Format data untuk Excel
            const excelData: ExcelPdpData[] = allData.map((item, index) => ({
                'No.': index + 1,
                'ID PDP': item.id,
                'No Simental': item.no_simental || '-',
                'No Piagam': item.no_piagam || '-',
                'Nama Lengkap': item.nama_lengkap,
                'Jenis Kelamin': item.jk || '-',
                'Tempat Lahir': item.tempat_lahir || '-',
                'Tanggal Lahir': item.tgl_lahir && item.tgl_lahir !== '0000-00-00'
                    ? FormatLongDate(item.tgl_lahir)
                    : '-',
                'Alamat': item.alamat || '-',
                'Kabupaten Domisili': item.kabupaten_domisili || '-',
                'Provinsi Domisili': item.provinsi_domisili || '-',
                'Email': item.email || '-',
                'Telepon': item.telepon || '-',
                'Posisi': item.posisi || '-',
                'Tingkat Penugasan': item.tingkat_penugasan || '-',
                'Kabupaten Penugasan': item.kabupaten || '-',
                'Provinsi Penugasan': item.provinsi || '-',
                'Tahun Tugas': item.thn_tugas || '-',
                'Status': item.status || '-'
            }));

            // Buat workbook dan worksheet
            const wb = XLSX.utils.book_new();

            // Buat data dengan judul
            const worksheetData = [
                // Baris 1: Judul Utama
                ['DATA PDP VERIFIED'],

                // Baris 2: Informasi Filter
                [`Data diambil pada: ${new Date().toLocaleString('id-ID')}`],

                // Baris 3: Informasi Filter Detail
                [getFilterInfo()],

                [],

                // Baris 5: Header Tabel
                Object.keys(excelData[0])
            ];

            // Tambahkan data
            excelData.forEach(row => {
                worksheetData.push(Object.values(row));
            });

            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            // Hitung jumlah kolom
            const totalColumns = Object.keys(excelData[0]).length;

            // ===== STYLING =====
            // Style untuk judul utama
            const titleStyle = {
                font: {
                    name: 'Arial',
                    sz: 16,
                    bold: true,

                },

                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };

            // Style untuk informasi
            const infoStyle = {
                font: {
                    name: 'Arial',
                    sz: 10,
                    italic: true,
                    color: { rgb: "666666" }
                },
                alignment: {
                    horizontal: "left",
                    vertical: "center"
                }
            };

            // Style untuk header tabel
            const headerStyle = {
                font: {
                    name: 'Arial',
                    sz: 11,
                    bold: true,
                    color: { rgb: "FFFFFF" }
                },
                fill: {
                    fgColor: { rgb: "C80004" }
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center",
                    wrapText: true
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };

            // Style untuk data
            const dataStyle = {
                font: {
                    name: 'Arial',
                    sz: 10
                },
                alignment: {
                    vertical: "center",
                    wrapText: true
                },
                border: {
                    top: { style: "thin", color: { rgb: "DDDDDD" } },
                    left: { style: "thin", color: { rgb: "DDDDDD" } },
                    bottom: { style: "thin", color: { rgb: "DDDDDD" } },
                    right: { style: "thin", color: { rgb: "DDDDDD" } }
                }
            };

            // Style khusus untuk kolom nomor
            const numberStyle = {
                ...dataStyle,
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                }
            };

            // ===== TERAPKAN STYLING =====
            // Judul utama (Baris 1, colspan seluruh kolom)
            ws['!merges'] = ws['!merges'] || [];
            ws['!merges'].push(
                { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } }
            );

            // Apply styles ke semua cell
            const applyStyleToCell = (cell: XLSX.CellObject | undefined, style: any) => {
                if (cell) {
                    cell.s = style;
                }
            };

            // Judul utama
            const titleCell = 'A1';
            if (!ws[titleCell]) {
                ws[titleCell] = { v: worksheetData[0][0], t: 's' };
            }
            applyStyleToCell(ws[titleCell], titleStyle);

            // Informasi tanggal
            const infoCell1 = 'A2';
            if (!ws[infoCell1]) {
                ws[infoCell1] = { v: worksheetData[1][0], t: 's' };
            }
            applyStyleToCell(ws[infoCell1], infoStyle);

            // Informasi filter
            const infoCell2 = 'A3';
            if (!ws[infoCell2]) {
                ws[infoCell2] = { v: worksheetData[2][0], t: 's' };
            }
            applyStyleToCell(ws[infoCell2], infoStyle);

            // Header tabel (Baris 5)
            for (let col = 0; col < totalColumns; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col });
                if (ws[cellAddress]) {
                    applyStyleToCell(ws[cellAddress], headerStyle);
                }
            }

            // Data rows (mulai dari baris 6)
            const dataRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1');
            for (let row = 5; row <= dataRange.e.r; row++) {
                for (let col = 0; col < totalColumns; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellAddress]) continue;

                    // Apply base data style
                    let style: any = { ...dataStyle };

                    // Center align untuk kolom nomor (kolom 0)
                    if (col === 0) {
                        style = { ...style, ...numberStyle };
                    }

                    applyStyleToCell(ws[cellAddress], style);
                }
            }

            // ===== PENGATURAN KOLOM =====
            ws['!cols'] = [
                { width: 6 },   // No. Urut
                { width: 8 },   // ID PDP
                { width: 16 },  // No Simental
                { width: 25 },  // No Piagam
                { width: 30 },  // Nama Lengkap
                { width: 12 },  // Jenis Kelamin
                { width: 30 },  // Tempat Lahir
                { width: 18 },  // Tanggal Lahir
                { width: 56 },  // Alamat
                { width: 25 },  // Kabupaten Domisili
                { width: 20 },  // Provinsi Domisili
                { width: 30 },  // Email
                { width: 15 },  // Telepon
                { width: 15 },  // Posisi
                { width: 20 },  // Tingkat Penugasan
                { width: 20 },  // Kabupaten Penugasan
                { width: 20 },  // Provinsi Penugasan
                { width: 10 },  // Tahun Tugas
                { width: 15 }   // Status
            ];

            // Atur tinggi baris
            ws['!rows'] = [
                { hpt: 25 }, // Baris 1 - Judul (lebih tinggi)
                { hpt: 20 }, // Baris 2 - Info
                { hpt: 20 }, // Baris 3 - Filter
                { hpt: 5 },  // Baris 4 - Spasi
                { hpt: 30 }, // Baris 5 - Header
                ...Array(allData.length).fill({ hpt: 30 }) // Data rows
            ];

            // Tambahkan worksheet ke workbook
            XLSX.utils.book_append_sheet(wb, ws, 'PDP VERIFIED');

            // Generate nama file
            let fileName = 'PDP_Verified_Semua_Data';
            if (selectedProvinsi) {
                const provinsiName = provinsiList.find(p => p.id === selectedProvinsi)?.nama_provinsi || '';
                fileName += `_${provinsiName.replace(/\s+/g, '_')}`;
            }
            if (selectedKabupaten) {
                const kabupatenName = kabupatenList.find(k => k.id === selectedKabupaten)?.nama_kabupaten || '';
                fileName += `_${kabupatenName.replace(/\s+/g, '_')}`;
            }
            if (searchQuery) {
                fileName += `_search_${searchQuery.substring(0, 10)}`;
            }
            fileName += `_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Download file
            XLSX.writeFile(wb, fileName);

            Swal.fire({
                icon: 'success',
                text: `File Excel berhasil diunduh: ${fileName}\nTotal data: ${allData.length} records`,
                confirmButtonColor: '#2563eb',
                timer: 5000
            });

        } catch (error: any) {
            console.error('Error downloading Excel:', error);
            Swal.fire({
                icon: 'error',
                text: 'Gagal mengunduh file Excel: ' + (error.response?.data?.message || error.message),
                confirmButtonColor: '#2563eb'
            });
        }
    };

    // Fungsi untuk mendapatkan informasi filter
    const getFilterInfo = (): string => {
        const filters = [];

        if (selectedProvinsi) {
            const provinsiName = provinsiList.find(p => p.id === selectedProvinsi)?.nama_provinsi;
            filters.push(`Provinsi: ${provinsiName}`);
        }

        if (selectedKabupaten) {
            const kabupatenName = kabupatenList.find(k => k.id === selectedKabupaten)?.nama_kabupaten;
            filters.push(`Kabupaten: ${kabupatenName}`);
        }

        if (searchQuery) {
            filters.push(`Pencarian: "${searchQuery}"`);
        }

        if (filters.length === 0) {
            return 'Filter: Semua Data';
        }

        return `Filter: ${filters.join(', ')}`;
    };

    return (
        <div className='dark:bg-slate-900 min-h-screen p-4'>

            {/* Header dan Search */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6'>
                <div className='flex items-center mb-4 lg:mb-0'>
                    <i className='fas fa-server text-accent text-3xl'></i>
                    <p className='text-accent mt-1 mx-2 font-bold lg:text-2xl dark:text-white'>DATA PDP DIVERIFIKASI</p>
                </div>
                <div className='flex gap-2'>
                    {/* Tombol Download Excel */}
                    <button
                        onClick={downloadAllExcel} // Ganti dari downloadExcel
                        className='px-4 py-2 text-sm font-semibold text-white rounded-md bg-green-600 hover:bg-green-700 flex items-center'
                    >
                        <i className='fas fa-file-excel mr-2'></i> Download Semua Data
                    </button>
                </div>
            </div>
            {/* Filter Wilayah dan Search */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6'>
                {user?.role === "Administrator" || user?.role === "Superadmin" ?
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Provinsi
                            </label>
                            <select
                                value={selectedProvinsi}
                                onChange={handleProvinsiChange}
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                            >
                                <option value=''>Semua Provinsi</option>
                                {provinsiList.map(provinsi => (
                                    <option key={provinsi.id} value={provinsi.id}>
                                        {provinsi.nama_provinsi}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Kabupaten/Kota
                            </label>
                            <select
                                value={selectedKabupaten}
                                onChange={handleKabupatenChange}
                                disabled={!selectedProvinsi || loadingWilayah}
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white disabled:opacity-50'
                            >
                                <option value=''>Semua Kabupaten</option>
                                {kabupatenList.map(kabupaten => (
                                    <option key={kabupaten.id} value={kabupaten.id}>
                                        {kabupaten.nama_kabupaten}
                                    </option>
                                ))}
                            </select>
                            {loadingWilayah && (
                                <p className='text-xs text-gray-500 mt-1'>Memuat kabupaten...</p>
                            )}
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Pencarian
                            </label>
                            <form onSubmit={handleSearch} className='flex gap-2'>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder='Cari berdasarkan Nama, NIK, Email, atau No. Piagam...'
                                    className='flex-1 p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                                />
                                <button
                                    type='submit'
                                    className='px-4 py-2 bg-accent text-white rounded-md hover:bg-red-800'
                                >
                                    <i className='fas fa-search'></i>
                                </button>
                                {(selectedProvinsi || selectedKabupaten || searchQuery) && (
                                    <button
                                        type='button'
                                        onClick={handleResetFilter}
                                        className='px-4 py-2  text-secondary  rounded-md hover:bg-gray-600'
                                    >
                                        <i className='fas fa-sync'></i>
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                    : <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Pencarian
                        </label>
                        <form onSubmit={handleSearch} className='flex gap-2'>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Cari berdasarkan Nama, NIK, Email, atau No. Piagam...'
                                className='flex-1 p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                            />
                            <button
                                type='submit'
                                className='px-4 py-2 bg-accent text-white rounded-md hover:bg-red-800'
                            >
                                <i className='fas fa-search'></i>
                            </button>
                            {(selectedProvinsi || selectedKabupaten || searchQuery) && (
                                <button
                                    type='button'
                                    onClick={handleResetFilter}
                                    className='px-4 py-2  text-secondary  rounded-md hover:bg-gray-600'
                                >
                                    <i className='fas fa-sync'></i>
                                </button>
                            )}
                        </form>
                    </div>}

                {/* Info Filter Aktif */}
                {(selectedProvinsi || selectedKabupaten) && (
                    <div className='mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md'>
                        <p className='text-sm text-blue-700 dark:text-blue-300'>
                            Filter aktif:
                            {selectedProvinsi && ` Provinsi: ${provinsiList.find(p => p.id === selectedProvinsi)?.nama_provinsi}`}
                            {selectedKabupaten && `, ${kabupatenList.find(k => k.id === selectedKabupaten)?.nama_kabupaten}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse text-sm'>
                        <thead className='bg-gray-100 dark:bg-gray-700'>
                            <tr>
                                <th className='border p-2'>#</th>
                                <th className='border p-2'>Foto</th>
                                <th className='border p-2'>ID PDP</th>
                                <th className='border p-2'>No Simental</th>
                                <th className='border p-2'>No Piagam</th>
                                <th className='border p-2'>Nama Lengkap</th>
                                <th className='border p-2'>Jenis Kelamin</th>
                                <th className='border p-2'>Kelahiran</th>
                                <th className='border p-2'>Alamat Domisili</th>
                                <th className='border p-2'>Email</th>
                                <th className='border p-2'>Telepon</th>
                                <th className='border p-2'>Posisi</th>
                                <th className='border p-2'>Penugasan</th>
                                <th className='border p-2'>Tahun</th>
                                <th className='border p-2'>Status</th>
                                <th className='border p-2'>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pdp && pdp.data.length > 0 ? (
                                pdp.data.map((item, index) => (
                                    <tr key={item.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                                        <td className='border p-2 text-center'>{pdp.from + index}</td>
                                        <td className='border text-center'>
                                            {item.photo ? (
                                                <Image
                                                    src={`${BaseUrl + item.photo.replace("/uploads", "uploads")}`}
                                                    alt={item.nama_lengkap}
                                                    width={80}
                                                    height={120}
                                                    className='max-w-20 mx-auto p-0'
                                                />
                                            ) : (
                                                <img
                                                    src={`/assets/images/logo-dppi.png`}
                                                    alt="Default"
                                                    className='max-w-20 mx-auto p-0'
                                                />
                                            )}
                                        </td>
                                        <td className='border p-2 text-center'>{item.id}</td>
                                        <td className='border p-2'>{item.no_simental || '-'}</td>
                                        <td className='border p-2'>{item.no_piagam || '-'}</td>
                                        <td className='border p-2 font-medium'>{item.nama_lengkap}</td>
                                        <td className='border p-2 text-center'>{item.jk || '-'}</td>
                                        <td className='border p-2'>
                                            {item.tempat_lahir || ''}{item.tempat_lahir && item.tgl_lahir ? ', ' : ''}
                                            {item.tgl_lahir && item.tgl_lahir !== '0000-00-00' ? FormatLongDate(item.tgl_lahir) : ''}
                                        </td>
                                        <td className='border p-2 text-sm'>
                                            <div className='space-y-1'>
                                                <div>{item.alamat}</div>
                                                {item.kabupaten_domisili && (
                                                    <div>{item.kabupaten_domisili}</div>
                                                )}
                                                {item.provinsi_domisili && (
                                                    <div>Prov. {item.provinsi_domisili}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='border p-2'>{item.email || '-'}</td>
                                        <td className='border p-2'>{item.telepon || '-'}</td>
                                        <td className='border p-2 text-center'>{item.posisi || '-'}</td>
                                        <td className='border p-2 text-sm'>
                                            <div className='space-y-1'>
                                                {item.tingkat_penugasan === "Paskibraka Tingkat Provinsi" ?
                                                    (<div>Paskibraka Tingkat Provinsi {item.provinsi}</div>) : item.tingkat_penugasan === "Paskibraka Tingkat Kabupaten/Kota" ? (
                                                        <><div>Paskibraka Tingkat {item.kabupaten}</div>  <div>Prov. {item.provinsi}</div></>) : ''
                                                }

                                            </div>
                                        </td>
                                        <td className='border p-2 text-center'>{item.thn_tugas || '-'}</td>
                                        <td className='border p-2 text-center'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className='border p-2'>
                                            <div className='flex flex-col gap-1'>
                                                <a
                                                    href={`/userpanel/data-pdp/${item.id}`}
                                                    className='bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-center text-xs'
                                                >
                                                    Lihat
                                                </a>

                                                <button
                                                    className='bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs'
                                                    onClick={() => clickModalStatus(item)}
                                                >
                                                    Update Status
                                                </button>

                                                <a
                                                    href={`/userpanel/data-pdp/${item.id}/edit`}
                                                    className='bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-black text-center text-xs'
                                                >
                                                    Edit
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={16} className='border p-4 text-center text-gray-500'>
                                        PDP Tidak ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pdp && pdp.last_page > 1 && (
                    <div className="p-4 border-t">
                        <Pagination
                            links={generateLinks()}
                            onPageChange={handlePageChange}

                        />
                        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {pdp.from} - {pdp.to} dari {pdp.total_items} PDP
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Update Status */}
            {modalUpdateStatus && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20'>
                    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full'>
                        <div className='flex items-center justify-between p-4 border-b'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                Update Status PDP
                            </h3>
                            <button
                                onClick={() => {
                                    setModalUpdateStatus(false);
                                    setShowRejectionReason(false);
                                    setDataStatus({});
                                }}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            >
                                <i className='fas fa-times text-xl'></i>
                            </button>
                        </div>

                        <form onSubmit={submitUpdateStatus}>
                            <div className='p-4 space-y-4'>
                                <div>
                                    <InputLabel htmlFor='status'>Status:</InputLabel>
                                    <select
                                        name='status'
                                        id='status'
                                        value={dataStatus.status || ''}
                                        onChange={handleOnChange}
                                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                                        required
                                    >
                                        <option value=''>-- Pilih Status --</option>
                                        <option value='Belum Diverifikasi'>Belum Diverifikasi</option>
                                        <option value='Ditolak'>Ditolak</option>
                                        <option value='Verified'>Verified</option>
                                    </select>
                                </div>

                                {/* Form Alasan Penolakan */}
                                {showRejectionReason && (
                                    <div>
                                        <InputLabel htmlFor='keterangan'>
                                            Alasan Penolakan <span className="text-red-500">*</span>:
                                        </InputLabel>
                                        <textarea
                                            name='keterangan'
                                            id='keterangan'
                                            value={dataStatus.keterangan || ''}
                                            onChange={handleOnChange}
                                            rows={4}
                                            placeholder='Masukkan alasan penolakan yang jelas dan informatif...'
                                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Alasan ini akan dikirimkan via email ke PDP.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-between p-4 border-t'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setModalUpdateStatus(false);
                                        setShowRejectionReason(false);
                                        setDataStatus({});
                                    }}
                                    className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                >
                                    Batal
                                </button>
                                <button
                                    type='submit'
                                    className={`px-4 py-2 text-white rounded-md ${dataStatus.status === 'Ditolak'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : dataStatus.status === 'Verified'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* delete Modal */}
            <div id='deleteModal' className='justify-center fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='fixed z-30 w-full justify-center max-w-125 mx-auto md:top-12 lg:top-40 top-14'>
                    <div className='w-full mx-auto bg-gray-100 border-2 border-red-200 rounded-md shadow-md dark:bg-default'>
                        <div className='flex flex-col px-4 py-2 rounded-t border-b dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-accent'>Hapus Data</span>
                                <button type='button' onClick={closeDelete} className='text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                        </div>
                        <div className='mt-4 px-4'>
                            <span className='dark:text-white'>Anda yakin ingin menghapus </span>
                            <span className='dark:text-white font-semibold'>{deleteName}</span>
                            <span className='dark:text-white'>?</span>
                        </div>
                        <div className='mt-2 border-b dark:border-gray-600'></div>
                        <div className='px-4 mb-4'>
                            <form onSubmit={deleteSubmit}>
                                <div className='flex flex-row justify-between'>
                                    <button type='button' onClick={closeDelete} className='py-1 px-4 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Batal
                                    </button>
                                    <button type='submit' className='px-4 py-1 mt-2 text-white rounded-md bg-accent'>
                                        Hapus
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default PdpVerified;