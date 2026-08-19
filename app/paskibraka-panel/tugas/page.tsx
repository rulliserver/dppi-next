'use client';

import React, { useEffect, useState } from 'react';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';
import Link from 'next/link';

interface Tugas {
    id: string;
    judul: string;
    deskripsi: string;
    file_lampiran?: string;
    deadline: string;
    created_at?: string;
}

export default function PaskibrakaTugasPage() {
    const [tasks, setTasks] = useState<Tugas[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTugas = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/paskibraka/tugas`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setTasks(json.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTugas();
    }, []);

    const getDeadlineStatus = (deadlineStr: string) => {
        const deadline = new Date(deadlineStr);
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) {
            return {
                label: 'Terlambat (Melewati Deadline)',
                color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                isExpired: false // Still allowed to submit!
            };
        }
        if (diffDays <= 2) {
            return {
                label: `Segera Berakhir (${diffDays} hari lagi)`,
                color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                isExpired: false
            };
        }
        return {
            label: `Batas Waktu: ${diffDays} hari lagi`,
            color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
            isExpired: false
        };
    };

    const getFileUrl = (path?: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^\//, '');
        const domain = UrlApi.replace(/\/api\/?$/, '');
        return `${domain}/${cleanPath}`;
    };

    return (
        <PaskibrakaLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tugas Bulanan Paskibraka</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Daftar instruksi dan tugas bulanan yang diberikan oleh Pembina/Admin. Anda dapat mengunduh berkas instruksi PDF dan mengirimkan berkas jawaban.
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Memuat daftar tugas...</div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Belum Ada Tugas Bulanan</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Saat ini belum ada tugas bulanan yang diterbitkan oleh Admin. Silakan periksa kembali di kemudian hari.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tasks.map((task) => {
                            const status = getDeadlineStatus(task.deadline);
                            const isLate = new Date().getTime() > new Date(task.deadline).getTime();
                            return (
                                <div
                                    key={task.id}
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                                {task.judul}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                                            {task.deskripsi}
                                        </p>

                                        {task.file_lampiran && (
                                            <div className="pt-2">
                                                <a
                                                    href={getFileUrl(task.file_lampiran)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Unduh Berkas Lampiran PDF Admin
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            Deadline: {new Date(task.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>

                                        <Link
                                            href={`/paskibraka-panel/pengumpulan-tugas?tugas_id=${task.id}`}
                                            className={`px-4 py-2 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5 ${
                                                isLate ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                        >
                                            <span>{isLate ? 'Kumpulkan (Terlambat)' : 'Kumpulkan Tugas'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PaskibrakaLayout>
    );
}
