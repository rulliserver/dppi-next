'use client';

import { useState, useEffect, useRef } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Candidate {
    id: number;
    nama_lengkap: string;
    jk: string;
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

// Kriteria penilaian
const scoreOptions = [
    { value: 60, label: 'Jelek' },
    { value: 70, label: 'Kurang' },
    { value: 80, label: 'Baik' },
    { value: 90, label: 'Baik Sekali' },
];

// Inisialisasi dengan null (tidak ada nilai default)
const initialScores: Record<string, number | null> = {};
[...sikapFields, ...penampilanFields].forEach(field => {
    initialScores[field.key] = null;
});

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
        label: `${c.nama_lengkap} (${c.jk.toUpperCase()})}`
    }));

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Form States
    const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [scores, setScores] = useState<Record<string, number | null>>(initialScores);
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

    // Auto-save effect dengan debounce
    useEffect(() => {
        if (!selectedCandidate || !tanggal) return;
        if (!isDataLoaded) return;
        
        // Clear timeout sebelumnya
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        // Set timeout baru
        autoSaveTimeoutRef.current = setTimeout(() => {
            handleAutoSave();
        }, 2000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [scores, catatan, selectedCandidate, tanggal, isDataLoaded]);

    const handleScoreChange = (key: string, val: number) => {
        setScores(prev => ({ ...prev, [key]: val }));
    };

    // Calculate averages - hanya hitung yang sudah dinilai
    const getAverage = (fields: { key: string }[]) => {
        const values = fields
            .map(f => scores[f.key])
            .filter((val): val is number => val !== null && val !== undefined);
        
        if (values.length === 0) return '0';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
    };

    // Hitung jumlah yang sudah dinilai
    const getFilledCount = (fields: { key: string }[]) => {
        return fields.filter(f => scores[f.key] !== null && scores[f.key] !== undefined).length;
    };

    // Fungsi untuk menyimpan data
    const saveData = async (showNotification: boolean = false) => {
        if (!selectedCandidate) {
            if (showNotification) {
                Swal.fire('Peringatan', 'Silakan pilih peserta terlebih dahulu', 'warning');
            }
            return false;
        }

        // Cek apakah ada nilai yang diisi
        const hasAnyScore = Object.values(scores).some(val => val !== null && val !== undefined);
        if (!hasAnyScore && !catatan.trim()) {
            if (showNotification) {
                Swal.fire('Peringatan', 'Silakan isi minimal satu penilaian atau catatan', 'warning');
            }
            return false;
        }

        try {
            // Buat payload hanya dengan field yang memiliki nilai
            const payload: any = {
                id_paskibraka: Number(selectedCandidate),
                tanggal,
            };
            
            Object.entries(scores).forEach(([key, val]) => {
                if (val !== null && val !== undefined) {
                    payload[key] = val;
                }
            });
            
            if (catatan.trim()) {
                payload.catatan = catatan.trim();
            }

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

            setLastSaved(new Date());
            
            if (showNotification) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Jurnal harian Pamong berhasil disimpan.',
                    icon: 'success',
                    confirmButtonColor: '#7c3aed'
                });
            }
            
            return true;
        } catch (err: any) {
            if (showNotification) {
                Swal.fire('Gagal', err.message || 'Terjadi kesalahan server', 'error');
            }
            return false;
        }
    };

    // Auto-save function (tanpa notifikasi)
    const handleAutoSave = async () => {
        if (!selectedCandidate) return;
        
        const hasAnyScore = Object.values(scores).some(val => val !== null && val !== undefined);
        if (!hasAnyScore && !catatan.trim()) return;
        
        setSaveLoading(true);
        await saveData(false);
        setSaveLoading(false);
    };

    // Submit manual dengan notifikasi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        await saveData(true);
        setSubmitLoading(false);
    };

    // Submit untuk tab tertentu
    const handleTabSubmit = async (tab: 'sikap' | 'penampilan') => {
        setSubmitLoading(true);
        
        // Validasi apakah ada nilai di tab tersebut
        const fields = tab === 'sikap' ? sikapFields : penampilanFields;
        const hasAnyScore = fields.some(f => scores[f.key] !== null && scores[f.key] !== undefined);
        
        if (!hasAnyScore && !catatan.trim()) {
            Swal.fire('Peringatan', `Silakan isi minimal satu penilaian di tab ${tab === 'sikap' ? 'SIKAP' : 'PENAMPILAN'} atau catatan`, 'warning');
            setSubmitLoading(false);
            return;
        }

        await saveData(true);
        setSubmitLoading(false);
    };

    // Load existing data when candidate/date changes
    useEffect(() => {
        const loadExistingData = async () => {
            if (!selectedCandidate || !tanggal) {
                setIsDataLoaded(false);
                return;
            }
            
            setIsDataLoaded(false);
            try {
                const res = await fetch(`${UrlApi}/pemusatan/pamong/${selectedCandidate}/${tanggal}`, {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.id) {
                        const newScores: Record<string, number | null> = { ...initialScores };
                        Object.keys(initialScores).forEach(key => {
                            if (data[key] !== undefined && data[key] !== null) {
                                newScores[key] = data[key];
                            }
                        });
                        setScores(newScores);
                        setCatatan(data.catatan || '');
                        setLastSaved(new Date());
                    } else {
                        setScores({ ...initialScores });
                        setCatatan('');
                        setLastSaved(null);
                    }
                } else {
                    setScores({ ...initialScores });
                    setCatatan('');
                    setLastSaved(null);
                }
            } catch (err) {
                setScores({ ...initialScores });
                setCatatan('');
                setLastSaved(null);
            } finally {
                setIsDataLoaded(true);
            }
        };
        
        loadExistingData();
    }, [selectedCandidate, tanggal]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat data peserta...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto mb-20">
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

                {/* Auto-save indicator */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        {isDataLoaded && selectedCandidate && (
                            `Total Terisi: ${getFilledCount([...sikapFields, ...penampilanFields])}/${sikapFields.length + penampilanFields.length}`
                        )}
                    </span>
                    <div className="flex items-center gap-2">
                        {saveLoading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Menyimpan otomatis...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <span className="text-green-500">✓</span>
                                <span>Terakhir disimpan: {lastSaved.toLocaleTimeString()}</span>
                            </>
                        ) : null}
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
                        <span className="text-xs text-gray-400">
                            ({getFilledCount(sikapFields)}/{sikapFields.length})
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
                        <span className="text-xs text-gray-400">
                            ({getFilledCount(penampilanFields)}/{penampilanFields.length})
                        </span>
                    </button>
                </div>

                {/* Radio Buttons in active Tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === 'sikap' &&
                        sikapFields.map((field) => (
                            <div
                                key={field.key}
                                className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-100 dark:border-gray-850"
                            >
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{field.label}</span>
                                <div className="flex flex-wrap gap-2">
                                    {scoreOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                                scores[field.key] === option.value
                                                    ? 'bg-violet-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={field.key}
                                                value={option.value}
                                                checked={scores[field.key] === option.value}
                                                onChange={() => handleScoreChange(field.key, option.value)}
                                                className="sr-only"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleScoreChange(field.key, null as any)}
                                        className={`px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            scores[field.key] === null || scores[field.key] === undefined
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                        }`}
                                        disabled={scores[field.key] === null || scores[field.key] === undefined}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                    {activeTab === 'penampilan' &&
                        penampilanFields.map((field) => (
                            <div
                                key={field.key}
                                className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-950 p-4 rounded-md border border-gray-100 dark:border-gray-850"
                            >
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{field.label}</span>
                                <div className="flex flex-wrap gap-2">
                                    {scoreOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                                scores[field.key] === option.value
                                                    ? 'bg-violet-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={field.key}
                                                value={option.value}
                                                checked={scores[field.key] === option.value}
                                                onChange={() => handleScoreChange(field.key, option.value)}
                                                className="sr-only"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleScoreChange(field.key, null as any)}
                                        className={`px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            scores[field.key] === null || scores[field.key] === undefined
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                        }`}
                                        disabled={scores[field.key] === null || scores[field.key] === undefined}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Tombol Submit per Tab */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => handleTabSubmit('sikap')}
                        disabled={submitLoading}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        {submitLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>💾 Simpan SIKAP</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabSubmit('penampilan')}
                        disabled={submitLoading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        {submitLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>💾 Simpan PENAMPILAN</span>
                        )}
                    </button>
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

                {/* Submit All button */}
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
                        <span>📋 Simpan Semua Jurnal</span>
                    )}
                </button>
            </form>
        </div>
    );
}