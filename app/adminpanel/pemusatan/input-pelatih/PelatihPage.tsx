'use client';

import { useState, useEffect, useRef } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Candidate {
    id: number;
    nama_lengkap: string;
    jk: string;
    nomor_dada: string | null;
}

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

const initialScores: Record<string, number> = {
    nilai_aba_aba: 80,
    nilai_berhimpun: 80,
    nilai_berkumpul: 80,
    nilai_keluar_masuk_barisan: 80,
    nilai_hormat: 80,
    nilai_sikap_sempurna: 80,
    nilai_istirahat: 80,
    nilai_periksa_kerapihan: 80,
    nilai_berhitung: 80,
    nilai_lepas_kenakan_topi: 80,
    nilai_bubar: 80,
    nilai_lencang_depan: 80,
    nilai_lencang_kanan_kiri: 80,
    nilai_setengah_lengan_lencang_kanan_kiri: 80,
    nilai_hadap_kanan_kiri: 80,
    nilai_hadap_serong_kanan_kiri: 80,
    nilai_balik_kanan: 80,
    nilai_langkah_bisa: 80,
    nilai_langkah_tegap: 80,
    nilai_sikap_awal_berlari: 80,
    nilai_jalan_di_tempat: 80,
    nilai_4_langkah_ke_depan: 80,
    nilai_4_langkah_ke_kanan: 80,
    nilai_4_langkah_ke_kiri: 80,
    nilai_4_langkah_ke_belakang: 80,
    nilai_lipat_bendera: 80,
    nilai_bentang_bendera: 80,
    nilai_10_tahap_penurunan: 80,
    nilai_jadi_kibra_pembentang: 80,
    nilai_jadi_kibra_pembawa: 80,
    nilai_jadi_kibra_pengerek: 80,
};

export default function PelatihPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isDark, setIsDark] = useState(false);
    const [activeTab, setActiveTab] = useState<'pbb' | 'bendera'>('pbb');

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
    const [saveLoading, setSaveLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
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

    // Load existing data when candidate/date changes
    useEffect(() => {
        const loadExistingData = async () => {
            if (!selectedCandidate || !tanggal) {
                setIsDataLoaded(false);
                return;
            }
            
            setIsDataLoaded(false);
            try {
                const res = await fetch(`${UrlApi}/pemusatan/existing/pelatih/${selectedCandidate}/${tanggal}`, {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        const newScores: Record<string, number> = { ...initialScores };
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

    // Save Data function
    const saveData = async (showNotification: boolean = false) => {
        if (!selectedCandidate) {
            if (showNotification) {
                Swal.fire('Peringatan', 'Silakan pilih peserta terlebih dahulu', 'warning');
            }
            return false;
        }

        try {
            const payload = {
                id_paskibraka: Number(selectedCandidate),
                tanggal,
                ...scores,
                catatan: catatan.trim() || null
            };

            const res = await fetch(`${UrlApi}/pemusatan/pelatih`, {
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
                    text: 'Jurnal harian Pelatih berhasil disimpan.',
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
        setSaveLoading(true);
        await saveData(false);
        setSaveLoading(false);
    };

    // Auto-save effect
    useEffect(() => {
        if (!selectedCandidate || !tanggal) return;
        if (!isDataLoaded) return;
        
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
            handleAutoSave();
        }, 2000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [scores, catatan, selectedCandidate, tanggal, isDataLoaded]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        await saveData(true);
        setSubmitLoading(false);
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
        <div className="mx-auto mb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Harian Pelatih</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Input evaluasi PBB Sikap Diam (25 indikator) & Bendera (6 indikator) harian Capaska</p>
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
                <div className="flex justify-end items-center text-xs text-gray-500 dark:text-gray-400">
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
                        onClick={() => setActiveTab('pbb')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'pbb'
                                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>PBB SIKAP DIAM</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-mono">
                            {getAverage(pbbSikapDiamFields)}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('bendera')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'bendera'
                                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>BENDERA</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-mono">
                            {getAverage(benderaFields)}
                        </span>
                    </button>
                </div>

                {/* Score Sliders in active Tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === 'pbb' &&
                        pbbSikapDiamFields.map((field) => (
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

                    {activeTab === 'bendera' &&
                        benderaFields.map((field) => (
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
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Catatan Perkembangan Latihan</label>
                    <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Masukkan catatan perkembangan latihan atau koreksi gerakan..."
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
