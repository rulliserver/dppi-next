'use client';

import React, { useEffect, useState } from 'react';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';

interface Informasi {
    id: string;
    judul: string;
    konten: string;
    file_lampiran?: string;
    created_at?: string;
}

export default function PaskibrakaInformasiPage() {
    const [items, setItems] = useState<Informasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInformasi = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/paskibraka/informasi`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setItems(json.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch info', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInformasi();
    }, []);

    const filteredItems = items.filter(i =>
        i.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.konten.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PaskibrakaLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Papan Informasi Admin</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Pengumuman resmi, edaran, dan informasi penting dari Pengurus/Admin Paskibraka.
                        </p>
                    </div>

                    <div className="w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Cari informasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Memuat pengumuman & informasi...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Belum Ada Informasi</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Belum ada pengumuman atau edaran informasi baru dari Admin yang sesuai dengan pencarian Anda.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3 hover:border-red-300 dark:hover:border-red-800 transition"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {item.judul}
                                    </h3>
                                    <span className="text-xs font-medium text-slate-400">
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'}
                                    </span>
                                </div>

                                <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                                    {item.konten}
                                </div>

                                {item.file_lampiran && (
                                    <div className="pt-2">
                                        <a
                                            href={item.file_lampiran.startsWith('http') ? item.file_lampiran : `${UrlApi.replace(/\/api\/?$/, '')}/${item.file_lampiran.replace(/^\//, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Unduh Lampiran Edaran PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PaskibrakaLayout>
    );
}
