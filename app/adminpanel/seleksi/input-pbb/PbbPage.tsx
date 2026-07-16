'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Candidate {
    id: number;
    nama_lengkap: string;
    nomor_dada: string | null;
}

export default function PbbPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const selectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: state.isFocused ? '#7c3aed' : isDark ? '#374151' : '#d1d5db',
            color: isDark ? '#f3f4f6' : '#1f2937',
            boxShadow: state.isFocused ? '0 0 0 1px #7c3aed' : 'none',
            '&:hover': {
                borderColor: '#7c3aed'
            }
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? '#7c3aed' 
                : state.isFocused 
                    ? isDark ? '#374151' : 'rgba(124, 58, 237, 0.1)' 
                    : isDark ? '#1f2937' : '#ffffff',
            color: state.isSelected 
                ? '#ffffff' 
                : isDark ? '#f3f4f6' : '#1f2937',
            cursor: 'pointer'
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: isDark ? '#f3f4f6' : '#1f2937'
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: isDark ? '#1f2937' : '#ffffff'
        }),
        input: (provided: any) => ({
            ...provided,
            color: isDark ? '#f3f4f6' : '#1f2937'
        })
    };

    const candidateOptions = candidates.map(c => ({
        value: c.id,
        label: `${c.nama_lengkap} ${c.nomor_dada ? `(${c.nomor_dada})` : ''}`
    }));
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Selection States
    const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
    const [status, setStatus] = useState('Rated');

    // PBB Scores States
    const [nilaiSikapSempurna, setNilaiSikapSempurna] = useState(80);
    const [nilaiHormat, setNilaiHormat] = useState(80);
    const [nilaiJalanDitempat, setNilaiJalanDitempat] = useState(80);
    const [nilaiSikapIstirahat, setNilaiSikapIstirahat] = useState(80);
    const [nilaiLangkahBiasa, setNilaiLangkahBiasa] = useState(80);
    const [nilaiLangkahTegap, setNilaiLangkahTegap] = useState(80);
    const [nilaiMeluruskanBarisan, setNilaiMeluruskanBarisan] = useState(80);
    const [nilaiMelangkah, setNilaiMelangkah] = useState(80);
    const [nilaiHadapKananKiri, setNilaiHadapKananKiri] = useState(80);
    const [nilaiSerongKananKiri, setNilaiSerongKananKiri] = useState(80);
    const [nilaiSuaraKomando, setNilaiSuaraKomando] = useState(80);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch(`${UrlApi}/seleksi/candidates`, {
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

    const handleCandidateChange = async (id: number | '') => {
        setSelectedCandidate(id);
        if (!id) return;

        try {
            const res = await fetch(`${UrlApi}/seleksi/pbb/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat detail penilaian PBB');
            const data = await res.json();
            
            if (data.nilai_sikap_sempurna !== undefined) {
                setNilaiSikapSempurna(data.nilai_sikap_sempurna || 0);
                setNilaiHormat(data.nilai_hormat || 0);
                setNilaiJalanDitempat(data.nilai_jalan_ditempat || 0);
                setNilaiSikapIstirahat(data.nilai_sikap_istirahat || 0);
                setNilaiLangkahBiasa(data.nilai_langkah_biasa || 0);
                setNilaiLangkahTegap(data.nilai_langkah_tegap || 0);
                setNilaiMeluruskanBarisan(data.nilai_meluruskan_barisan || 0);
                setNilaiMelangkah(data.nilai_melangkah || 0);
                setNilaiHadapKananKiri(data.nilai_hadap_kanan_kiri || 0);
                setNilaiSerongKananKiri(data.nilai_serong_kanan_kiri || 0);
                setNilaiSuaraKomando(data.nilai_suara_komando || 0);
                setStatus(data.status || 'Rated');
            }
        } catch (err: any) {
            Swal.fire('Warning', 'Gagal memuat nilai lama, menggunakan nilai default.', 'warning');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) {
            Swal.fire('Peringatan', 'Silakan pilih peserta terlebih dahulu', 'warning');
            return;
        }

        setSubmitLoading(true);
        try {
            const res = await fetch(`${UrlApi}/seleksi/pbb`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_capaska: Number(selectedCandidate),
                    id_provinsi: 1, // Default mapping
                    nilai_sikap_sempurna: nilaiSikapSempurna,
                    nilai_hormat: nilaiHormat,
                    nilai_jalan_ditempat: nilaiJalanDitempat,
                    nilai_sikap_istirahat: nilaiSikapIstirahat,
                    nilai_langkah_biasa: nilaiLangkahBiasa,
                    nilai_langkah_tegap: nilaiLangkahTegap,
                    nilai_meluruskan_barisan: nilaiMeluruskanBarisan,
                    nilai_melangkah: nilaiMelangkah,
                    nilai_hadap_kanan_kiri: nilaiHadapKananKiri,
                    nilai_serong_kanan_kiri: nilaiSerongKananKiri,
                    nilai_suara_komando: nilaiSuaraKomando,
                    status
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan penilaian');

            Swal.fire('Berhasil!', 'Penilaian PBB berhasil disimpan.', 'success');
            setSelectedCandidate('');
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan server', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat daftar peserta...</p>
            </div>
        );
    }

    const items = [
        { label: 'Sikap Sempurna', val: nilaiSikapSempurna, set: setNilaiSikapSempurna },
        { label: 'Hormat', val: nilaiHormat, set: setNilaiHormat },
        { label: 'Jalan di Tempat', val: nilaiJalanDitempat, set: setNilaiJalanDitempat },
        { label: 'Sikap Istirahat', val: nilaiSikapIstirahat, set: setNilaiSikapIstirahat },
        { label: 'Langkah Biasa', val: nilaiLangkahBiasa, set: setNilaiLangkahBiasa },
        { label: 'Langkah Tegap', val: nilaiLangkahTegap, set: setNilaiLangkahTegap },
        { label: 'Meluruskan Barisan', val: nilaiMeluruskanBarisan, set: setNilaiMeluruskanBarisan },
        { label: 'Melangkah', val: nilaiMelangkah, set: setNilaiMelangkah },
        { label: 'Hadap Kanan / Kiri', val: nilaiHadapKananKiri, set: setNilaiHadapKananKiri },
        { label: 'Serong Kanan / Kiri', val: nilaiSerongKananKiri, set: setNilaiSerongKananKiri },
        { label: 'Suara Komando', val: nilaiSuaraKomando, set: setNilaiSuaraKomando },
    ];

    return (
        <div className="max-w-3xl mx-auto mb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Input Penilaian PBB (Seleksi)</h1>
                <p className="text-gray-650 dark:text-gray-400 text-sm">Penilaian teknik Peraturan Baris Berbaris (PBB) tahap Seleksi Paskibraka</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Pilih Peserta Capaska</label>
                        <Select
                            value={candidateOptions.find(opt => opt.value === selectedCandidate) || null}
                            onChange={(newValue) => handleCandidateChange(newValue ? newValue.value : '')}
                            options={candidateOptions}
                            styles={selectStyles}
                            placeholder="-- Pilih Peserta --"
                            isSearchable
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Penilaian</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                            <option value="Rated">Rated (Selesai/Final)</option>
                            <option value="Draft">Draft (Sementara)</option>
                        </select>
                    </div>
                </div>

                <hr className="border-gray-150 dark:border-gray-800" />

                {/* Grid Sliders */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Indikator Penilaian PBB (Skala 0 - 100)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-950 p-4 rounded border border-gray-100 dark:border-gray-850">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-750 dark:text-gray-300">{item.label}</span>
                                    <span className="text-violet-600 dark:text-violet-400 text-sm">{item.val}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={item.val}
                                    onChange={(e) => item.set(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {submitLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Menyimpan Nilai...</span>
                        </>
                    ) : (
                        <span>Simpan Penilaian PBB</span>
                    )}
                </button>
            </form>
        </div>
    );
}
