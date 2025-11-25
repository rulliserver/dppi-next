// components/BeritaList.tsx
'use client';

import React, { useEffect, useState } from 'react';

import axios from 'axios';

import Link from 'next/link';
import { UrlApi } from '../Components/apiUrl';
import { BaseUrl } from '../Components/baseUrl';
import Pagination from '../Components/Pagination';
import FormatDateMonth from '../Components/FormatDateMonth';
import TextEditor from '../Components/TextEditor';
import Image from 'next/image';

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
}

interface PaginatedResponse {
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
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const getData = (page: number = 1, query: string = '') => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (query) {
            params.append('q', query);
        }

        axios
            .get(`${UrlApi}/post?${params.toString()}`)
            .then((response: any) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching posts:', error);
                setLoading(false);
            });
    };

    const handlePageChange = (Link: string, page: number) => {
        setCurrentPage(page);
        getData(page, searchQuery);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        getData(1, searchQuery);
    };

    useEffect(() => {
        getData(currentPage, searchQuery);
    }, [currentPage]);

    // Convert pagination format untuk component Pagination
    const generateLinks = () => {
        if (!data) return [];

        const links = [];

        // Previous page link
        links.push({
            url: data.current_page > 1 ? `?page=${data.current_page - 1}&q=${data.query}` : null,
            label: '<<',
            active: false
        });

        // Page number links
        for (let i = 1; i <= data.last_page; i++) {
            links.push({
                url: `?page=${i}&q=${data.query}`,
                label: i.toString(),
                active: i === data.current_page
            });
        }

        // Next page link
        links.push({
            url: data.current_page < data.last_page ? `?page=${data.current_page + 1}&q=${data.query}` : null,
            label: '>>',
            active: false
        });

        return links;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className='mx-2 my-20 md:mx-8 lg:mx-16'>
            <a href='/berita' className='text-3xl font-bold text-accent'>
                Berita
            </a>
            <p>Seputar Informasi Berita Duta Pancasila Purnapaskibraka Indondesia</p>
            {/* Search Form */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className='my-4'>
                    <label htmlFor='cari' className='mb-2 text-sm font-medium text-gray-900 sr-only'>
                        Search
                    </label>
                    <div className='relative'>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari berita..."
                            className='block w-full py-4 h-12 text-sm text-gray-900 border border-gray-300 rounded-3xl bg-gray-50 focus:ring-accent focus:border-accent'
                        />
                        <button
                            type='submit'
                            className='text-white absolute right-1.5 bottom-1.5 bg-accent hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 '>
                            Cari
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <div className="text-lg">Memuat berita...</div>
                </div>
            )}

            {data && data.data && !loading ? (
                <>
                    {/* Info pencarian */}
                    {data.query && (
                        <div className="mb-4 text-sm text-gray-600">
                            Menampilkan hasil untuk: "<strong>{data.query}</strong>"
                            ({data.total_items} hasil ditemukan)
                        </div>
                    )}

                    {/* List Berita */}
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4'>
                        {data?.data.map(({ id, title, photo, slug, view, body, tanggal }: any) => {
                            const maxLength = 200; // Panjang maksimum preview
                            let preview = body;
                            if (preview.length > maxLength) {
                                preview = preview.substring(0, maxLength); // Potong teks menjadi panjang maksimum
                                const lastSpaceIndex = preview.lastIndexOf(' '); // Cari indeks spasi terakhir
                                if (lastSpaceIndex !== -1) {
                                    preview = preview.substring(0, lastSpaceIndex); // Potong teks hingga indeks spasi terakhir
                                }
                                preview += '...'; // Tambahkan tanda titik tiga kali di ujung kata
                            }

                            const maxLengthTitle = 40; // Panjang maksimum title
                            let judul = title;
                            if (judul.length > maxLengthTitle) {
                                judul = judul.substring(0, maxLengthTitle); // Potong teks menjadi panjang maksimum
                                const lastSpaceIndex = judul.lastIndexOf(' '); // Cari indeks spasi terakhir
                                if (lastSpaceIndex !== -1) {
                                    judul = judul.substring(0, lastSpaceIndex); // Potong teks hingga indeks spasi terakhir
                                }
                                judul += '...'; // Tambahkan tanda titik tiga kali di ujung kata
                            }
                            return (
                                <div key={id} className='px-4 py-3 bg-gray-100 dark:text-black rounded-md shadow-sm shadow-red-300 md:grid-cols-'>
                                    <a href={`/berita/${slug}`} className='text-base font-bold 2lg:h-12'>
                                        {judul}
                                    </a>
                                    <p className='my-2 text-xs text-accent'>
                                        <i className='mr-2 fas fa-calendar-alt'></i>
                                        {formatDate(tanggal)}

                                        <span className='ml-2'>👁️ {view}</span>

                                    </p>
                                    <a href={`/berita/${slug}`}>
                                        <Image src={`${BaseUrl}/${photo}`} width={800} height={400} alt='Photo Berita' className='w-full max-h-[700px] align-middle bg-no-repeat object-cover opacity-90' onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }} />
                                        <TextEditor data={preview} />
                                    </a>
                                    <a href={`/berita/${slug}`} className='text-accent'>
                                        Selengkapnya...
                                    </a>
                                </div>
                            );

                        })}
                    </div>

                    {/* Pagination */}
                    {data.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                links={generateLinks()}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}

                    {/* Info pagination */}
                    {data && (
                        <div className="mt-4 text-center text-sm text-gray-600">
                            Menampilkan {data.from} - {data.to} dari {data.total_items} berita
                        </div>
                    )}
                </>
            ) : !loading && (
                <div className="flex justify-center py-8">
                    <div className="text-lg">Tidak ada berita ditemukan</div>
                </div>
            )}
        </div>
    );
}