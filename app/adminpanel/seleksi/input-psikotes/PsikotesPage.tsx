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

export default function PsikotesPage() {
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
    
    // Psikotes Scores States
    const [iq, setIq] = useState<number>(100);
    const [iqKategori, setIqKategori] = useState('Rata-rata');

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
            const res = await fetch(`${UrlApi}/seleksi/psikotes/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat detail Psikotes');
            const data = await res.json();
            
            if (data.iq !== undefined) {
                setIq(data.iq || 100);
                setIqKategori(data.iq_kategori || 'Rata-rata');
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
            const res = await fetch(`${UrlApi}/seleksi/psikotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_capaska: Number(selectedCandidate),
                    iq: Number(iq),
                    iq_kategori: iqKategori
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan psikotes');

            Swal.fire('Berhasil!', 'Penilaian Psikotes berhasil disimpan.', 'success');
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Input Hasil Psikotes (Seleksi)</h1>
                <p className="text-gray-650 dark:text-gray-400 text-sm">Pencatatan skor IQ dan Kategori Intelegensia Psikologis Capaska</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Skor IQ Peserta</label>
                        <input
                            type="number"
                            value={iq}
                            onChange={(e) => setIq(Number(e.target.value))}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                            min="50"
                            max="200"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Kategori IQ</label>
                        <select
                            value={iqKategori}
                            onChange={(e) => setIqKategori(e.target.value)}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        >
                            <option value="Sangat Superior">Sangat Superior (130+)</option>
                            <option value="Superior">Superior (120-129)</option>
                            <option value="Rata-rata Atas">Rata-rata Atas (110-119)</option>
                            <option value="Rata-rata">Rata-rata (90-109)</option>
                            <option value="Rata-rata Bawah">Rata-rata Bawah (80-89)</option>
                            <option value="Batas Lambat">Batas Lambat (70-79)</option>
                        </select>
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
                        <span>Simpan Hasil Psikotes</span>
                    )}
                </button>
            </form>
        </div>
    );
}
