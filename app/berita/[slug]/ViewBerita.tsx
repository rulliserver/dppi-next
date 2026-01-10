// components/BeritaList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { BaseUrl } from '@/app/components/baseUrl';
import Pagination from '@/app/components/Pagination';
import TextEditor from '@/app/components/TextEditor';
import Image from 'next/image';
import { UrlApi } from '@/app/components/apiUrl';
import { useParams } from 'next/navigation';
import FormatLongDate from '@/app/components/FormatLongDate';

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

export default function ViewBerita() {
    const { slug } = useParams();
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [berita, setBerita]: any = useState();
    const getBerita = () => {
        axios
            .get(`${UrlApi}/berita/${slug}`)
            .then((response: any) => {
                setBerita(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    const getData = (page: number = 1, query: string = '', itemsPerPage: number = 4) => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', itemsPerPage.toString());
        if (query) {
            params.append('q', query);
        }

        axios
            .get(`${UrlApi}/post-random?${params.toString()}`)
            .then((response: any) => {
                console.log('API Response:', response);
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
        getBerita();
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
            {berita &&
                <div className='my-16 max-w-340 mx-auto'>
                    <div className='px-4 py-3'>
                        <p className='text-base font-bold md:text-3xl'>{berita.title}</p>
                        <p className='my-2 text-xs text-accent'>
                            <i className='mr-2 fas fa-user'></i>
                            {berita.author}
                            <i className='ml-4 mr-2 fas fa-calendar-alt'></i>
                            {FormatLongDate(berita.tanggal)}
                            <span className='ml-2'>👁️ {berita.view}</span>
                        </p>
                        <Image src={`${BaseUrl}` + `${berita.photo}`} alt='Foto berita' height={400} width={1360} onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }} className='my-4' />
                        {berita.caption == 'null' || berita.caption == '-' ? '' : <p className='mb-4 text-sm'>{berita.caption}</p>}
                        <TextEditor data={berita.body} />
                    </div>
                </div>
            }

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
                    <div className='max-w-340 mx-auto dark:text-black'>
                        <div className='py-4 font-bold text-accent text-semibold'>Berita Lainnya:</div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'>
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
                                            <Image src={`${BaseUrl}` + `${photo}`} width={800} height={400} alt='Photo Berita' onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }} />
                                            <TextEditor data={preview} />
                                        </a>
                                        <a href={`/berita/${slug}`} className='text-accent'>
                                            Selengkapnya...
                                        </a>
                                    </div>
                                );

                            })}
                        </div>
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