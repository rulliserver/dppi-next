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

export default function WawancaraPage() {
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
    
    // Wawancara Scores States
    const [nilai1, setNilai1] = useState(80);
    const [nilai2, setNilai2] = useState(80);
    const [nilai3, setNilai3] = useState(80);
    const [nilai4, setNilai4] = useState(80);

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
            const res = await fetch(`${UrlApi}/seleksi/wawancara/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat detail penilaian Wawancara');
            const data = await res.json();
            
            if (data.nilai1 !== undefined) {
                setNilai1(data.nilai1 || 0);
                setNilai2(data.nilai2 || 0);
                setNilai3(data.nilai3 || 0);
                setNilai4(data.nilai4 || 0);
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
            const res = await fetch(`${UrlApi}/seleksi/wawancara`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_capaska: Number(selectedCandidate),
                    id_provinsi: 1, // Default mapping
                    nilai1,
                    nilai2,
                    nilai3,
                    nilai4,
                    status: 'Selesai'
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan penilaian');

            Swal.fire('Berhasil!', 'Penilaian Wawancara berhasil disimpan.', 'success');
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

    return (
        <div className="max-w-2xl mx-auto mb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Input Penilaian Wawancara (Seleksi)</h1>
                <p className="text-gray-650 dark:text-gray-400 text-sm">Penilaian aspek wawancara kebangsaan, intelegensia, minat bakat, dan penampilan</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-250 dark:border-gray-800 shadow-sm space-y-6">
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

                <hr className="border-gray-150 dark:border-gray-800" />

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Kategori Penilaian Wawancara</h3>
                    
                    {/* Pancasila */}
                    <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-950 p-4 rounded border border-gray-100 dark:border-gray-850">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">Nilai Pancasila & Kebangsaan</span>
                            <span className="text-violet-600 dark:text-violet-400 text-sm">{nilai1}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={nilai1}
                            onChange={(e) => setNilai1(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                    </div>

                    {/* Intelegensia */}
                    <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-950 p-4 rounded border border-gray-100 dark:border-gray-850">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">Nilai Intelegensia Umum</span>
                            <span className="text-violet-600 dark:text-violet-400 text-sm">{nilai2}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={nilai2}
                            onChange={(e) => setNilai2(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                    </div>

                    {/* Minat Bakat */}
                    <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-950 p-4 rounded border border-gray-100 dark:border-gray-850">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">Nilai Minat & Bakat</span>
                            <span className="text-violet-600 dark:text-violet-400 text-sm">{nilai3}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={nilai3}
                            onChange={(e) => setNilai3(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                    </div>

                    {/* Penampilan */}
                    <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-950 p-4 rounded border border-gray-100 dark:border-gray-850">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">Nilai Penampilan & Kepribadian</span>
                            <span className="text-violet-600 dark:text-violet-400 text-sm">{nilai4}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={nilai4}
                            onChange={(e) => setNilai4(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
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
                        <span>Simpan Penilaian Wawancara</span>
                    )}
                </button>
            </form>
        </div>
    );
}
