'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

interface SipenaModul {
    id: string;
    title: string;
    source_type: string;
    file_path: string | null;
    youtube_url: string | null;
    extracted_text: string;
    created_at: string;
}

export default function SipenaPage() {
    const [modules, setModules] = useState<SipenaModul[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFormTab, setActiveFormTab] = useState<'pdf' | 'youtube'>('pdf');
    
    // PDF Form States
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfSubmitting, setPdfSubmitting] = useState(false);

    // YouTube Form States
    const [ytTitle, setYtTitle] = useState('');
    const [ytUrl, setYtUrl] = useState('');
    const [ytTranscript, setYtTranscript] = useState('');
    const [ytSubmitting, setYtSubmitting] = useState(false);

    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${UrlApi}/adminpanel/sipena/modul`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal memuat modul pengetahuan');
            const data = await res.json();
            setModules(data);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handlePdfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pdfTitle.trim() || !pdfFile) {
            Swal.fire('Peringatan', 'Judul dan File PDF wajib diisi', 'warning');
            return;
        }

        setPdfSubmitting(true);
        const formData = new FormData();
        formData.append('title', pdfTitle);
        formData.append('file', pdfFile);

        try {
            const res = await fetch(`${UrlApi}/adminpanel/sipena/upload-modul`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal mengupload modul PDF');

            Swal.fire('Berhasil!', 'Modul PDF berhasil diupload dan teks diekstrak.', 'success');
            setPdfTitle('');
            setPdfFile(null);
            // Reset file input element manually
            const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            fetchModules();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Gagal memproses file PDF', 'error');
        } finally {
            setPdfSubmitting(false);
        }
    };

    const handleYtSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ytTitle.trim() || !ytUrl.trim() || !ytTranscript.trim()) {
            Swal.fire('Peringatan', 'Semua kolom form YouTube wajib diisi', 'warning');
            return;
        }

        setYtSubmitting(true);
        try {
            const res = await fetch(`${UrlApi}/adminpanel/sipena/add-youtube`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: ytTitle,
                    youtube_url: ytUrl,
                    transcript: ytTranscript
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menambahkan materi YouTube');

            Swal.fire('Berhasil!', 'Materi video YouTube berhasil disimpan.', 'success');
            setYtTitle('');
            setYtUrl('');
            setYtTranscript('');
            fetchModules();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Gagal memproses video YouTube', 'error');
        } finally {
            setYtSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        const confirm = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Modul "${title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${UrlApi}/adminpanel/sipena/modul/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menghapus modul');

            Swal.fire('Dihapus!', 'Modul berhasil dihapus dari sistem.', 'success');
            fetchModules();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Gagal menghapus data', 'error');
        }
    };

    return (
        <div className="w-full mb-20 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Modul SiPena AI</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Kelola file PDF dan transkrip video YouTube yang dijadikan sebagai basis data pengetahuan RAG chatbot SiPena
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Upload */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6 self-start">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Tambah Pengetahuan Baru</h2>
                        <p className="text-xs text-gray-500">Pilih tipe sumber data yang ingin ditambahkan</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setActiveFormTab('pdf')}
                            className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
                                activeFormTab === 'pdf'
                                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            📁 PDF MODUL
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFormTab('youtube')}
                            className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
                                activeFormTab === 'youtube'
                                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            🎥 LINK YOUTUBE
                        </button>
                    </div>

                    {/* PDF Upload Form */}
                    {activeFormTab === 'pdf' && (
                        <form onSubmit={handlePdfSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Judul Modul</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Modul Wawasan Kebangsaan 2026"
                                    value={pdfTitle}
                                    onChange={(e) => setPdfTitle(e.target.value)}
                                    className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">File PDF Dokumen</label>
                                <input
                                    id="pdf-file-input"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                    className="p-2 border border-gray-350 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:outline-none cursor-pointer file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-violet-100 file:text-violet-750 hover:file:bg-violet-200"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={pdfSubmitting}
                                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                {pdfSubmitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Mengunggah & Mengekstrak Teks...</span>
                                    </>
                                ) : (
                                    <span>Simpan Modul PDF</span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* YouTube Upload Form */}
                    {activeFormTab === 'youtube' && (
                        <form onSubmit={handleYtSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Judul Video</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Nilai-Nilai Pancasila Era Digital"
                                    value={ytTitle}
                                    onChange={(e) => setYtTitle(e.target.value)}
                                    className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">URL Link YouTube</label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={ytUrl}
                                    onChange={(e) => setYtUrl(e.target.value)}
                                    className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Transkrip Teks Video</label>
                                <textarea
                                    placeholder="Tempel transkrip teks/subtitle dialog video YouTube di sini..."
                                    value={ytTranscript}
                                    onChange={(e) => setYtTranscript(e.target.value)}
                                    rows={8}
                                    className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-gray-400 leading-relaxed"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={ytSubmitting}
                                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                {ytSubmitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Materi YouTube</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Column: Modules List Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-150 dark:border-gray-850">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Daftar Modul & Materi Aktif</h2>
                        <p className="text-xs text-gray-500">Kumpulan sumber pengetahuan yang saat ini dibaca oleh AI SiPena</p>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-250 dark:border-gray-750 font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Judul Modul/Materi</th>
                                    <th className="px-6 py-4">Tipe Sumber</th>
                                    <th className="px-6 py-4">Tanggal Diunggah</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Memuat daftar modul...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : modules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                            Belum ada modul pengetahuan yang diunggah. AI saat ini hanya menggunakan pengetahuan umum.
                                        </td>
                                    </tr>
                                ) : (
                                    modules.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>{m.title}</span>
                                                    {m.youtube_url && (
                                                        <a
                                                            href={m.youtube_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline truncate max-w-[320px]"
                                                        >
                                                            {m.youtube_url}
                                                        </a>
                                                    )}
                                                    {m.file_path && (
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            Path: {m.file_path}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        m.source_type === 'pdf'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {m.source_type === 'pdf' ? '📁 PDF Document' : '🎥 YouTube Video'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                {new Date(m.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDelete(m.id, m.title)}
                                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950 dark:text-rose-400 rounded font-semibold transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
