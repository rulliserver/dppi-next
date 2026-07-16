'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Candidate {
    id: number;
    nama_lengkap: string;
    jk: string;
    nomor_dada: string | null;
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

const initialScores: Record<string, number> = {
    nilai_ketaqwaan: 80,
    nilai_niat_kemauan: 80,
    nilai_keberanian: 80,
    nilai_komunikasi: 80,
    nilai_keterbukaan: 80,
    nilai_ketelitian: 80,
    nilai_kesadaran: 80,
    nilai_toleransi: 80,
    nilai_keikhlasan: 80,
    nilai_mempercayai: 80,
    nilai_jiwa_korsa: 80,
    nilai_kekeluargaan: 80,
    nilai_persatuan_kesatuan: 80,
    nilai_ketahanan: 80,
    nilai_kekompakan_keseragaman: 80,
    nilai_ketertiban: 80,
    nilai_kesopanan: 80,
    nilai_kesigapan: 80,
    nilai_kewajaran: 80,
    nilai_ketanggapan: 80,
    nilai_ketenangan: 80,
    nilai_menyimak: 80,
    nilai_kebiasaan: 80,
    nilai_mengelola_stres: 80,
    nilai_menghargai_waktu: 80,
    nilai_berbicara: 80,
    nilai_berjalan: 80,
    nilai_makan_minum: 80,
    nilai_kehadiran: 80,
    nilai_hubungan_interpersonal: 80,
    nilai_ketaatan: 80,
    nilai_istirahat_malam: 80,
    nilai_keindahan: 80,
    nilai_kerapihan: 80,
    nilai_kebersihan: 80,
    nilai_berpakaian: 80,
    nilai_penampilan_rambut: 80,
    nilai_bersih_rapih_wangi: 80,
};

export default function PamongPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isDark, setIsDark] = useState(false);
    const [activeTab, setActiveTab] = useState<'sikap' | 'penampilan'>('sikap');

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
    
    // Form States
    const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [scores, setScores] = useState<Record<string, number>>(initialScores);
    const [catatan, setCatatan] = useState('');

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

    const handleScoreChange = (key: string, val: number) => {
        setScores(prev => ({ ...prev, [key]: val }));
    };

    // Calculate averages dynamically
    const getAverage = (fields: { key: string }[]) => {
        const sum = fields.reduce((acc, f) => acc + (scores[f.key] || 0), 0);
        return (sum / fields.length).toFixed(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) {
            Swal.fire('Peringatan', 'Silakan pilih peserta terlebih dahulu', 'warning');
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                id_paskibraka: Number(selectedCandidate),
                tanggal,
                ...scores,
                catatan: catatan.trim() || null
            };

            const res = await fetch(`${UrlApi}/pemusatan/pamong`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan jurnal');

            Swal.fire({
                title: 'Berhasil!',
                text: 'Jurnal harian Pamong berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#7c3aed'
            });

            // Reset form except candidate and date for convenience
            setScores(initialScores);
            setCatatan('');
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
                <p className="text-gray-500 text-sm">Memuat data peserta...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Harian Pamong (Pengasuh)</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Input evaluasi sikap (31 indikator) & penampilan (7 indikator) harian Capaska</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                {/* Select Candidate & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Pilih Peserta Capaska</label>
                        <Select
                            value={candidateOptions.find(opt => opt.value === selectedCandidate) || null}
                            onChange={(newValue) => setSelectedCandidate(newValue ? newValue.value : '')}
                            options={candidateOptions}
                            styles={selectStyles}
                            placeholder="-- Pilih Peserta --"
                            isSearchable
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tanggal Evaluasi</label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <hr className="border-gray-150 dark:border-gray-800" />

                {/* Tab selector */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('sikap')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'sikap'
                                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>SIKAP</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-mono">
                            {getAverage(sikapFields)}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('penampilan')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'penampilan'
                                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>PENAMPILAN</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-mono">
                            {getAverage(penampilanFields)}
                        </span>
                    </button>
                </div>

                {/* Score Sliders in active Tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === 'sikap' &&
                        sikapFields.map((field) => (
                            <div
                                key={field.key}
                                className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-100 dark:border-gray-850"
                            >
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
                                    <span className="text-violet-650 dark:text-violet-400 text-sm">{scores[field.key]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scores[field.key]}
                                    onChange={(e) => handleScoreChange(field.key, Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                            </div>
                        ))}

                    {activeTab === 'penampilan' &&
                        penampilanFields.map((field) => (
                            <div
                                key={field.key}
                                className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-100 dark:border-gray-850"
                            >
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
                                    <span className="text-violet-650 dark:text-violet-400 text-sm">{scores[field.key]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scores[field.key]}
                                    onChange={(e) => handleScoreChange(field.key, Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                            </div>
                        ))}
                </div>

                <hr className="border-gray-150 dark:border-gray-800" />

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Catatan Khusus / Insiden Kejadian</label>
                    <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Masukkan catatan khusus atau kejadian menonjol tentang peserta ini jika ada..."
                        rows={4}
                        className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-gray-400"
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-violet-650 hover:bg-violet-750 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    {submitLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Menyimpan Jurnal...</span>
                        </>
                    ) : (
                        <span>Simpan Jurnal Harian</span>
                    )}
                </button>
            </form>
        </div>
    );
}
