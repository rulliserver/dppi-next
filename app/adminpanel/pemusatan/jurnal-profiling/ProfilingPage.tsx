'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Pagination from '@/app/components/UserPagination';

interface Candidate {
    id: number;
    nama_lengkap: string;
    photo: string | null;
    jk: string;
    nama_instansi_pendidikan: string | null;
    nomor_dada: string | null;
    status: string | null;
}

interface SelectionScores {
    wawancara: {
        nilai_pancasila_kebangsaan: string | null;
        nilai_intelegensia_umum: string | null;
        nilai_minat_bakat: string | null;
        nilai_penampilan: string | null;
        status: string | null;
    } | null;
    psikotes: {
        iq: number | null;
        kategori: string | null;
    } | null;
    kesehatan: {
        score_mata: number | null;
        score_gigi: number | null;
        score_tht: number | null;
    } | null;
    pbb: {
        sikap_sempurna: string | null;
        hormat: string | null;
        jalan_ditempat: string | null;
        istirahat: string | null;
        langkah_tegap: string | null;
    } | null;
}

interface DailyPamong {
    tanggal: string;
    nilai_ketaqwaan: number;
    nilai_niat_kemauan: number;
    nilai_keberanian: number;
    nilai_komunikasi: number;
    nilai_keterbukaan: number;
    nilai_ketelitian: number;
    nilai_kesadaran: number;
    nilai_toleransi: number;
    nilai_keikhlasan: number;
    nilai_mempercayai: number;
    nilai_jiwa_korsa: number;
    nilai_kekeluargaan: number;
    nilai_persatuan_kesatuan: number;
    nilai_ketahanan: number;
    nilai_kekompakan_keseragaman: number;
    nilai_ketertiban: number;
    nilai_kesopanan: number;
    nilai_kesigapan: number;
    nilai_kewajaran: number;
    nilai_ketanggapan: number;
    nilai_ketenangan: number;
    nilai_menyimak: number;
    nilai_kebiasaan: number;
    nilai_mengelola_stres: number;
    nilai_menghargai_waktu: number;
    nilai_berbicara: number;
    nilai_berjalan: number;
    nilai_makan_minum: number;
    nilai_kehadiran: number;
    nilai_hubungan_interpersonal: number;
    nilai_ketaatan: number;
    nilai_istirahat_malam: number;
    nilai_keindahan: number;
    nilai_kerapihan: number;
    nilai_kebersihan: number;
    nilai_berpakaian: number;
    nilai_penampilan_rambut: number;
    nilai_bersih_rapih_wangi: number;
    catatan: string | null;
}

interface DailyPelatih {
    tanggal: string;
    nilai_aba_aba: number;
    nilai_berhimpun: number;
    nilai_berkumpul: number;
    nilai_keluar_masuk_barisan: number;
    nilai_hormat: number;
    nilai_sikap_sempurna: number;
    nilai_istirahat: number;
    nilai_periksa_kerapihan: number;
    nilai_berhitung: number;
    nilai_lepas_kenakan_topi: number;
    nilai_bubar: number;
    nilai_lencang_depan: number;
    nilai_lencang_kanan_kiri: number;
    nilai_setengah_lengan_lencang_kanan_kiri: number;
    nilai_hadap_kanan_kiri: number;
    nilai_hadap_serong_kanan_kiri: number;
    nilai_balik_kanan: number;
    nilai_langkah_bisa: number;
    nilai_langkah_tegap: number;
    nilai_sikap_awal_berlari: number;
    nilai_jalan_di_tempat: number;
    nilai_4_langkah_ke_depan: number;
    nilai_4_langkah_ke_kanan: number;
    nilai_4_langkah_ke_kiri: number;
    nilai_4_langkah_ke_belakang: number;
    nilai_lipat_bendera: number;
    nilai_bentang_bendera: number;
    nilai_10_tahap_penurunan: number;
    nilai_jadi_kibra_pembentang: number;
    nilai_jadi_kibra_pembawa: number;
    nilai_jadi_kibra_pengerek: number;
    catatan: string | null;
}

interface DailyDokter {
    tanggal: string;
    tensi: string;
    suhu: string;
    keluhan: string | null;
    diagnosa: string | null;
    terapi_obat: string | null;
    rekomendasi_istirahat: string;
}

interface JournalDetails {
    profile: Candidate;
    seleksi: SelectionScores;
    pemusatan: {
        pamong: DailyPamong[];
        pelatih: DailyPelatih[];
        dokter: DailyDokter[];
    };
}

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
    
    // Detail modal states
    const [selectedPamongLog, setSelectedPamongLog] = useState<DailyPamong | null>(null);
    const [selectedPelatihLog, setSelectedPelatihLog] = useState<DailyPelatih | null>(null);

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
        c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, limit]);

    const totalPages = Math.ceil(filteredCandidates.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + limit);

    const getRecommendationColor = (rec: string) => {
        if (rec === 'Bisa Latihan') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        if (rec === 'Latihan Ringan') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    };

    // Calculate Pamong averages
    const getSikapAvg = (p: DailyPamong) => {
        const sum = sikapFields.reduce((acc, f) => acc + ((p as any)[f.key] || 0), 0);
        return (sum / sikapFields.length).toFixed(1);
    };

    const getPenampilanAvg = (p: DailyPamong) => {
        const sum = penampilanFields.reduce((acc, f) => acc + ((p as any)[f.key] || 0), 0);
        return (sum / penampilanFields.length).toFixed(1);
    };

    // Calculate Pelatih averages
    const getPbbSikapDiamAvg = (p: DailyPelatih) => {
        const sum = pbbSikapDiamFields.reduce((acc, f) => acc + ((p as any)[f.key] || 0), 0);
        return (sum / pbbSikapDiamFields.length).toFixed(1);
    };

    const getBenderaAvg = (p: DailyPelatih) => {
        const sum = benderaFields.reduce((acc, f) => acc + ((p as any)[f.key] || 0), 0);
        return (sum / benderaFields.length).toFixed(1);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-450';
        if (score >= 60) return 'text-amber-600 dark:text-amber-450';
        return 'text-rose-600 dark:text-rose-455';
    };

    return (
        <div className="mb-36 relative">
            {/* Page Header */}
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Profiling Paskibraka 2026</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Kompilasi penilaian seleksi dan pemantauan jurnal harian masa karantina Desa Bahagia
                    </p>
                </div>
                {selectedId !== null && (
                    <button
                        onClick={() => { setSelectedId(null); setDetails(null); }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded text-xs font-bold transition-colors border border-gray-250 dark:border-gray-700 shadow-sm"
                    >
                        Kembali ke Roster
                    </button>
                )}
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
                                        <th className="px-6 py-4">Nama Lengkap</th>
                                        <th className="px-6 py-4">No. Dada</th>
                                        <th className="px-6 py-4">Jenis Kelamin</th>
                                        <th className="px-6 py-4">Instansi Pendidikan</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Memuat data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredCandidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada peserta yang cocok dengan kata kunci pencarian.
                                             </td>
                                        </tr>
                                    ) : (
                                        paginatedCandidates.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 dark:border-gray-850">
                                                        {c.photo ? (
                                                            <img src={`${UrlApi.replace('/api', '')}/${c.photo}`} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                                                        )}
                                                    </div>
                                                    <span>{c.nama_lengkap}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] font-semibold text-gray-650 dark:text-gray-400">
                                                    {c.nomor_dada || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300">
                                                    {c.jk}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300">
                                                    {c.nama_instansi_pendidikan || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-850 dark:bg-gray-800 dark:text-gray-350'}`}>
                                                        {c.status || 'Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => fetchJournalDetails(c.id)}
                                                        className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-950 text-violet-750 dark:text-violet-300 rounded font-semibold transition-colors"
                                                    >
                                                        Lihat Jurnal Profiling
                                                    </button>
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
                                <img src={`${UrlApi.replace('/api', '')}/${details.profile.photo}`} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">NO PHOTO</div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h2 className="text-xl font-bold text-gray-950 dark:text-white">{details.profile.nama_lengkap}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{details.profile.nama_instansi_pendidikan || '-'}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs">
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    No. Dada: <strong>{details.profile.nomor_dada || '-'}</strong>
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    Gender: <strong>{details.profile.jk}</strong>
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-medium">
                                    Status: <strong>{details.profile.status || 'Karantina'}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Selection stage metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* PBB */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Seleksi PBB (Rata-rata)</h3>
                            {details.seleksi.pbb ? (
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>Sikap Sempurna:</span><span className="font-bold">{details.seleksi.pbb.sikap_sempurna ? Number(details.seleksi.pbb.sikap_sempurna).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Hormat:</span><span className="font-bold">{details.seleksi.pbb.hormat ? Number(details.seleksi.pbb.hormat).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Jalan di Tempat:</span><span className="font-bold">{details.seleksi.pbb.jalan_ditempat ? Number(details.seleksi.pbb.jalan_ditempat).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Langkah Tegap:</span><span className="font-bold">{details.seleksi.pbb.langkah_tegap ? Number(details.seleksi.pbb.langkah_tegap).toFixed(0) : '-'}</span></div>
                                </div>
                            ) : <p className="text-gray-400 text-xs italic">Data tidak ditemukan</p>}
                        </div>

                        {/* Wawancara */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Wawancara</h3>
                            {details.seleksi.wawancara ? (
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>Pancasila & Kebangsaan:</span><span className="font-bold">{details.seleksi.wawancara.nilai_pancasila_kebangsaan ? Number(details.seleksi.wawancara.nilai_pancasila_kebangsaan).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Intelegensia Umum:</span><span className="font-bold">{details.seleksi.wawancara.nilai_intelegensia_umum ? Number(details.seleksi.wawancara.nilai_intelegensia_umum).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Minat & Bakat:</span><span className="font-bold">{details.seleksi.wawancara.nilai_minat_bakat ? Number(details.seleksi.wawancara.nilai_minat_bakat).toFixed(0) : '-'}</span></div>
                                    <div className="flex justify-between"><span>Penampilan:</span><span className="font-bold">{details.seleksi.wawancara.nilai_penampilan ? Number(details.seleksi.wawancara.nilai_penampilan).toFixed(0) : '-'}</span></div>
                                </div>
                            ) : <p className="text-gray-400 text-xs italic">Data tidak ditemukan</p>}
                        </div>

                        {/* Kesehatan */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Kesehatan</h3>
                            {details.seleksi.kesehatan ? (
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>Score Mata:</span><span className="font-bold">{details.seleksi.kesehatan.score_mata ?? '-'}</span></div>
                                    <div className="flex justify-between"><span>Score Gigi:</span><span className="font-bold">{details.seleksi.kesehatan.score_gigi ?? '-'}</span></div>
                                    <div className="flex justify-between"><span>Score THT:</span><span className="font-bold">{details.seleksi.kesehatan.score_tht ?? '-'}</span></div>
                                </div>
                            ) : <p className="text-gray-400 text-xs italic">Data tidak ditemukan</p>}
                        </div>

                        {/* Psikotes */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Psikotes / IQ</h3>
                            {details.seleksi.psikotes ? (
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>IQ Asesi:</span><span className="font-bold">{details.seleksi.psikotes.iq ?? '-'}</span></div>
                                    <div className="flex justify-between"><span>Kategori IQ:</span><span className="font-bold">{details.seleksi.psikotes.kategori ?? '-'}</span></div>
                                </div>
                            ) : <p className="text-gray-400 text-xs italic">Data tidak ditemukan</p>}
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase pb-2">
                                                <th className="py-3 px-2">Tanggal</th>
                                                <th className="py-3 px-2">Rata-rata Sikap</th>
                                                <th className="py-3 px-2">Rata-rata Penampilan</th>
                                                <th className="py-3 px-2">Catatan khusus</th>
                                                <th className="py-3 px-2 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                                            {details.pemusatan.pamong.length === 0 ? (
                                                <tr><td colSpan={5} className="py-6 text-center text-gray-400 italic">Belum ada catatan jurnal pamong.</td></tr>
                                            ) : (
                                                details.pemusatan.pamong.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30">
                                                        <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{p.tanggal}</td>
                                                        <td className="py-3 px-2 font-mono font-bold text-violet-600 dark:text-violet-400">{getSikapAvg(p)}</td>
                                                        <td className="py-3 px-2 font-mono font-bold text-violet-600 dark:text-violet-400">{getPenampilanAvg(p)}</td>
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
                                            {details.pemusatan.pelatih.length === 0 ? (
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
                                            {details.pemusatan.dokter.length === 0 ? (
                                                <tr><td colSpan={7} className="py-6 text-center text-gray-400 italic">Belum ada catatan jurnal medis.</td></tr>
                                            ) : (
                                                details.pemusatan.dokter.map((d, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30">
                                                        <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{d.tanggal}</td>
                                                        <td className="py-3 px-2 font-mono">{d.tensi}</td>
                                                        <td className="py-3 px-2 font-mono">{d.suhu}°C</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.keluhan || ''}>{d.keluhan || '-'}</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.diagnosa || ''}>{d.diagnosa || '-'}</td>
                                                        <td className="py-3 px-2 max-w-30 truncate" title={d.terapi_obat || ''}>{d.terapi_obat || '-'}</td>
                                                        <td className="py-3 px-2 whitespace-nowrap">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRecommendationColor(d.rekomendasi_istirahat)}`}>
                                                                {d.rekomendasi_istirahat}
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

            {/* Pamong Score Detail Modal */}
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
                                    Rata-rata: Sikap ({getSikapAvg(selectedPamongLog)}) | Penampilan ({getPenampilanAvg(selectedPamongLog)})
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
                                            const val = (selectedPamongLog as any)[field.key] || 0;
                                            return (
                                                <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                    <span className="text-gray-650 dark:text-gray-300 font-medium truncate max-w-48" title={field.label}>
                                                        {field.label.replace(/^\d+\.\s*/, '')}
                                                    </span>
                                                    <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                        {val}
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
                                                const val = (selectedPamongLog as any)[field.key] || 0;
                                                return (
                                                    <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                        <span className="text-gray-650 dark:text-gray-300 font-medium">
                                                            {field.label.replace(/^\d+\.\s*/, '')}
                                                        </span>
                                                        <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                            {val}
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

            {/* Pelatih Score Detail Modal */}
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
                                            const val = (selectedPelatihLog as any)[field.key] || 0;
                                            return (
                                                <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                    <span className="text-gray-650 dark:text-gray-300 font-medium truncate max-w-48" title={field.label}>
                                                        {field.label.replace(/^\d+\.\s*/, '')}
                                                    </span>
                                                    <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                        {val}
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
                                                const val = (selectedPelatihLog as any)[field.key] || 0;
                                                return (
                                                    <div key={field.key} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 dark:border-gray-850">
                                                        <span className="text-gray-650 dark:text-gray-300 font-medium">
                                                            {field.label.replace(/^\d+\.\s*/, '')}
                                                        </span>
                                                        <span className={`font-mono font-bold ${getScoreColor(val)}`}>
                                                            {val}
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
        </div>
    );
}
