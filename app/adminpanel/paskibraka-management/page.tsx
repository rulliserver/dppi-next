'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

interface Tugas {
    id: string;
    judul: string;
    deskripsi: string;
    file_lampiran?: string;
    deadline: string;
}

interface Informasi {
    id: string;
    judul: string;
    konten: string;
    file_lampiran?: string;
    created_at?: string;
}

interface Submission {
    id: string;
    id_tugas: string;
    user_id: string;
    nama_siswa: string;
    judul_tugas?: string;
    file_url: string;
    file_type: string;
    catatan_siswa?: string;
    submitted_at?: string;
    nilai?: string;
    catatan_admin?: string;
}

export default function AdminPaskibrakaManagementPage() {
    const [activeTab, setActiveTab] = useState<'tugas' | 'informasi' | 'pengumpulan' | 'sync'>('tugas');

    const [tasks, setTasks] = useState<Tugas[]>([]);
    const [informasiList, setInformasiList] = useState<Informasi[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Form Task
    const [taskForm, setTaskForm] = useState({
        judul: '',
        deskripsi: '',
        deadline: '',
        file_lampiran: ''
    });

    // Form Info
    const [infoForm, setInfoForm] = useState({
        judul: '',
        konten: '',
        file_lampiran: ''
    });

    // Form Grading
    const [gradingSub, setGradingSub] = useState<Submission | null>(null);
    const [gradeInput, setGradeInput] = useState('');
    const [catatanInput, setCatatanInput] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resT, resI, resS] = await Promise.all([
                fetch(`${UrlApi}/paskibraka/tugas`, { credentials: 'include' }),
                fetch(`${UrlApi}/paskibraka/informasi`, { credentials: 'include' }),
                fetch(`${UrlApi}/paskibraka/pengumpulan`, { credentials: 'include' })
            ]);

            if (resT.ok) setTasks((await resT.json()).data || []);
            if (resI.ok) setInformasiList((await resI.json()).data || []);
            if (resS.ok) setSubmissions((await resS.json()).data || []);
        } catch (err) {
            console.error('Error fetching admin paskibraka data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Sync Users Handler
    const handleSyncUsers = async () => {
        const confirm = await Swal.fire({
            title: 'Sinkronkan Akun Paskibraka?',
            text: 'Sistem akan membuat akun login pengguna role Paskibraka dari data_capaska yang memiliki email.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ya, Sinkronkan',
            cancelButtonText: 'Batal'
        });

        if (confirm.isConfirmed) {
            try {
                setSyncing(true);
                const res = await fetch(`${UrlApi}/paskibraka/sync-users`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Gagal menyinkronkan user');

                Swal.fire('Sinkronisasi Sukses', json.message, 'success');
            } catch (err: any) {
                Swal.fire('Error', err.message || 'Gagal sync user', 'error');
            } finally {
                setSyncing(false);
            }
        }
    };

    // Task Submit
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${UrlApi}/paskibraka/tugas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(taskForm)
            });

            if (!res.ok) throw new Error('Gagal menyimpan tugas');

            Swal.fire('Berhasil', 'Tugas bulanan berhasil diterbitkan.', 'success');
            setTaskForm({ judul: '', deskripsi: '', deadline: '', file_lampiran: '' });
            fetchAllData();
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Yakin ingin menghapus tugas ini?')) return;
        try {
            const res = await fetch(`${UrlApi}/paskibraka/tugas/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                Swal.fire('Terhapus', 'Tugas berhasil dihapus.', 'success');
                fetchAllData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Info Submit
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${UrlApi}/paskibraka/informasi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(infoForm)
            });

            if (!res.ok) throw new Error('Gagal menyimpan informasi');

            Swal.fire('Berhasil', 'Informasi/Pengumuman berhasil diterbitkan.', 'success');
            setInfoForm({ judul: '', konten: '', file_lampiran: '' });
            fetchAllData();
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleDeleteInfo = async (id: string) => {
        if (!confirm('Yakin ingin menghapus informasi ini?')) return;
        try {
            const res = await fetch(`${UrlApi}/paskibraka/informasi/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                Swal.fire('Terhapus', 'Informasi berhasil dihapus.', 'success');
                fetchAllData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Submit Grade
    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSub) return;
        try {
            const res = await fetch(`${UrlApi}/paskibraka/penilaian`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id_pengumpulan: gradingSub.id,
                    id_tugas: gradingSub.id_tugas,
                    user_id: gradingSub.user_id,
                    nilai: gradeInput,
                    catatan_admin: catatanInput
                })
            });

            if (!res.ok) throw new Error('Gagal menyimpan penilaian');

            Swal.fire('Berhasil', 'Nilai & umpan balik berhasil disimpan.', 'success');
            setGradingSub(null);
            setGradeInput('');
            setCatatanInput('');
            fetchAllData();
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Paskibraka Admin</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Kelola tugas bulanan, pengumuman informasi, pemeriksaan berkas jawaban, dan input nilai Paskibraka.
                        </p>
                    </div>

                    <button
                        onClick={handleSyncUsers}
                        disabled={syncing}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Menyinkronkan...' : 'Sync User dari Data Capaska'}
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2">
                    <button
                        onClick={() => setActiveTab('tugas')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                            activeTab === 'tugas'
                                ? 'border-red-600 text-red-600 dark:text-red-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Tugas Bulanan ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('informasi')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                            activeTab === 'informasi'
                                ? 'border-red-600 text-red-600 dark:text-red-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Informasi & Edaran ({informasiList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pengumpulan')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                            activeTab === 'pengumpulan'
                                ? 'border-red-600 text-red-600 dark:text-red-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Pengumpulan & Penilaian ({submissions.length})
                    </button>
                </div>

                {/* Tab Content 1: Tugas Bulanan */}
                {activeTab === 'tugas' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                                Terbitkan Tugas Baru
                            </h3>
                            <form onSubmit={handleSaveTask} className="space-y-3 text-sm">
                                <div>
                                    <label className="block font-semibold mb-1">Judul Tugas *</label>
                                    <input
                                        type="text"
                                        value={taskForm.judul}
                                        onChange={(e) => setTaskForm({ ...taskForm, judul: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Judul Tugas Bulanan..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Deskripsi & Instruksi *</label>
                                    <textarea
                                        value={taskForm.deskripsi}
                                        onChange={(e) => setTaskForm({ ...taskForm, deskripsi: e.target.value })}
                                        rows={4}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Instruksi pengerjaan tugas..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Deadline / Tenggat Waktu *</label>
                                    <input
                                        type="text"
                                        value={taskForm.deadline}
                                        onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="YYYY-MM-DD HH:MM:SS (contoh: 2026-08-31 23:59:59)"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Path/URL Lampiran Admin (Opsional)</label>
                                    <input
                                        type="text"
                                        value={taskForm.file_lampiran}
                                        onChange={(e) => setTaskForm({ ...taskForm, file_lampiran: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="uploads/..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                                >
                                    Terbitkan Tugas
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                                Daftar Tugas Bulanan Aktif
                            </h3>
                            {tasks.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">Belum ada tugas diterbitkan.</p>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map((t) => (
                                        <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{t.judul}</h4>
                                                <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{t.deskripsi}</p>
                                                <span className="inline-block mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                                                    Deadline: {new Date(t.deadline).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(t.id)}
                                                className="text-xs text-rose-600 hover:underline font-semibold"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 2: Informasi */}
                {activeTab === 'informasi' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                                Buat Informasi Baru
                            </h3>
                            <form onSubmit={handleSaveInfo} className="space-y-3 text-sm">
                                <div>
                                    <label className="block font-semibold mb-1">Judul Informasi *</label>
                                    <input
                                        type="text"
                                        value={infoForm.judul}
                                        onChange={(e) => setInfoForm({ ...infoForm, judul: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Judul pengumuman/edaran..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Isi Konten *</label>
                                    <textarea
                                        value={infoForm.konten}
                                        onChange={(e) => setInfoForm({ ...infoForm, konten: e.target.value })}
                                        rows={4}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Konten edaran..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Path File Lampiran (Opsional)</label>
                                    <input
                                        type="text"
                                        value={infoForm.file_lampiran}
                                        onChange={(e) => setInfoForm({ ...infoForm, file_lampiran: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="uploads/..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                                >
                                    Terbitkan Informasi
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                                Daftar Pengumuman & Informasi
                            </h3>
                            {informasiList.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">Belum ada informasi diterbitkan.</p>
                            ) : (
                                <div className="space-y-3">
                                    {informasiList.map((info) => (
                                        <div key={info.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{info.judul}</h4>
                                                <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{info.konten}</p>
                                                <span className="inline-block mt-2 text-xs text-slate-400">
                                                    Dibuat: {info.created_at ? new Date(info.created_at).toLocaleDateString('id-ID') : '-'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteInfo(info.id)}
                                                className="text-xs text-rose-600 hover:underline font-semibold"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 3: Pengumpulan & Penilaian */}
                {activeTab === 'pengumpulan' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                            Pemeriksaan Berkas (PDF, DOCX, MP4) & Input Nilai
                        </h3>

                        {/* Modal Penilaian jika dipilih */}
                        {gradingSub && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                    Input Nilai untuk: <span className="text-red-600">{gradingSub.nama_siswa}</span> ({gradingSub.judul_tugas})
                                </h4>
                                <form onSubmit={handleSaveGrade} className="space-y-3 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold mb-1">Nilai (Angka / Huruf) *</label>
                                            <input
                                                type="text"
                                                value={gradeInput}
                                                onChange={(e) => setGradeInput(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white"
                                                placeholder="Contoh: 88.5 atau A"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold mb-1">Catatan Admin / Feedback</label>
                                            <input
                                                type="text"
                                                value={catatanInput}
                                                onChange={(e) => setCatatanInput(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white"
                                                placeholder="Evaluasi tugas Paskibraka..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs"
                                        >
                                            Simpan Nilai
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGradingSub(null)}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="p-3">Siswa Paskibraka</th>
                                        <th className="p-3">Tugas</th>
                                        <th className="p-3">Berkas</th>
                                        <th className="p-3">Tgl Kumpul</th>
                                        <th className="p-3">Nilai Admin</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.nama_siswa}</td>
                                            <td className="p-3">{sub.judul_tugas || '-'}</td>
                                            <td className="p-3">
                                                <a
                                                    href={`${UrlApi}/${sub.file_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 underline"
                                                >
                                                    <span className="uppercase text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                                        {sub.file_type}
                                                    </span>
                                                    Unduh / Buka
                                                </a>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500">
                                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="p-3 font-bold text-emerald-600">
                                                {sub.nilai || <span className="text-xs text-slate-400 font-normal">Belum dinilai</span>}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => {
                                                        setGradingSub(sub);
                                                        setGradeInput(sub.nilai || '');
                                                        setCatatanInput(sub.catatan_admin || '');
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-lg text-xs hover:bg-slate-800"
                                                >
                                                    {sub.nilai ? 'Edit Nilai' : 'Beri Nilai'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
