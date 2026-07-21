'use client';

import { useState, useEffect, useRef } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Candidate {
    id: number;
    nama_lengkap: String;
    jk: string;
    nomor_dada: string | null;
}

export default function DokterPage() {
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
    const [saveLoading, setSaveLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Form States
    const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [tensi, setTensi] = useState('120/80');
    const [suhu, setSuhu] = useState<number>(36.5);
    const [keluhan, setKeluhan] = useState('');
    const [diagnosa, setDiagnosa] = useState('');
    const [terapiObat, setTerapiObat] = useState('');
    const [rekomendasi, setRekomendasi] = useState('Bisa Latihan');

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

    // Load existing data when candidate/date changes
    useEffect(() => {
        const loadExistingData = async () => {
            if (!selectedCandidate || !tanggal) {
                setIsDataLoaded(false);
                return;
            }
            
            setIsDataLoaded(false);
            try {
                const res = await fetch(`${UrlApi}/pemusatan/existing/dokter/${selectedCandidate}/${tanggal}`, {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setTensi(data.tensi || '120/80');
                        setSuhu(data.suhu || 36.5);
                        setKeluhan(data.keluhan || '');
                        setDiagnosa(data.diagnosa || '');
                        setTerapiObat(data.terapi_obat || '');
                        setRekomendasi(data.rekomendasi_istirahat || 'Bisa Latihan');
                        setLastSaved(new Date());
                    } else {
                        // Reset form
                        setKeluhan('');
                        setDiagnosa('');
                        setTerapiObat('');
                        setTensi('120/80');
                        setSuhu(36.5);
                        setRekomendasi('Bisa Latihan');
                        setLastSaved(null);
                    }
                } else {
                    setKeluhan('');
                    setDiagnosa('');
                    setTerapiObat('');
                    setTensi('120/80');
                    setSuhu(36.5);
                    setRekomendasi('Bisa Latihan');
                    setLastSaved(null);
                }
            } catch (err) {
                setKeluhan('');
                setDiagnosa('');
                setTerapiObat('');
                setTensi('120/80');
                setSuhu(36.5);
                setRekomendasi('Bisa Latihan');
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
            const res = await fetch(`${UrlApi}/pemusatan/dokter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_paskibraka: Number(selectedCandidate),
                    tanggal,
                    tensi,
                    suhu: Number(suhu),
                    keluhan: keluhan.trim() || null,
                    diagnosa: diagnosa.trim() || null,
                    terapi_obat: terapiObat.trim() || null,
                    rekomendasi_istirahat: rekomendasi
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan jurnal');

            setLastSaved(new Date());
            
            if (showNotification) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Jurnal harian Dokter berhasil disimpan.',
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

    // Auto-save function
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
    }, [tensi, suhu, keluhan, diagnosa, terapiObat, rekomendasi, selectedCandidate, tanggal, isDataLoaded]);

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Harian Dokter / Tim Kesehatan</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Input data tanda vital, keluhan medis, terapi obat, dan rekomendasi latihan harian Capaska</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-250 dark:border-gray-800 shadow-sm space-y-6">
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
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tanggal Pemeriksaan</label>
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

                {/* Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tekanan Darah (Tensi)</label>
                        <input
                            type="text"
                            value={tensi}
                            onChange={(e) => setTensi(e.target.value)}
                            placeholder="e.g. 120/80"
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Suhu Tubuh (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={suhu}
                            onChange={(e) => setSuhu(Number(e.target.value))}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Medical Logs */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Keluhan Kesehatan (Jika Ada)</label>
                        <textarea
                            value={keluhan}
                            onChange={(e) => setKeluhan(e.target.value)}
                            placeholder="Tuliskan keluhan yang disampaikan oleh peserta (misal: pusing, pegal, batuk)..."
                            rows={2}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Diagnosa Penyakit / Masalah Medis</label>
                        <input
                            type="text"
                            value={diagnosa}
                            onChange={(e) => setDiagnosa(e.target.value)}
                            placeholder="Tuliskan diagnosa pemeriksaan medis jika ada indikasi klinis..."
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Terapi & Pemberian Obat</label>
                        <textarea
                            value={terapiObat}
                            onChange={(e) => setTerapiObat(e.target.value)}
                            placeholder="Pemberian obat, suplemen, vitamin, atau tindakan fisioterapi..."
                            rows={2}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Clearance Recommendation */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Rekomendasi Status Istirahat</label>
                    <select
                        value={rekomendasi}
                        onChange={(e) => setRekomendasi(e.target.value)}
                        className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        required
                    >
                        <option value="Bisa Latihan">Bisa Latihan (Fit)</option>
                        <option value="Latihan Ringan">Latihan Ringan (Observasi/Pemulihan)</option>
                        <option value="Istirahat Total">Istirahat Total (Unfit / Istirahat di Kamar)</option>
                    </select>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {submitLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Menyimpan Jurnal...</span>
                        </>
                    ) : (
                        <span>Simpan Jurnal Kesehatan</span>
                    )}
                </button>
            </form>
        </div>
    );
}
