// app/adminpanel/profiling/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Pagination from '@/app/components/UserPagination';
import * as XLSX from 'xlsx-js-style';

// Update Candidate interface sesuai dengan data_capaska
interface Candidate {
    id: number;
    nama_lengkap: string | null;
    photo: string | null;
    jk: string | null;
    no_peserta: string | null;
    no_hp: string | null;
    tanggal_lahir: string | null;
    tempat_lahir: string | null;
    provinsi: string | null;
    kabupaten_kota: string | null;
    asal_sekolah: string | null;
    status: string | null;
    id_pamong: string | null;
}

// Daily Pamong interface - semua field bisa null
interface DailyPamong {
    tanggal: string;
    nilai_ketaqwaan: number | null;
    nilai_niat_kemauan: number | null;
    nilai_keberanian: number | null;
    nilai_komunikasi: number | null;
    nilai_keterbukaan: number | null;
    nilai_ketelitian: number | null;
    nilai_kesadaran: number | null;
    nilai_toleransi: number | null;
    nilai_keikhlasan: number | null;
    nilai_mempercayai: number | null;
    nilai_jiwa_korsa: number | null;
    nilai_kekeluargaan: number | null;
    nilai_persatuan_kesatuan: number | null;
    nilai_ketahanan: number | null;
    nilai_kekompakan_keseragaman: number | null;
    nilai_ketertiban: number | null;
    nilai_kesopanan: number | null;
    nilai_kesigapan: number | null;
    nilai_kewajaran: number | null;
    nilai_ketanggapan: number | null;
    nilai_ketenangan: number | null;
    nilai_menyimak: number | null;
    nilai_kebiasaan: number | null;
    nilai_mengelola_stres: number | null;
    nilai_menghargai_waktu: number | null;
    nilai_berbicara: number | null;
    nilai_berjalan: number | null;
    nilai_makan_minum: number | null;
    nilai_kehadiran: number | null;
    nilai_hubungan_interpersonal: number | null;
    nilai_ketaatan: number | null;
    nilai_istirahat_malam: number | null;
    nilai_keindahan: number | null;
    nilai_kerapihan: number | null;
    nilai_kebersihan: number | null;
    nilai_berpakaian: number | null;
    nilai_penampilan_rambut: number | null;
    nilai_bersih_rapih_wangi: number | null;
    catatan: string | null;
}

interface DailyPelatih {
    tanggal: string;
    nilai_aba_aba: number | null;
    nilai_berhimpun: number | null;
    nilai_berkumpul: number | null;
    nilai_keluar_masuk_barisan: number | null;
    nilai_hormat: number | null;
    nilai_sikap_sempurna: number | null;
    nilai_istirahat: number | null;
    nilai_periksa_kerapihan: number | null;
    nilai_berhitung: number | null;
    nilai_lepas_kenakan_topi: number | null;
    nilai_bubar: number | null;
    nilai_lencang_depan: number | null;
    nilai_lencang_kanan_kiri: number | null;
    nilai_setengah_lengan_lencang_kanan_kiri: number | null;
    nilai_hadap_kanan_kiri: number | null;
    nilai_hadap_serong_kanan_kiri: number | null;
    nilai_balik_kanan: number | null;
    nilai_langkah_bisa: number | null;
    nilai_langkah_tegap: number | null;
    nilai_sikap_awal_berlari: number | null;
    nilai_jalan_di_tempat: number | null;
    nilai_4_langkah_ke_depan: number | null;
    nilai_4_langkah_ke_kanan: number | null;
    nilai_4_langkah_ke_kiri: number | null;
    nilai_4_langkah_ke_belakang: number | null;
    nilai_lipat_bendera: number | null;
    nilai_bentang_bendera: number | null;
    nilai_10_tahap_penurunan: number | null;
    nilai_jadi_kibra_pembentang: number | null;
    nilai_jadi_kibra_pembawa: number | null;
    nilai_jadi_kibra_pengerek: number | null;
    catatan: string | null;
}

interface DailyDokter {
    tanggal: string;
    tensi: string | null;
    suhu: string | null;
    keluhan: string | null;
    diagnosa: string | null;
    terapi_obat: string | null;
    rekomendasi_istirahat: string | null;
}

interface JournalDetails {
    profile: Candidate;
    pemusatan: {
        pamong: DailyPamong[];
        pelatih: DailyPelatih[];
        dokter: DailyDokter[];
    };
}

// Field definitions
const sikapFields = [
    { key: 'nilai_ketaqwaan', label: '1. Ketaqwaan' },
    { key: 'nilai_niat_kemauan', label: '2. Niat / Kemauan' },
    { key: 'nilai_keberanian', label: '3. Keberanian' },
    { key: 'nilai_komunikasi', label: '4. Komunikasi' },
    { key: 'nilai_keterbukaan', label: '5. Keterbukaan' },
    { key: 'nilai_ketelitian', label: '6. Ketelitian' },
    { key: 'nilai_kesadaran', label: '7. Kesadaran' },
    { key: 'nilai_toleransi', label: '8. Toleransi' },
    { key: 'nilai_keikhlasan', label: '9. Keikhlasan' },
    { key: 'nilai_mempercayai', label: '10. Mempercayai' },
    { key: 'nilai_jiwa_korsa', label: '11. Jiwa Korsa' },
    { key: 'nilai_kekeluargaan', label: '12. Kekeluargaan' },
    { key: 'nilai_persatuan_kesatuan', label: '13. Persatuan Kesatuan' },
    { key: 'nilai_ketahanan', label: '14. Ketahanan' },
    { key: 'nilai_kekompakan_keseragaman', label: '15. Kekompakan / Keseragaman' },
    { key: 'nilai_ketertiban', label: '16. Ketertiban' },
    { key: 'nilai_kesopanan', label: '17. Kesopanan' },
    { key: 'nilai_kesigapan', label: '18. Kesigapan' },
    { key: 'nilai_kewajaran', label: '19. Kewajaran' },
    { key: 'nilai_ketanggapan', label: '20. Ketanggapan' },
    { key: 'nilai_ketenangan', label: '21. Ketenangan' },
    { key: 'nilai_menyimak', label: '22. Menyimak' },
    { key: 'nilai_kebiasaan', label: '23. Kebiasaan' },
    { key: 'nilai_mengelola_stres', label: '24. Mengelola Stres' },
    { key: 'nilai_menghargai_waktu', label: '25. Menghargai Waktu' },
    { key: 'nilai_berbicara', label: '26. Berbicara' },
    { key: 'nilai_berjalan', label: '27. Berjalan' },
    { key: 'nilai_makan_minum', label: '28. Makan / Minum' },
    { key: 'nilai_kehadiran', label: '29. Kehadiran' },
    { key: 'nilai_hubungan_interpersonal', label: '30. Hubungan Inter Personal' },
    { key: 'nilai_ketaatan', label: '31. Ketaatan' },
];

const penampilanFields = [
    { key: 'nilai_istirahat_malam', label: '1. Istirahat Malam' },
    { key: 'nilai_keindahan', label: '2. Keindahan' },
    { key: 'nilai_kerapihan', label: '3. Kerapihan' },
    { key: 'nilai_kebersihan', label: '4. Kebersihan' },
    { key: 'nilai_berpakaian', label: '5. Berpakaian' },
    { key: 'nilai_penampilan_rambut', label: '6. Penampilan Rambut' },
    { key: 'nilai_bersih_rapih_wangi', label: '7. Bersih, Rapih, Wangi' },
];

const pbbSikapDiamFields = [
    { key: 'nilai_aba_aba', label: '1. Aba-Aba' },
    { key: 'nilai_berhimpun', label: '2. Berhimpun' },
    { key: 'nilai_berkumpul', label: '3. Berkumpul' },
    { key: 'nilai_keluar_masuk_barisan', label: '4. Keluar Masuk Barisan' },
    { key: 'nilai_hormat', label: '5. Hormat' },
    { key: 'nilai_sikap_sempurna', label: '6. Sikap Sempurna' },
    { key: 'nilai_istirahat', label: '7. Istirahat' },
    { key: 'nilai_periksa_kerapihan', label: '8. Periksa Kerapihan' },
    { key: 'nilai_berhitung', label: '9. Berhitung' },
    { key: 'nilai_lepas_kenakan_topi', label: '10. Lepas Kenakan Topi' },
    { key: 'nilai_bubar', label: '11. Bubar' },
    { key: 'nilai_lencang_depan', label: '12. Lencang Depan' },
    { key: 'nilai_lencang_kanan_kiri', label: '13. Lencang Kanan/Kiri' },
    { key: 'nilai_setengah_lengan_lencang_kanan_kiri', label: '14. 1/2 Lengan Lencang Ka/Ki' },
    { key: 'nilai_hadap_kanan_kiri', label: '15. Hadap Kanan/Kiri' },
    { key: 'nilai_hadap_serong_kanan_kiri', label: '16. Hadap Serong Kanan/Kiri' },
    { key: 'nilai_balik_kanan', label: '17. Balik Kanan' },
    { key: 'nilai_langkah_bisa', label: '18. Langkah Bisa' },
    { key: 'nilai_langkah_tegap', label: '19. Langkah Tegap' },
    { key: 'nilai_sikap_awal_berlari', label: '20. Sikap Awal Berlari' },
    { key: 'nilai_jalan_di_tempat', label: '21. Jalan Di Tempat' },
    { key: 'nilai_4_langkah_ke_depan', label: '22. 4 Langkah Ke Depan' },
    { key: 'nilai_4_langkah_ke_kanan', label: '23. 4 Langkah Ke Kanan' },
    { key: 'nilai_4_langkah_ke_kiri', label: '24. 4 Langkah Ke Kiri' },
    { key: 'nilai_4_langkah_ke_belakang', label: '25. 4 Langkah Ke Belakang' },
];

const benderaFields = [
    { key: 'nilai_lipat_bendera', label: '1. Lipat Bendera' },
    { key: 'nilai_bentang_bendera', label: '2. Bentang Bendera' },
    { key: 'nilai_10_tahap_penurunan', label: '3. 10 Tahap Penurunan' },
    { key: 'nilai_jadi_kibra_pembentang', label: '4. Jadi Kibra;Pembentang' },
    { key: 'nilai_jadi_kibra_pembawa', label: '5. Jadi Kibra;Pembawa' },
    { key: 'nilai_jadi_kibra_pengerek', label: '6. Jadi Kibra;Pengerek' },
];

export default function ProfilingPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    
    // Detailed Profile view
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [details, setDetails] = useState<JournalDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pamong' | 'pelatih' | 'dokter'>('pamong');
    
interface BestCriterionResult {
    key: string;
    label: string;
    category: 'sikap' | 'penampilan';
    bestScore: number;
    candidateName: string;
    noPeserta: string;
    provinsi: string;
    sekolah: string;
    photo: string | null;
}

    // Detail modal states
    const [selectedPamongLog, setSelectedPamongLog] = useState<DailyPamong | null>(null);
    const [selectedPelatihLog, setSelectedPelatihLog] = useState<DailyPelatih | null>(null);

    // Best Performer Modal states
    const [showBestModal, setShowBestModal] = useState(false);
    const [bestModalTab, setBestModalTab] = useState<'sikap' | 'penampilan'>('sikap');
    const [bestSikapList, setBestSikapList] = useState<BestCriterionResult[]>([]);
    const [bestPenampilanList, setBestPenampilanList] = useState<BestCriterionResult[]>([]);
    const [bestLoading, setBestLoading] = useState(false);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch(`${UrlApi}/pemusatan/candidates`, {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Gagal memuat daftar peserta');
                const data = await res.json();
                setCandidates(data);
            } catch (err: any) {
                Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const fetchJournalDetails = async (id: number) => {
        setDetailLoading(true);
        setSelectedId(id);
        setDetails(null);
        try {
            const res = await fetch(`${UrlApi}/pemusatan/jurnal/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat detail jurnal profiling');
            const data = await res.json();
            setDetails(data);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
            setSelectedId(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredCandidates = candidates.filter((c) =>
        c.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, limit]);

    const totalPages = Math.ceil(filteredCandidates.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + limit);

    const getRecommendationColor = (rec: string | null) => {
        if (!rec) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        if (rec === 'Bisa Latihan') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        if (rec === 'Latihan Ringan') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    };

    // Calculate Pamong averages - handle null values
    const getSikapAvg = (p: DailyPamong) => {
        const values = sikapFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return '0.00';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(2);
    };

    const getPenampilanAvg = (p: DailyPamong) => {
        const values = penampilanFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return '0.00';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(2);
    };

    const getSikapSum = (p: DailyPamong) => {
        const values = sikapFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return 0;
        return values.reduce((acc, val) => acc + val, 0);
    };

    const getPenampilanSum = (p: DailyPamong) => {
        const values = penampilanFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return 0;
        return values.reduce((acc, val) => acc + val, 0);
    };

    const getPamongNilaiKeseluruhan = (p: DailyPamong) => {
        const sAvg = parseFloat(getSikapAvg(p));
        const pAvg = parseFloat(getPenampilanAvg(p));
        return (sAvg + pAvg).toFixed(2);
    };

    // Calculate Pelatih averages
    const getPbbSikapDiamAvg = (p: DailyPelatih) => {
        const values = pbbSikapDiamFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return '0';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
    };

    const getBenderaAvg = (p: DailyPelatih) => {
        const values = benderaFields.map(f => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) return '0';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
    };

    const getScoreColor = (score: number | null | undefined) => {
        if (score === null || score === undefined) return 'text-gray-400';
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-450';
        if (score >= 60) return 'text-amber-600 dark:text-amber-450';
        return 'text-rose-600 dark:text-rose-455';
    };

    const getCandidatePhotoUrl = (photoPath: string | null | undefined) => {
        if (!photoPath) return '/assets/images/logo-dppi-kecil.png';
        if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath;
        
        const domain = UrlApi.replace(/\/api\/?$/, '');
        const cleanPath = photoPath.replace(/^\//, '');

        if (cleanPath.startsWith('uploads/')) {
            return `${domain}/${cleanPath}`;
        }
        return `${domain}/uploads/capaska/${cleanPath}`;
    };
    // Helper to download Excel Blob
    const downloadExcelWorkbook = (wb: XLSX.WorkBook, filename: string) => {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 1. Export Roster Candidates List
    const exportRosterToExcel = () => {
        const dataToExport = filteredCandidates.map((c, idx) => ({
            'No': idx + 1,
            'No. Peserta': c.no_peserta || '-',
            'Nama Lengkap': c.nama_lengkap || '-',
            'Jenis Kelamin': c.jk === 'L' ? 'Putra' : c.jk === 'P' ? 'Putri' : c.jk || '-',
            'Provinsi': c.provinsi || '-',
            'Kabupaten/Kota': c.kabupaten_kota || '-',
            'Asal Sekolah': c.asal_sekolah || '-',
            'No. HP': c.no_hp || '-',
            'Status': c.status || 'Aktif',
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        ws['!cols'] = [
            { wch: 6 },
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
            { wch: 25 },
            { wch: 25 },
            { wch: 30 },
            { wch: 18 },
            { wch: 15 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Roster Peserta');
        downloadExcelWorkbook(wb, `Roster_Profiling_Paskibraka_2026_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // 2. Export Single Candidate's Complete Journal (4 Sheets)
    const exportSingleCandidateJournal = (cand: Candidate, det: JournalDetails) => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Profil Peserta
        const profileRows = [
            ['INFORMASI PROFIL PESERTA PASKIBRAKA 2026', ''],
            ['Nama Lengkap', cand.nama_lengkap || '-'],
            ['No. Peserta', cand.no_peserta || '-'],
            ['Jenis Kelamin', cand.jk === 'L' ? 'Putra' : cand.jk === 'P' ? 'Putri' : cand.jk || '-'],
            ['Tempat, Tgl Lahir', `${cand.tempat_lahir || '-'}, ${cand.tanggal_lahir || '-'}`],
            ['Provinsi', cand.provinsi || '-'],
            ['Kabupaten/Kota', cand.kabupaten_kota || '-'],
            ['Asal Sekolah', cand.asal_sekolah || '-'],
            ['No. HP', cand.no_hp || '-'],
            ['Status', cand.status || 'Aktif']
        ];
        const wsProfile = XLSX.utils.aoa_to_sheet(profileRows);
        wsProfile['!cols'] = [{ wch: 25 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, wsProfile, 'Profil Peserta');

        // Sheet 2: Jurnal Pamong
        const pamongHeaders = [
            'Tanggal', 'Rerata Sikap', 'Rerata Penampilan', 'Nilai Keseluruhan', 'Catatan Pamong',
            ...sikapFields.map(f => f.label),
            ...penampilanFields.map(f => f.label)
        ];
        const pamongRows = (det.pemusatan?.pamong || []).map(p => [
            p.tanggal,
            getSikapAvg(p),
            getPenampilanAvg(p),
            getPamongNilaiKeseluruhan(p),
            p.catatan || '-',
            ...sikapFields.map(f => (p as any)[f.key] ?? '-'),
            ...penampilanFields.map(f => (p as any)[f.key] ?? '-')
        ]);
        const wsPamong = XLSX.utils.aoa_to_sheet([pamongHeaders, ...pamongRows]);
        XLSX.utils.book_append_sheet(wb, wsPamong, 'Jurnal Pamong');

        // Sheet 3: Jurnal Pelatih
        const pelatihHeaders = [
            'Tanggal', 'Rerata PBB / Sikap Diam', 'Rerata Bendera', 'Catatan Pelatih',
            ...pbbSikapDiamFields.map(f => f.label),
            ...benderaFields.map(f => f.label)
        ];
        const pelatihRows = (det.pemusatan?.pelatih || []).map(p => [
            p.tanggal,
            getPbbSikapDiamAvg(p),
            getBenderaAvg(p),
            p.catatan || '-',
            ...pbbSikapDiamFields.map(f => (p as any)[f.key] ?? '-'),
            ...benderaFields.map(f => (p as any)[f.key] ?? '-')
        ]);
        const wsPelatih = XLSX.utils.aoa_to_sheet([pelatihHeaders, ...pelatihRows]);
        XLSX.utils.book_append_sheet(wb, wsPelatih, 'Jurnal Pelatih');

        // Sheet 4: Jurnal Dokter
        const dokterHeaders = ['Tanggal', 'Tensi', 'Suhu (°C)', 'Keluhan', 'Diagnosa', 'Terapi Obat', 'Rekomendasi Istirahat'];
        const dokterRows = (det.pemusatan?.dokter || []).map(d => [
            d.tanggal,
            d.tensi || '-',
            d.suhu || '-',
            d.keluhan || '-',
            d.diagnosa || '-',
            d.terapi_obat || '-',
            d.rekomendasi_istirahat || '-'
        ]);
        const wsDokter = XLSX.utils.aoa_to_sheet([dokterHeaders, ...dokterRows]);
        XLSX.utils.book_append_sheet(wb, wsDokter, 'Jurnal Kesehatan Dokter');

        const cleanName = (cand.nama_lengkap || 'Peserta').replace(/[^a-zA-Z0-9_-]/g, '_');
        downloadExcelWorkbook(wb, `Jurnal_Profiling_${cleanName}_${cand.no_peserta || 'ID'}.xlsx`);
    };

    // 3. Download single candidate from table row button
    const handleDownloadCandidateJournalById = async (cand: Candidate) => {
        try {
            Swal.fire({
                title: 'Menyiapkan File Excel',
                text: `Mengunduh jurnal profiling untuk ${cand.nama_lengkap}...`,
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            const res = await fetch(`${UrlApi}/pemusatan/jurnal/${cand.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Gagal memuat detail jurnal peserta');
            const data = await res.json();
            exportSingleCandidateJournal(cand, data);
            Swal.close();
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal mengunduh Excel', 'error');
        }
    };

    // 4. Export Master Excel (All Candidates)
    const exportAllJournalsToExcel = async () => {
        try {
            Swal.fire({
                title: 'Menyiapkan Rekap Excel',
                text: 'Mohon tunggu, sedang mengompilasi jurnal harian seluruh peserta...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const wb = XLSX.utils.book_new();

            // 1. Roster Sheet
            const rosterData = candidates.map((c, idx) => ({
                'No': idx + 1,
                'No. Peserta': c.no_peserta || '-',
                'Nama Lengkap': c.nama_lengkap || '-',
                'Jenis Kelamin': c.jk === 'L' ? 'Putra' : c.jk === 'P' ? 'Putri' : c.jk || '-',
                'Provinsi': c.provinsi || '-',
                'Kabupaten/Kota': c.kabupaten_kota || '-',
                'Asal Sekolah': c.asal_sekolah || '-',
                'No. HP': c.no_hp || '-',
                'Status': c.status || 'Aktif',
            }));
            const wsRoster = XLSX.utils.json_to_sheet(rosterData);
            XLSX.utils.book_append_sheet(wb, wsRoster, 'Roster Peserta');

            const detailPromises = candidates.map(c =>
                fetch(`${UrlApi}/pemusatan/jurnal/${c.id}`, { credentials: 'include' })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            );

            const results = await Promise.all(detailPromises);

            const pamongMasterRows: any[] = [];
            const pelatihMasterRows: any[] = [];
            const dokterMasterRows: any[] = [];

            results.forEach((det: JournalDetails | null, idx) => {
                const cand = candidates[idx];
                if (!det) return;

                (det.pemusatan?.pamong || []).forEach(p => {
                    pamongMasterRows.push([
                        cand.no_peserta || '-',
                        cand.nama_lengkap || '-',
                        cand.provinsi || '-',
                        p.tanggal,
                        getSikapAvg(p),
                        getPenampilanAvg(p),
                        getPamongNilaiKeseluruhan(p),
                        p.catatan || '-',
                        ...sikapFields.map(f => (p as any)[f.key] ?? '-'),
                        ...penampilanFields.map(f => (p as any)[f.key] ?? '-')
                    ]);
                });

                (det.pemusatan?.pelatih || []).forEach(p => {
                    pelatihMasterRows.push([
                        cand.no_peserta || '-',
                        cand.nama_lengkap || '-',
                        cand.provinsi || '-',
                        p.tanggal,
                        getPbbSikapDiamAvg(p),
                        getBenderaAvg(p),
                        p.catatan || '-',
                        ...pbbSikapDiamFields.map(f => (p as any)[f.key] ?? '-'),
                        ...benderaFields.map(f => (p as any)[f.key] ?? '-')
                    ]);
                });

                (det.pemusatan?.dokter || []).forEach(d => {
                    dokterMasterRows.push([
                        cand.no_peserta || '-',
                        cand.nama_lengkap || '-',
                        cand.provinsi || '-',
                        d.tanggal,
                        d.tensi || '-',
                        d.suhu || '-',
                        d.keluhan || '-',
                        d.diagnosa || '-',
                        d.terapi_obat || '-',
                        d.rekomendasi_istirahat || '-'
                    ]);
                });
            });

            // 2. Master Pamong Sheet
            const pamongHeaders = [
                'No Peserta', 'Nama Lengkap', 'Provinsi', 'Tanggal', 'Rerata Sikap', 'Rerata Penampilan', 'Nilai Keseluruhan', 'Catatan Pamong',
                ...sikapFields.map(f => f.label),
                ...penampilanFields.map(f => f.label)
            ];
            const wsPamong = XLSX.utils.aoa_to_sheet([pamongHeaders, ...pamongMasterRows]);
            XLSX.utils.book_append_sheet(wb, wsPamong, 'Rekap Jurnal Pamong');

            // 3. Master Pelatih Sheet
            const pelatihHeaders = [
                'No Peserta', 'Nama Lengkap', 'Provinsi', 'Tanggal', 'Rerata PBB', 'Rerata Bendera', 'Catatan Pelatih',
                ...pbbSikapDiamFields.map(f => f.label),
                ...benderaFields.map(f => f.label)
            ];
            const wsPelatih = XLSX.utils.aoa_to_sheet([pelatihHeaders, ...pelatihMasterRows]);
            XLSX.utils.book_append_sheet(wb, wsPelatih, 'Rekap Jurnal Pelatih');

            // 4. Master Dokter Sheet
            const dokterHeaders = ['No Peserta', 'Nama Lengkap', 'Provinsi', 'Tanggal', 'Tensi', 'Suhu (°C)', 'Keluhan', 'Diagnosa', 'Terapi Obat', 'Rekomendasi Istirahat'];
            const wsDokter = XLSX.utils.aoa_to_sheet([dokterHeaders, ...dokterMasterRows]);
            XLSX.utils.book_append_sheet(wb, wsDokter, 'Rekap Jurnal Dokter');

            downloadExcelWorkbook(wb, `Rekap_Lengkap_Jurnal_Profiling_Paskibraka_2026_${new Date().toISOString().split('T')[0]}.xlsx`);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil Export',
                text: 'File Excel Rekap Jurnal Profiling berhasil diunduh.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal export data Excel', 'error');
        }
    };

    // 5. Export Overall Averages Summary per Candidate
    const exportOverallAveragesToExcel = async () => {
        try {
            Swal.fire({
                title: 'Menyiapkan Export Rata-Rata',
                text: 'Mohon tunggu, sedang menghitung nilai rata-rata keseluruhan peserta...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            // Fetch detail journal for all candidates
            const detailPromises = candidates.map(c =>
                fetch(`${UrlApi}/pemusatan/jurnal/${c.id}`, { credentials: 'include' })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            );

            const results = await Promise.all(detailPromises);

            const rows = candidates.map((cand, idx) => {
                const det: JournalDetails | null = results[idx];
                const pamongLogs: DailyPamong[] = det?.pemusatan?.pamong || [];
                const pelatihLogs: DailyPelatih[] = det?.pemusatan?.pelatih || [];
                const dokterLogs: DailyDokter[] = det?.pemusatan?.dokter || [];

                // Pamong calculations
                let avgSikapPamong = 0;
                let avgPenampilanPamong = 0;
                let totalPamongScore = 0;
                if (pamongLogs.length > 0) {
                    const sumSikap = pamongLogs.reduce((acc, p) => acc + parseFloat(getSikapAvg(p)), 0);
                    const sumPenampilan = pamongLogs.reduce((acc, p) => acc + parseFloat(getPenampilanAvg(p)), 0);
                    const sumTotal = pamongLogs.reduce((acc, p) => acc + parseFloat(getPamongNilaiKeseluruhan(p)), 0);

                    avgSikapPamong = sumSikap / pamongLogs.length;
                    avgPenampilanPamong = sumPenampilan / pamongLogs.length;
                    totalPamongScore = sumTotal / pamongLogs.length;
                }

                // Pelatih calculations
                let avgPbbPelatih = 0;
                let avgBenderaPelatih = 0;
                let totalPelatihScore = 0;
                if (pelatihLogs.length > 0) {
                    const sumPbb = pelatihLogs.reduce((acc, p) => acc + parseFloat(getPbbSikapDiamAvg(p)), 0);
                    const sumBendera = pelatihLogs.reduce((acc, p) => acc + parseFloat(getBenderaAvg(p)), 0);

                    avgPbbPelatih = sumPbb / pelatihLogs.length;
                    avgBenderaPelatih = sumBendera / pelatihLogs.length;
                    totalPelatihScore = (avgPbbPelatih + avgBenderaPelatih) / 2;
                }

                // Dokter summary
                const lastDokter = dokterLogs.length > 0 ? dokterLogs[dokterLogs.length - 1] : null;
                const rekomDokter = lastDokter?.rekomendasi_istirahat || 'Normal / Bisa Latihan';

                // Combined Final Average
                let finalCombinedScore = 0;
                if (totalPamongScore > 0 && totalPelatihScore > 0) {
                    finalCombinedScore = (totalPamongScore + totalPelatihScore) / 2;
                } else if (totalPamongScore > 0) {
                    finalCombinedScore = totalPamongScore;
                } else if (totalPelatihScore > 0) {
                    finalCombinedScore = totalPelatihScore;
                }

                let kategori = 'Belum Ada Penilaian';
                if (finalCombinedScore >= 85) kategori = 'Sangat Baik';
                else if (finalCombinedScore >= 75) kategori = 'Baik';
                else if (finalCombinedScore >= 65) kategori = 'Cukup';
                else if (finalCombinedScore > 0) kategori = 'Perlu Perhatian';

                return {
                    'No': idx + 1,
                    'No. Peserta': cand.no_peserta || '-',
                    'Nama Lengkap': cand.nama_lengkap || '-',
                    'Jenis Kelamin': cand.jk === 'L' ? 'Putra' : cand.jk === 'P' ? 'Putri' : cand.jk || '-',
                    'Provinsi': cand.provinsi || '-',
                    'Kabupaten/Kota': cand.kabupaten_kota || '-',
                    'Asal Sekolah': cand.asal_sekolah || '-',
                    'Jml Hari Pamong': pamongLogs.length,
                    'Rata-rata Sikap (Pamong)': avgSikapPamong > 0 ? avgSikapPamong.toFixed(2) : '-',
                    'Rata-rata Penampilan (Pamong)': avgPenampilanPamong > 0 ? avgPenampilanPamong.toFixed(2) : '-',
                    'Total Rata-rata Pamong': totalPamongScore > 0 ? totalPamongScore.toFixed(2) : '-',
                    'Jml Hari Pelatih': pelatihLogs.length,
                    'Rata-rata PBB (Pelatih)': avgPbbPelatih > 0 ? avgPbbPelatih.toFixed(2) : '-',
                    'Rata-rata Bendera (Pelatih)': avgBenderaPelatih > 0 ? avgBenderaPelatih.toFixed(2) : '-',
                    'Total Rata-rata Pelatih': totalPelatihScore > 0 ? totalPelatihScore.toFixed(2) : '-',
                    'Jml Cek Dokter': dokterLogs.length,
                    'Rekomendasi Dokter Terakhir': rekomDokter,
                    'RATA-RATA GABUNGAN AKHIR': finalCombinedScore > 0 ? finalCombinedScore.toFixed(2) : '-',
                    'KATEGORI HASIL': kategori
                };
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [
                { wch: 6 },  // No
                { wch: 15 }, // No Peserta
                { wch: 30 }, // Nama Lengkap
                { wch: 15 }, // JK
                { wch: 25 }, // Provinsi
                { wch: 25 }, // Kab/Kota
                { wch: 30 }, // Asal Sekolah
                { wch: 16 }, // Jml Hari Pamong
                { wch: 22 }, // Rerata Sikap
                { wch: 26 }, // Rerata Penampilan
                { wch: 22 }, // Rerata Total Pamong
                { wch: 16 }, // Jml Hari Pelatih
                { wch: 22 }, // Rerata PBB
                { wch: 24 }, // Rerata Bendera
                { wch: 22 }, // Rerata Total Pelatih
                { wch: 16 }, // Jml Cek Dokter
                { wch: 28 }, // Rekomendasi Dokter
                { wch: 26 }, // RERATA GABUNGAN AKHIR
                { wch: 20 }, // KATEGORI HASIL
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Rata-Rata Keseluruhan');

            downloadExcelWorkbook(wb, `Rekap_Nilai_RataRata_Keseluruhan_Capaska_2026_${new Date().toISOString().split('T')[0]}.xlsx`);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil Export',
                text: 'File Excel Nilai Rata-rata Keseluruhan berhasil diunduh.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal export data Excel', 'error');
        }
    };

    // 6. Calculate Best Performers for each Sikap (31) and Penampilan (7) criterion
    const calculateBestCriteria = async () => {
        const detailPromises = candidates.map(c =>
            fetch(`${UrlApi}/pemusatan/jurnal/${c.id}`, { credentials: 'include' })
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        );

        const results: (JournalDetails | null)[] = await Promise.all(detailPromises);

        const sikapResults: BestCriterionResult[] = sikapFields.map(f => {
            let bestScore = -1;
            let bestCand: any = null;

            candidates.forEach((cand, idx) => {
                const det = results[idx];
                const logs: DailyPamong[] = det?.pemusatan?.pamong || [];
                if (logs.length === 0) return;

                const values = logs.map(p => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
                if (values.length === 0) return;

                const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
                if (avg > bestScore) {
                    bestScore = avg;
                    bestCand = cand;
                }
            });

            return {
                key: f.key,
                label: f.label,
                category: 'sikap',
                bestScore: bestScore > 0 ? parseFloat(bestScore.toFixed(2)) : 0,
                candidateName: bestCand?.nama_lengkap || 'Belum Ada Data',
                noPeserta: bestCand?.no_peserta || '-',
                provinsi: bestCand?.provinsi || '-',
                sekolah: bestCand?.asal_sekolah || '-',
                photo: bestCand?.photo || null,
            };
        });

        const penampilanResults: BestCriterionResult[] = penampilanFields.map(f => {
            let bestScore = -1;
            let bestCand: any = null;

            candidates.forEach((cand, idx) => {
                const det = results[idx];
                const logs: DailyPamong[] = det?.pemusatan?.pamong || [];
                if (logs.length === 0) return;

                const values = logs.map(p => (p as any)[f.key]).filter((v): v is number => v !== null && v !== undefined);
                if (values.length === 0) return;

                const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
                if (avg > bestScore) {
                    bestScore = avg;
                    bestCand = cand;
                }
            });

            return {
                key: f.key,
                label: f.label,
                category: 'penampilan',
                bestScore: bestScore > 0 ? parseFloat(bestScore.toFixed(2)) : 0,
                candidateName: bestCand?.nama_lengkap || 'Belum Ada Data',
                noPeserta: bestCand?.no_peserta || '-',
                provinsi: bestCand?.provinsi || '-',
                sekolah: bestCand?.asal_sekolah || '-',
                photo: bestCand?.photo || null,
            };
        });

        return { sikapResults, penampilanResults };
    };

    // 7. Open Best Criteria Modal
    const openBestModal = async () => {
        setShowBestModal(true);
        setBestLoading(true);
        try {
            const { sikapResults, penampilanResults } = await calculateBestCriteria();
            setBestSikapList(sikapResults);
            setBestPenampilanList(penampilanResults);
        } catch (err: any) {
            console.error(err);
        } finally {
            setBestLoading(false);
        }
    };

    // 8. Export Excel Best Criteria
    const exportBestCriteriaToExcel = async () => {
        try {
            Swal.fire({
                title: 'Menyiapkan Export Nilai Terbaik',
                text: 'Mohon tunggu, sedang menghitung peserta terbaik di setiap kriteria...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const { sikapResults, penampilanResults } = await calculateBestCriteria();

            const wb = XLSX.utils.book_new();

            // Sheet 1: Nilai Terbaik Sikap (31)
            const sikapRows = sikapResults.map((r, idx) => ({
                'No': idx + 1,
                'Kriteria Sikap': r.label,
                'Nilai Rerata Tertinggi': r.bestScore > 0 ? r.bestScore : '-',
                'Nama Peserta Terbaik': r.candidateName,
                'No. Peserta': r.noPeserta,
                'Provinsi': r.provinsi,
                'Asal Sekolah': r.sekolah,
            }));
            const wsSikap = XLSX.utils.json_to_sheet(sikapRows);
            wsSikap['!cols'] = [
                { wch: 6 },
                { wch: 32 },
                { wch: 22 },
                { wch: 30 },
                { wch: 15 },
                { wch: 25 },
                { wch: 30 },
            ];
            XLSX.utils.book_append_sheet(wb, wsSikap, 'Nilai Terbaik Sikap (31)');

            // Sheet 2: Nilai Terbaik Penampilan (7)
            const penampilanRows = penampilanResults.map((r, idx) => ({
                'No': idx + 1,
                'Kriteria Penampilan': r.label,
                'Nilai Rerata Tertinggi': r.bestScore > 0 ? r.bestScore : '-',
                'Nama Peserta Terbaik': r.candidateName,
                'No. Peserta': r.noPeserta,
                'Provinsi': r.provinsi,
                'Asal Sekolah': r.sekolah,
            }));
            const wsPenampilan = XLSX.utils.json_to_sheet(penampilanRows);
            wsPenampilan['!cols'] = [
                { wch: 6 },
                { wch: 32 },
                { wch: 22 },
                { wch: 30 },
                { wch: 15 },
                { wch: 25 },
                { wch: 30 },
            ];
            XLSX.utils.book_append_sheet(wb, wsPenampilan, 'Nilai Terbaik Penampilan (7)');

            downloadExcelWorkbook(wb, `Rekap_Nilai_Terbaik_Kriteria_Sikap_Penampilan_2026_${new Date().toISOString().split('T')[0]}.xlsx`);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil Export',
                text: 'File Excel Nilai Terbaik Kriteria berhasil diunduh.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal export Excel Nilai Terbaik', 'error');
        }
    };

    return (
        <div className="mb-36 relative">
            {/* Page Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Profiling Paskibraka 2026</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Kompilasi penilaian jurnal harian Pamong, Pelatih, dan Dokter
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedId === null ? (
                        <>
                            <button
                                onClick={exportRosterToExcel}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                                title="Download Roster Peserta (Excel)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Roster (Excel)
                            </button>
                            <button
                                onClick={exportOverallAveragesToExcel}
                                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                                title="Download Rekap Nilai Rata-Rata Keseluruhan per Peserta (Excel)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Export Nilai Rata-Rata (Excel)
                            </button>
                            <button
                                onClick={openBestModal}
                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                                title="Lihat & Download Nilai Terbaik per Kriteria Sikap & Penampilan"
                            >
                                <span>🏆</span>
                                Nilai Terbaik Kriteria
                            </button>
                            <button
                                onClick={exportAllJournalsToExcel}
                                className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                                title="Download Rekap Jurnal Lengkap Semua Peserta (Excel)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Rekap Jurnal All (Excel)
                            </button>
                        </>
                    ) : (
                        <>
                            {details && (
                                <button
                                    onClick={() => exportSingleCandidateJournal(details.profile, details)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Jurnal Peserta Ini (Excel)
                                </button>
                            )}
                            <button
                                onClick={() => { setSelectedId(null); setDetails(null); }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded text-xs font-bold transition-colors border border-gray-250 dark:border-gray-700 shadow-sm"
                            >
                                Kembali ke Roster
                            </button>
                        </>
                    )}
                </div>
            </div>

            {selectedId === null ? (
                /* ---------------- ROSTER VIEW ---------------- */
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="max-w-md">
                        <input
                            type="text"
                            placeholder="Cari nama peserta Capaska..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    {/* Candidates Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-250 dark:border-gray-750 font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Foto</th>
                                        <th className="px-6 py-4">Nama Lengkap</th>
                                        <th className="px-6 py-4">No. Peserta</th>
                                        <th className="px-6 py-4">JK</th>
                                        <th className="px-6 py-4">Asal Sekolah</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Memuat data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredCandidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada peserta yang cocok dengan kata kunci pencarian.
                                             </td>
                                        </tr>
                                    ) : (
                                        paginatedCandidates.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-850">
                                                        {c.photo ? (
                                                            <img 
                                                                src={getCandidatePhotoUrl(c.photo)} 
                                                                alt={c.nama_lengkap || 'Avatar'} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.currentTarget;
                                                                    target.onerror = null;
                                                                    target.src = '/assets/images/logo-dppi-kecil.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-200 dark:bg-gray-700">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                                    {c.nama_lengkap || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] font-semibold text-gray-650 dark:text-gray-400">
                                                    {c.no_peserta || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300">
                                                    {c.jk || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300">
                                                    {c.asal_sekolah || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-850 dark:bg-gray-800 dark:text-gray-350'}`}>
                                                        {c.status || 'Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => fetchJournalDetails(c.id)}
                                                            className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-950 text-violet-750 dark:text-violet-300 rounded font-semibold transition-colors text-[11px]"
                                                        >
                                                            Lihat Profiling
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadCandidateJournalById(c)}
                                                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold transition-colors text-[11px] flex items-center gap-1"
                                                            title="Download Excel Jurnal Profiling Peserta Ini"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Excel
                                                        </button>
                                                        <a
                                                            href={`/adminpanel/capaska/edit/${c.id}`}
                                                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950 text-amber-750 dark:text-amber-300 rounded font-semibold transition-colors text-[11px]"
                                                        >
                                                            Edit
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 pb-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                limit={limit}
                                total={filteredCandidates.length}
                                onPageChange={setCurrentPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    </div>
                </div>
            ) : detailLoading ? (
                /* ---------------- DETAIL LOADING ---------------- */
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Menyusun jurnal profiling peserta...</p>
                </div>
            ) : details === null ? (
                <div className="text-center py-12 text-gray-500">Gagal memuat jurnal profiling.</div>
            ) : (
                /* ---------------- DETAIL VIEW ---------------- */
                <div className="space-y-6">
                    {/* Header profile card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-800 shrink-0 mx-auto md:mx-0">
                            {details.profile.photo ? (
                                <img 
                                    src={getCandidatePhotoUrl(details.profile.photo)} 
                                    alt={details.profile.nama_lengkap || 'Avatar'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.src = '/assets/images/logo-dppi-kecil.png';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700 text-xs">
                                    NO PHOTO
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h2 className="text-xl font-bold text-gray-950 dark:text-white">{details.profile.nama_lengkap || '-'}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">No. Peserta: {details.profile.no_peserta || '-'}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs">
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    JK: <strong>{details.profile.jk || '-'}</strong>
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    Asal Sekolah: <strong>{details.profile.asal_sekolah || '-'}</strong>
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    Status: <strong>{details.profile.status || 'Aktif'}</strong>
                                </span>
                            </div>

                            {details.pemusatan.pamong && details.pemusatan.pamong.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3 border-t border-gray-150 dark:border-gray-800">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Total Skor SIKAP:</span>
                                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                                            {details.pemusatan.pamong.reduce((sum, p) => sum + getSikapSum(p), 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Total Skor PENAMPILAN:</span>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {details.pemusatan.pamong.reduce((sum, p) => sum + getPenampilanSum(p), 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Nilai Keseluruhan Rata²:</span>
                                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold font-mono text-xs">
                                            {(details.pemusatan.pamong.reduce((sum, p) => sum + parseFloat(getPamongNilaiKeseluruhan(p)), 0) / details.pemusatan.pamong.length).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Daily Logs Tab layout */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
                        {/* Tab header */}
                        <div className="flex border-b border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                            <button
                                onClick={() => setActiveTab('pamong')}
                                className={`px-6 py-3 font-bold text-xs uppercase transition-colors border-b-2 ${activeTab === 'pamong' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Jurnal Pamong
                            </button>
                            <button
                                onClick={() => setActiveTab('pelatih')}
                                className={`px-6 py-3 font-bold text-xs uppercase transition-colors border-b-2 ${activeTab === 'pelatih' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Jurnal Pelatih
                            </button>
                            <button
                                onClick={() => setActiveTab('dokter')}
                                className={`px-6 py-3 font-bold text-xs uppercase transition-colors border-b-2 ${activeTab === 'dokter' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Jurnal Dokter
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="p-6">
                            {/* PAMONG TAB */}
                            {activeTab === 'pamong' && (
                                <div className="overflow-x-auto">                                     <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase pb-2">
                                                <th className="py-3 px-2">Tanggal</th>
                                                <th className="py-3 px-2 text-center">Total Sikap</th>
                                                <th className="py-3 px-2 text-center">Total Penampilan</th>
                                                <th className="py-3 px-2 text-center">Rata² Sikap</th>
                                                <th className="py-3 px-2 text-center">Rata² Penampilan</th>
                                                <th className="py-3 px-2 text-center">Nilai Keseluruhan</th>
                                                <th className="py-3 px-2 text-center">Rata² Keseluruhan</th>
                                                <th className="py-3 px-2">Catatan khusus</th>
                                                <th className="py-3 px-2 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                                            {!details.pemusatan.pamong || details.pemusatan.pamong.length === 0 ? (
                                                <tr><td colSpan={9} className="py-6 text-center text-gray-400 italic">Belum ada catatan jurnal pamong.</td></tr>
                                            ) : (
                                                details.pemusatan.pamong.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30">
                                                        <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{p.tanggal}</td>
                                                        <td className="py-3 px-2 text-center font-mono font-bold text-violet-600 dark:text-violet-400">{getSikapSum(p)}</td>
                                                        <td className="py-3 px-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{getPenampilanSum(p)}</td>
                                                        <td className="py-3 px-2 text-center font-mono font-semibold text-indigo-600 dark:text-indigo-400">{getSikapAvg(p)}</td>
                                                        <td className="py-3 px-2 text-center font-mono font-semibold text-teal-600 dark:text-teal-400">{getPenampilanAvg(p)}</td>
                                                        <td className="py-3 px-2 text-center font-mono">
                                                            <span className="px-2.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                                                                {getPamongNilaiKeseluruhan(p)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-center font-mono">
                                                            <span className="px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold text-xs">
                                                                {((parseFloat(getSikapAvg(p)) + parseFloat(getPenampilanAvg(p))) / 2).toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-gray-650 dark:text-gray-300 max-w-xs truncate" title={p.catatan || ''}>{p.catatan || '-'}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <button
                                                                onClick={() => setSelectedPamongLog(p)}
                                                                className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-950 text-violet-750 dark:text-violet-300 rounded font-bold text-[10px] transition-colors"
                                                            >
                                                                Detail Nilai
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* PELATIH TAB */}
                            {activeTab === 'pelatih' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase pb-2">
                                                <th className="py-3 px-2">Tanggal</th>
                                                <th className="py-3 px-2">Rata-rata PBB</th>
                                                <th className="py-3 px-2">Rata-rata Bendera</th>
                                                <th className="py-3 px-2">Catatan latihan</th>
                                                <th className="py-3 px-2 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                                            {!details.pemusatan.pelatih || details.pemusatan.pelatih.length === 0 ? (
                                                <tr><td colSpan={5} className="py-6 text-center text-gray-400 italic">Belum ada catatan jurnal pelatih.</td></tr>
                                            ) : (
                                                details.pemusatan.pelatih.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30">
                                                        <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{p.tanggal}</td>
                                                        <td className="py-3 px-2 font-mono font-bold text-violet-600 dark:text-violet-400">{getPbbSikapDiamAvg(p)}</td>
                                                        <td className="py-3 px-2 font-mono font-bold text-violet-600 dark:text-violet-400">{getBenderaAvg(p)}</td>
                                                        <td className="py-3 px-2 text-gray-650 dark:text-gray-300 max-w-xs truncate" title={p.catatan || ''}>{p.catatan || '-'}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <button
                                                                onClick={() => setSelectedPelatihLog(p)}
                                                                className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-950 text-violet-750 dark:text-violet-300 rounded font-bold text-[10px] transition-colors"
                                                            >
                                                                Detail Nilai
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* DOKTER TAB */}
                            {activeTab === 'dokter' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase pb-2">
                                                <th className="py-3 px-2">Tanggal</th>
                                                <th className="py-3 px-2">Tensi</th>
                                                <th className="py-3 px-2">Suhu</th>
                                                <th className="py-3 px-2">Keluhan</th>
                                                <th className="py-3 px-2">Diagnosa</th>
                                                <th className="py-3 px-2">Terapi Obat</th>
                                                <th className="py-3 px-2">Rekomendasi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                                            {!details.pemusatan.dokter || details.pemusatan.dokter.length === 0 ? (
                                                <tr><td colSpan={7} className="py-6 text-center text-gray-400 italic">Belum ada catatan jurnal medis.</td></tr>
                                            ) : (
                                                details.pemusatan.dokter.map((d, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30">
                                                        <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{d.tanggal}</td>
                                                        <td className="py-3 px-2 font-mono">{d.tensi || '-'}</td>
                                                        <td className="py-3 px-2 font-mono">{d.suhu ? `${d.suhu}°C` : '-'}</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.keluhan || ''}>{d.keluhan || '-'}</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.diagnosa || ''}>{d.diagnosa || '-'}</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.terapi_obat || ''}>{d.terapi_obat || '-'}</td>
                                                        <td className="py-3 px-2 whitespace-nowrap">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRecommendationColor(d.rekomendasi_istirahat)}`}>
                                                                {d.rekomendasi_istirahat || '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pamong Score Detail Modal - same as before but with null handling */}
            {selectedPamongLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Detail Penilaian Pamong - {selectedPamongLog.tanggal}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                    Total: Sikap ({getSikapSum(selectedPamongLog)}) | Penampilan ({getPenampilanSum(selectedPamongLog)}) &bull; Rata-rata: Sikap ({getSikapAvg(selectedPamongLog)}) | Penampilan ({getPenampilanAvg(selectedPamongLog)}) &bull; Nilai Keseluruhan: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{getPamongNilaiKeseluruhan(selectedPamongLog)}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPamongLog(null)}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sikap Column */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-extrabold uppercase text-violet-650 dark:text-violet-400 tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                                        Aspek Sikap ({sikapFields.length} Indikator)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
                                        {sikapFields.map((field) => {
                                            const val = (selectedPamongLog as any)[field.key];
                                            return (
                                                <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                    <span className="text-gray-650 dark:text-gray-300 font-medium truncate max-w-48" title={field.label}>
                                                        {field.label.replace(/^\d+\.\s*/, '')}
                                                    </span>
                                                    <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                        {val !== null && val !== undefined ? val : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Penampilan Column */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold uppercase text-violet-650 dark:text-violet-400 tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                                            Aspek Penampilan ({penampilanFields.length} Indikator)
                                        </h4>
                                        <div className="space-y-2.5">
                                            {penampilanFields.map((field) => {
                                                const val = (selectedPamongLog as any)[field.key];
                                                return (
                                                    <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                        <span className="text-gray-650 dark:text-gray-300 font-medium">
                                                            {field.label.replace(/^\d+\.\s*/, '')}
                                                        </span>
                                                        <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                            {val !== null && val !== undefined ? val : '-'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Catatan Area inside Modal */}
                                    <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-150 dark:border-gray-850">
                                        <h5 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                            Catatan Khusus / Insiden Kejadian
                                        </h5>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                            {selectedPamongLog.catatan ? `"${selectedPamongLog.catatan}"` : 'Tidak ada catatan kejadian khusus.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 flex justify-end">
                            <button
                                onClick={() => setSelectedPamongLog(null)}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded text-xs font-bold transition-colors shadow-sm"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pelatih Score Detail Modal - similar with null handling */}
            {selectedPelatihLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Detail Penilaian Pelatih - {selectedPelatihLog.tanggal}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                    Rata-rata: PBB Sikap Diam ({getPbbSikapDiamAvg(selectedPelatihLog)}) | Bendera ({getBenderaAvg(selectedPelatihLog)})
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPelatihLog(null)}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* PBB Sikap Diam Column */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-extrabold uppercase text-violet-650 dark:text-violet-400 tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                                        PBB Sikap Diam ({pbbSikapDiamFields.length} Indikator)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
                                        {pbbSikapDiamFields.map((field) => {
                                            const val = (selectedPelatihLog as any)[field.key];
                                            return (
                                                <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                    <span className="text-gray-650 dark:text-gray-300 font-medium truncate max-w-48" title={field.label}>
                                                        {field.label.replace(/^\d+\.\s*/, '')}
                                                    </span>
                                                    <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                        {val !== null && val !== undefined ? val : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bendera Column */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold uppercase text-violet-650 dark:text-violet-400 tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                                            Aspek Bendera ({benderaFields.length} Indikator)
                                        </h4>
                                        <div className="space-y-2.5">
                                            {benderaFields.map((field) => {
                                                const val = (selectedPelatihLog as any)[field.key];
                                                return (
                                                    <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                        <span className="text-gray-650 dark:text-gray-300 font-medium">
                                                            {field.label.replace(/^\d+\.\s*/, '')}
                                                        </span>
                                                        <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                            {val !== null && val !== undefined ? val : '-'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Catatan Area inside Modal */}
                                    <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-150 dark:border-gray-850">
                                        <h5 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                            Catatan Latihan
                                        </h5>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                            {selectedPelatihLog.catatan ? `"${selectedPelatihLog.catatan}"` : 'Tidak ada catatan latihan.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 flex justify-end">
                            <button
                                onClick={() => setSelectedPelatihLog(null)}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded text-xs font-bold transition-colors shadow-sm"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Best Criteria */}
            {showBestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                                    🏆
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        Nilai Terbaik per Kriteria (Sikap & Penampilan)
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Peserta Capaska dengan perolehan rata-rata nilai tertinggi di masing-masing indikator harian
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportBestCriteriaToExcel}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Excel Best Kriteria
                                </button>
                                <button onClick={() => setShowBestModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold px-2">✕</button>
                            </div>
                        </div>

                        {/* Modal Sub Header Tabs */}
                        <div className="px-6 border-b border-gray-200 dark:border-gray-800 flex gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                            <button
                                onClick={() => setBestModalTab('sikap')}
                                className={`py-3 text-xs font-bold border-b-2 transition ${
                                    bestModalTab === 'sikap'
                                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                31 Kriteria Sikap Pamong
                            </button>
                            <button
                                onClick={() => setBestModalTab('penampilan')}
                                className={`py-3 text-xs font-bold border-b-2 transition ${
                                    bestModalTab === 'penampilan'
                                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                7 Kriteria Penampilan Pamong
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {bestLoading ? (
                                <div className="py-16 text-center text-gray-500 space-y-2">
                                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs">Menghitung peserta terbaik per kriteria...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(bestModalTab === 'sikap' ? bestSikapList : bestPenampilanList).map((item) => (
                                        <div key={item.key} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-400 dark:hover:border-amber-500 transition">
                                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2">
                                                <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                                                    {item.label}
                                                </h4>
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                                                    ⭐ {item.bestScore > 0 ? item.bestScore.toFixed(2) : '-'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 shrink-0">
                                                    {item.photo ? (
                                                        <img
                                                            src={getCandidatePhotoUrl(item.photo)}
                                                            alt={item.candidateName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                target.onerror = null;
                                                                target.src = '/assets/images/logo-dppi-kecil.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold bg-gray-200 dark:bg-gray-700">
                                                            {item.candidateName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {item.candidateName}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                        {item.noPeserta} | {item.provinsi}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center text-xs text-gray-500">
                            <span>Dihitung otomatis dari akumulasi harian Pamong</span>
                            <button
                                onClick={() => setShowBestModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-white rounded-xl font-bold transition"
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