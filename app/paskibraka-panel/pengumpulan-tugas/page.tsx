'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

interface Tugas {
    id: string;
    judul: string;
    deskripsi: string;
    deadline: string;
}

interface Submission {
    id: string;
    id_tugas: string;
    judul_tugas?: string;
    deadline_tugas?: string;
    file_url: string;
    file_type: string;
    catatan_siswa?: string;
    submitted_at?: string;
    nilai?: string;
    catatan_admin?: string;
}

function PengumpulanForm() {
    const searchParams = useSearchParams();
    const initialTugasId = searchParams?.get('tugas_id') || '';

    const [tasks, setTasks] = useState<Tugas[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedTugasId, setSelectedTugasId] = useState(initialTugasId);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [catatanSiswa, setCatatanSiswa] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resTasks, resSub] = await Promise.all([
                fetch(`${UrlApi}/paskibraka/tugas`, { credentials: 'include' }),
                fetch(`${UrlApi}/paskibraka/pengumpulan`, { credentials: 'include' })
            ]);

            if (resTasks.ok) {
                const jsonTasks = await resTasks.json();
                setTasks(jsonTasks.data || []);
                if (!initialTugasId && jsonTasks.data && jsonTasks.data.length > 0) {
                    setSelectedTugasId(jsonTasks.data[0].id);
                }
            }
            if (resSub.ok) {
                const jsonSub = await resSub.json();
                setSubmissions(jsonSub.data || []);
            }
        } catch (err) {
            console.error('Error fetching submission data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (initialTugasId) {
            setSelectedTugasId(initialTugasId);
        }
    }, [initialTugasId]);

    const activeTask = tasks.find(t => t.id === selectedTugasId);
    const isDeadlinePassed = activeTask ? new Date() > new Date(activeTask.deadline) : false;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc' && ext !== 'mp4') {
                Swal.fire('Format Tidak Didukung', 'Berkas harus berformat PDF, DOCX, atau MP4', 'error');
                e.target.value = '';
                setSelectedFile(null);
                return;
            }

            // Validasi ukuran
            const maxSize = ext === 'mp4' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                const limitMb = ext === 'mp4' ? '50MB' : '10MB';
                Swal.fire('Ukuran File Terlalu Besar', `Ukuran maksimum untuk ${ext?.toUpperCase()} adalah ${limitMb}`, 'warning');
                e.target.value = '';
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTugasId) {
            Swal.fire('Perhatian', 'Silakan pilih tugas terlebih dahulu', 'warning');
            return;
        }

        if (!selectedFile) {
            Swal.fire('Perhatian', 'Pilih file tugas (PDF, DOCX, MP4) yang akan dikumpulkan', 'warning');
            return;
        }

        if (isDeadlinePassed) {
            Swal.fire('Batas Waktu Berakhir', 'Tenggat waktu pengumpulan untuk tugas ini telah habis.', 'error');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('id_tugas', selectedTugasId);
            formData.append('catatan_siswa', catatanSiswa);
            formData.append('file', selectedFile);

            const res = await fetch(`${UrlApi}/paskibraka/pengumpulan`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || 'Gagal mengumpulkan tugas');
            }

            Swal.fire({
                icon: 'success',
                title: 'Tugas Berhasil Dikumpulkan!',
                text: 'Berkas tugas Anda telah diterima oleh sistem.',
                timer: 2000,
                showConfirmButton: false
            });

            setSelectedFile(null);
            setCatatanSiswa('');
            fetchData();
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan saat pengunggahan berkas', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengumpulan Tugas Bulanan</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Unggah hasil pengerjaan tugas Anda dalam format berkas <span className="font-semibold text-red-600 dark:text-red-400">PDF, DOCX, atau MP4</span> sesuai batas waktu yang ditentukan.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Upload */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                        Form Unggah Berkas
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Pilih Tugas Bulanan *
                            </label>
                            <select
                                value={selectedTugasId}
                                onChange={(e) => setSelectedTugasId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            >
                                <option value="">-- Pilih Tugas --</option>
                                {tasks.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.judul}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {activeTask && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-600">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 block">Tenggat Waktu:</span>
                                <span className={`font-bold ${isDeadlinePassed ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {new Date(activeTask.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                {isDeadlinePassed && (
                                    <p className="text-red-500 font-semibold pt-1">
                                        ⚠️ Batas waktu pengumpulan tugas ini telah berakhir.
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Berkas Tugas (PDF, DOCX, MP4) *
                            </label>
                            <div className="mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:border-red-400 transition bg-slate-50/50 dark:bg-slate-700/30">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20L28 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M28 8v12h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-slate-600 dark:text-slate-300">
                                        <label className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                                            <span>Pilih Berkas</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.doc,.mp4"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                                disabled={isDeadlinePassed}
                                            />
                                        </label>
                                        <p className="pl-1">atau tarik ke sini</p>
                                    </div>
                                    <p className="text-[11px] text-slate-400">PDF/DOCX max 10MB, MP4 max 50MB</p>
                                </div>
                            </div>
                            {selectedFile && (
                                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    ✓ Berkas dipilih: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Catatan Pengumpulan (Opsional)
                            </label>
                            <textarea
                                value={catatanSiswa}
                                onChange={(e) => setCatatanSiswa(e.target.value)}
                                rows={2}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="Pesan singkat untuk pembina/admin..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || isDeadlinePassed}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                        >
                            {uploading ? 'Mengunggah Berkas...' : 'Kumpulkan Tugas'}
                        </button>
                    </form>
                </div>

                {/* List Submissions */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                        Riwayat Tugas Yang Telah Dikumpulkan
                    </h3>

                    {submissions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Belum ada tugas yang dikumpulkan.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                            {sub.judul_tugas || 'Tugas Bulanan'}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Dikirim pada: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('id-ID') : '-'}
                                        </p>
                                        {sub.catatan_siswa && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                                "{sub.catatan_siswa}"
                                            </p>
                                        )}
                                        {sub.nilai && (
                                            <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                                <span>Nilai Admin: {sub.nilai}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                                            {sub.file_type}
                                        </span>
                                        <a
                                            href={`${UrlApi}/${sub.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Lihat Berkas
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PaskibrakaPengumpulanTugasPage() {
    return (
        <PaskibrakaLayout>
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
                <PengumpulanForm />
            </Suspense>
        </PaskibrakaLayout>
    );
}
