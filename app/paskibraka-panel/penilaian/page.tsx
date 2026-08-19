'use client';

import React, { useEffect, useState } from 'react';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';

interface GradeItem {
    id: string;
    id_pengumpulan: string;
    id_tugas: string;
    user_id: string;
    nilai: string;
    catatan_admin?: string;
    created_at?: string;
    nama_siswa?: string;
    file_url?: string;
    file_type?: string;
    judul_tugas?: string;
}

export default function PaskibrakaPenilaianPage() {
    const [grades, setGrades] = useState<GradeItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPenilaian = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/paskibraka/penilaian`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setGrades(json.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch grades', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPenilaian();
    }, []);

    // Calculate Average Score if numeric
    const numericGrades = grades
        .map(g => parseFloat(g.nilai))
        .filter(n => !isNaN(n));
    const avgScore = numericGrades.length > 0
        ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1)
        : null;

    return (
        <PaskibrakaLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hasil Penilaian Tugas</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Lihat hasil evaluasi, nilai, dan umpan balik (feedback) dari Pembina/Admin atas tugas yang telah dikumpulkan.
                        </p>
                    </div>

                    {avgScore && (
                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-100 dark:border-red-900/50">
                            <div>
                                <span className="text-xs text-red-600 dark:text-red-300 font-medium block">Rata-Rata Nilai</span>
                                <span className="text-2xl font-black text-red-600 dark:text-red-400">{avgScore}</span>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Memuat hasil penilaian...</div>
                ) : grades.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Belum Ada Penilaian</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Admin belum memasukkan nilai untuk tugas yang telah Anda kumpulkan. Silakan periksa kembali berkala.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {grades.map((g) => (
                            <div
                                key={g.id}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                                                Hasil Evaluasi
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                                {g.judul_tugas || 'Tugas Bulanan'}
                                            </h3>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
                                            {g.nilai}
                                        </div>
                                    </div>

                                    {g.catatan_admin ? (
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                                                Umpan Balik / Catatan Admin:
                                            </span>
                                            <p className="text-sm text-slate-700 dark:text-slate-200 italic">
                                                "{g.catatan_admin}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Tidak ada catatan khusus dari admin.</p>
                                    )}
                                </div>

                                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                                    <span>Penilaian dikirim: {g.created_at ? new Date(g.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</span>
                                    {g.file_url && (
                                        <a
                                            href={`${UrlApi}/${g.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                                        >
                                            Lihat Berkas Tugas →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PaskibrakaLayout>
    );
}
