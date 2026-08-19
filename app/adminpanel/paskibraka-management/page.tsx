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
    deadline_tugas?: string;
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
    });
    const [taskFile, setTaskFile] = useState<File | null>(null);
    const [savingTask, setSavingTask] = useState(false);

    // Form Info
    const [infoForm, setInfoForm] = useState({
        judul: '',
        konten: '',
    });
    const [infoFile, setInfoFile] = useState<File | null>(null);
    const [savingInfo, setSavingInfo] = useState(false);

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

    // Task Submit (Supports PDF upload)
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingTask(true);
            const formData = new FormData();
            formData.append('judul', taskForm.judul);
            formData.append('deskripsi', taskForm.deskripsi);
            formData.append('deadline', taskForm.deadline);
            if (taskFile) {
                formData.append('file_lampiran', taskFile);
            }

            const res = await fetch(`${UrlApi}/paskibraka/tugas`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Gagal menyimpan tugas');

            Swal.fire('Berhasil', 'Tugas bulanan berhasil diterbitkan.', 'success');
            setTaskForm({ judul: '', deskripsi: '', deadline: '' });
            setTaskFile(null);
            fetchAllData();
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setSavingTask(false);
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

    // Info Submit (Supports PDF upload)
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingInfo(true);
            const formData = new FormData();
            formData.append('judul', infoForm.judul);
            formData.append('konten', infoForm.konten);
            if (infoFile) {
                formData.append('file_lampiran', infoFile);
            }

            const res = await fetch(`${UrlApi}/paskibraka/informasi`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Gagal menyimpan informasi');

            Swal.fire('Berhasil', 'Informasi/Pengumuman berhasil diterbitkan.', 'success');
            setInfoForm({ judul: '', konten: '' });
            setInfoFile(null);
            fetchAllData();
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setSavingInfo(false);
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

    const isLateSubmission = (sub: Submission) => {
        if (!sub.submitted_at || !sub.deadline_tugas) return false;
        return new Date(sub.submitted_at).getTime() > new Date(sub.deadline_tugas).getTime();
    };

    const getFileUrl = (path?: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^\//, '');
        const domain = UrlApi.replace(/\/api\/?$/, '');
        return `${domain}/${cleanPath}`;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Paskibraka Admin</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Kelola tugas bulanan, pengumuman informasi PDF, pemeriksaan berkas jawaban, dan input nilai Paskibraka.
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
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Judul Tugas *</label>
                                    <input
                                        type="text"
                                        value={taskForm.judul}
                                        onChange={(e) => setTaskForm({ ...taskForm, judul: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Judul Tugas Bulanan..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Deskripsi & Instruksi *</label>
                                    <textarea
                                        value={taskForm.deskripsi}
                                        onChange={(e) => setTaskForm({ ...taskForm, deskripsi: e.target.value })}
                                        rows={4}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Instruksi pengerjaan tugas..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Pilih Tanggal & Waktu Deadline *</label>
                                    <input
                                        type="datetime-local"
                                        value={taskForm.deadline}
                                        onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Upload Lampiran PDF Tugas (Opsional)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) => setTaskFile(e.target.files?.[0] || null)}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950/40 dark:file:text-red-300"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingTask}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                                >
                                    {savingTask ? 'Menyimpan...' : 'Terbitkan Tugas'}
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
                                                {t.file_lampiran && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={getFileUrl(t.file_lampiran)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                                                        >
                                                            📄 Unduh PDF Lampiran Admin
                                                        </a>
                                                    </div>
                                                )}
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
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Judul Informasi *</label>
                                    <input
                                        type="text"
                                        value={infoForm.judul}
                                        onChange={(e) => setInfoForm({ ...infoForm, judul: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Judul pengumuman/edaran..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Isi Konten *</label>
                                    <textarea
                                        value={infoForm.konten}
                                        onChange={(e) => setInfoForm({ ...infoForm, konten: e.target.value })}
                                        rows={4}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Konten edaran..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Upload Lampiran PDF Edaran (Opsional)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) => setInfoFile(e.target.files?.[0] || null)}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950/40 dark:file:text-red-300"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingInfo}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                                >
                                    {savingInfo ? 'Menyimpan...' : 'Terbitkan Informasi'}
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
                                                {info.file_lampiran && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={getFileUrl(info.file_lampiran)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                                                        >
                                                            📄 Unduh PDF Edaran
                                                        </a>
                                                    </div>
                                                )}
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
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                            Berkas Jawaban Paskibraka ({submissions.length})
                        </h3>

                        {submissions.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">Belum ada berkas tugas dikumpulkan oleh siswa Paskibraka.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Nama Siswa</th>
                                            <th className="px-4 py-3">Tugas</th>
                                            <th className="px-4 py-3">Waktu Pengumpulan</th>
                                            <th className="px-4 py-3">Status Batas Waktu</th>
                                            <th className="px-4 py-3">Berkas</th>
                                            <th className="px-4 py-3">Nilai Admin</th>
                                            <th className="px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {submissions.map((sub) => {
                                            const late = isLateSubmission(sub);
                                            return (
                                                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40">
                                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                                        {sub.nama_siswa}
                                                    </td>
                                                    <td className="px-4 py-3">{sub.judul_tugas || '-'}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">
                                                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {late ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                                Terlambat
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                                Tepat Waktu
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a
                                                            href={getFileUrl(sub.file_url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-bold text-red-600 hover:underline uppercase"
                                                        >
                                                            Unduh ({sub.file_type})
                                                        </a>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {sub.nilai ? (
                                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                                                                {sub.nilai}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Belum Dinilai</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                setGradingSub(sub);
                                                                setGradeInput(sub.nilai || '');
                                                                setCatatanInput(sub.catatan_admin || '');
                                                            }}
                                                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs rounded-lg transition"
                                                        >
                                                            Beri Nilai
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Input Nilai */}
            {gradingSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Penilaian Tugas Paskibraka
                            </h3>
                            <button onClick={() => setGradingSub(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSaveGrade} className="p-6 space-y-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 block font-medium">Siswa Paskibraka</span>
                                <span className="font-bold text-slate-900 dark:text-white">{gradingSub.nama_siswa}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block font-medium">Tugas</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{gradingSub.judul_tugas}</span>
                            </div>
                            {isLateSubmission(gradingSub) && (
                                <div>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                        Status: Terlambat Dikerjakan
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold mb-1">Nilai (Angka/Huruf, mis. 90 atau A) *</label>
                                <input
                                    type="text"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="85"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Catatan / Umpan Balik Admin</label>
                                <textarea
                                    value={catatanInput}
                                    onChange={(e) => setCatatanInput(e.target.value)}
                                    rows={3}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Ulasan tugas..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setGradingSub(null)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow"
                                >
                                    Simpan Nilai
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
