// app/adminpanel/berita/Berita.tsx
'use client';

import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UrlApi } from '@/app/Components/apiUrl';
import Pagination from '@/app/Components/Pagination';
import { BaseUrl } from '@/app/Components/baseUrl';
import Image from 'next/image';
import FormatLongDate from '@/app/Components/FormatLongDate';
import TextEditor from '@/app/Components/TextEditor';

interface Post {
    id: number;
    title: string;
    slug: string;
    news_category: string;
    tanggal: string;
    view: number;
    photo: string;
    caption: string;
    body: string;
    author: string;
    sumber: string;
    status?: number;
}

interface PaginatedResponse {
    links: any;
    data: Post[];
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
    query: string;
}

export default function Berita() {
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteData, setDeleteData] = useState<{ id: number; title: string } | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const paramsQS = useMemo(() => {
        const p = new URLSearchParams();
        p.set('page', String(currentPage));
        p.set('limit', String(limit));
        if (searchQuery.trim()) p.set('q', searchQuery.trim());
        return p.toString();
    }, [currentPage, limit, searchQuery]);

    const getData = async (qs: string) => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);
        setErrorMsg('');

        try {
            const res = await axios.get<PaginatedResponse>(`${UrlApi}/post?${qs}`, {
                withCredentials: true,
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });
            setData(res.data);
        } catch (err: any) {
            if (!axios.isCancel(err)) {
                console.error('Error fetching posts:', err);
                setErrorMsg(err?.response?.data?.message || 'Gagal memuat data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => setCurrentPage(1), 350);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Fetch saat params berubah
    useEffect(() => {
        getData(paramsQS);
        return () => controllerRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsQS]);

    // ===== Handlers =====
    const handlePageChange = (_link: string, page: number) => {
        // Komponen Pagination kamu mengirim (link, page)
        setCurrentPage(page);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Paksa fetch langsung biar responsif saat Enter
        const qs = new URLSearchParams({
            page: '1',
            limit: String(limit),
            ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        }).toString();
        setCurrentPage(1);
        getData(qs);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = Number(e.target.value) || 5;
        setLimit(val);
        setCurrentPage(1);
    };

    // Modal delete
    const openDeleteModal = (id: number, title: string) => {
        setDeleteData({ id, title });
        setIsDeleteOpen(true);
    };
    const closeDeleteModal = () => {
        setIsDeleteOpen(false);
        setDeleteData(null);
    };

    const deleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deleteData) return;
        try {
            await axios.delete(`${UrlApi}/adminpanel/post/${deleteData.id}`, {
                withCredentials: true,
            });
            // Refetch halaman sekarang (kalau halaman jadi kosong, fallback ke page-1)
            const afterDelete = async () => {
                await getData(paramsQS);
                // Jika data kosong dan bukan halaman pertama, mundur satu halaman
                if (data && data.data.length === 1 && currentPage > 1) {
                    setCurrentPage((p) => p - 1);
                }
            };
            await afterDelete();
            closeDeleteModal();
        } catch (err: any) {
            console.error('Gagal menghapus:', err);
            alert(err?.response?.data?.message || 'Gagal menghapus data.');
        }
    };

    // ===== Utilities =====
    const generateLinks = () => {
        if (!data) return [];
        const q = data.query || '';
        const links = [];

        // Prev
        links.push({
            url: data.current_page > 1 ? `?page=${data.current_page - 1}&q=${encodeURIComponent(q)}` : null,
            label: '<<',
            active: false,
        });

        for (let i = 1; i <= data.last_page; i++) {
            links.push({
                url: `?page=${i}&q=${encodeURIComponent(q)}`,
                label: i.toString(),
                active: i === data.current_page,
            });
        }

        // Next
        links.push({
            url: data.current_page < data.last_page ? `?page=${data.current_page + 1}&q=${encodeURIComponent(q)}` : null,
            label: '>>',
            active: false,
        });

        return links;
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Fallback image untuk next/image (pakai state per-row itu ribet; kita gunakan placeholder jika path kosong)
    const imageSrc = (p: Post) =>
        p.photo
            ? (p.photo.startsWith('http') ? p.photo : `${BaseUrl + p.photo}`)
            : 'https://placehold.co/600x400/757575/000000?text=Tidak+ada+gambar';

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-2">
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="text-lg">Memuat berita...</div>
                </div>
            )}

            <div className="flex flex-row justify-between">
                <p className="mx-2 my-auto mt-5 font-bold lg:text-xl dark:text-white">
                    <i className="fas fa-th" /> Tabel Berita
                </p>

                <a
                    href="/adminpanel/berita/create"
                    className="px-2 py-2 mt-3 text-xs font-semibold text-center text-white rounded-md xl:text-base xl:w-44 bg-accent"
                >
                    <i className="fas fa-plus-circle" /> Tambah Berita
                </a>
            </div>

            {/* Search + Limit */}
            <div className="flex flex-row justify-between gap-3">
                <select
                    name="limit"
                    id="limit"
                    className="select-option max-w-20"
                    value={limit}
                    onChange={handleLimitChange}
                >
                    {[5, 10, 20, 30, 50, 100].map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>

                <form onSubmit={handleSearchSubmit} className="my-4 min-w-96">
                    <label htmlFor="cari" className="mb-2 text-sm font-medium text-gray-900 sr-only">
                        Search
                    </label>
                    <div className="relative">
                        <input
                            id="cari"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari berita..."
                            className="block w-full py-4 h-12 text-sm text-gray-900 border border-gray-300 rounded-3xl bg-gray-50 focus:ring-accent focus:border-accent"
                        />
                        <button
                            type="submit"
                            className="text-white absolute right-1.5 bottom-1.5 bg-accent hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2"
                            disabled={loading}
                        >
                            Cari
                        </button>
                    </div>
                </form>
            </div>

            {errorMsg && (
                <div className="mb-3 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2">{errorMsg}</div>
            )}

            <div className="py-2 mx-auto text-xs 2xl:text-base">
                <table className="dataTable cell-border w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tanggal</th>
                            <th>Photo Berita</th>
                            <th>Judul Berita</th>
                            <th>Preview Isi Konten</th>
                            <th>Author</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="border-b">
                        {data && data.data.length > 0 ? (
                            data.data.map((item, index) => {
                                // preview 
                                const maxLength = 200;
                                let preview = item.body || '';
                                if (preview.length > maxLength) {
                                    preview = preview.substring(0, maxLength);
                                    const lastSpace = preview.lastIndexOf(' ');
                                    if (lastSpace !== -1) preview = preview.substring(0, lastSpace);
                                    preview += '...';
                                }

                                return (
                                    <tr key={item.id}>
                                        <td>{(data?.from || 0) + index}</td>
                                        <td>
                                            {FormatLongDate(item.tanggal)}
                                        </td>

                                        <td>
                                            <div className="relative w-[200px] h-[110px]">
                                                <Image
                                                    src={imageSrc(item)}
                                                    alt={item.caption || item.title}
                                                    fill
                                                    sizes="200px"
                                                    unoptimized={imageSrc(item).startsWith('http://localhost')}
                                                    onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/700x350/757575/000000?text=Gagal+Memuat+gambar" }} />
                                            </div>
                                        </td>

                                        <td>
                                            {item.status === 1 ? (
                                                <a
                                                    href={`/berita/${item.slug}`}
                                                    target="_blank"
                                                    className="text-blue-500 underline"
                                                    rel="noreferrer"
                                                >
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <p className="text-dark dark:text-white">{item.title}</p>
                                            )}
                                        </td>

                                        <td>
                                            <TextEditor data={preview} />
                                        </td>

                                        <td>{item.author}</td>

                                        <td>
                                            {item.status === 0
                                                ? 'Belum Disetujui'
                                                : item.status === 1
                                                    ? 'Disetujui'
                                                    : 'Ditolak'}
                                        </td>

                                        <td>
                                            <a
                                                href={`/adminpanel/berita/edit/${item.id}`}
                                                className="px-1 mx-1 rounded-sm text-success edit-btn"
                                            >
                                                <i className="fas fa-edit" />
                                            </a>
                                            <button
                                                className="delete-btn"
                                                onClick={() => openDeleteModal(item.id, item.title)}
                                                title="Hapus"
                                            >
                                                <i className="px-1 mx-1 rounded-sm text-danger fas fa-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="italic text-center text-accent" colSpan={12}>
                                    Berita tidak ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    <Pagination links={generateLinks()} onPageChange={handlePageChange} />
                </div>

                {/* Info pagination */}
                {data && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Menampilkan {data.from} - {data.to} dari {data.total_items} berita
                    </div>
                )}
            </div>

            {/* Delete Modal (no jQuery) */}
            {isDeleteOpen && deleteData && (
                <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-lg mx-auto bg-gray-100 border-2 border-blue-200 rounded-md shadow-md dark:bg-default shadow-blue-200">
                        <div className="flex items-center p-4">
                            <span className="mr-2 text-blue-500 font-semibold">Hapus Data</span>
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="ml-auto text-gray-500 hover:text-gray-800"
                                aria-label="Tutup"
                            >
                                <i className="fas fa-times-circle" />
                            </button>
                        </div>

                        <div className="px-4 pb-2 dark:text-white">
                            Anda yakin berita dengan judul{' '}
                            <span className="font-semibold italic">&quot;{deleteData.title}&quot;</span> akan dihapus?
                        </div>

                        <div className="p-4 pt-0">
                            <form onSubmit={deleteSubmit}>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={closeDeleteModal} className="py-2 mt-2 bg-yellow-500 rounded-md text-dark">
                                        Batal
                                    </button>
                                    <div />
                                    <button type="submit" className="py-2 mt-2 text-white rounded-md bg-accent">
                                        HAPUS
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
