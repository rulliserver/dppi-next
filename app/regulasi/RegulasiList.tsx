'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../Components/Pagination';
import FormatLongDate from '../Components/FormatLongDate';
import { UrlApi } from '../Components/apiUrl';
import { BaseUrl } from '../Components/baseUrl';

interface RegulasiItem {
    id: number;
    nama_regulasi: string;
    icon_regulasi: string;
    file_regulasi: string;
    created_at: string;
    created_by: number;
    role: string;
}

interface PaginatedResponse {
    data: RegulasiItem[];
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
    query: string;
}

export default function RegulasiList() {
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(8);
    const [loading, setLoading] = useState(false);

    const getData = (page: number = 1, query: string = '', itemsPerPage: number = perPage) => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', itemsPerPage.toString());
        if (query) {
            params.append('q', query);
        }

        axios
            .get(`${UrlApi}/regulasi?${params.toString()}`)
            .then((response: any) => {
                console.log('API Response:', response);
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching regulasi:', error);
                setLoading(false);
            });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        getData(page, searchQuery, perPage);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        getData(1, searchQuery, perPage);
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPerPage = parseInt(e.target.value);
        setPerPage(newPerPage);
        setCurrentPage(1);
        getData(1, searchQuery, newPerPage);
    };

    useEffect(() => {
        getData(currentPage, searchQuery, perPage);
    }, [currentPage]);

    // Convert pagination format untuk component Pagination
    const generateLinks = () => {
        if (!data) return [];

        const links = [];

        // Previous page link
        links.push({
            url: data.current_page > 1 ? `?page=${data.current_page - 1}&per_page=${perPage}&q=${data.query}` : null,
            label: '<<',
            active: false
        });

        // Page number links
        for (let i = 1; i <= data.last_page; i++) {
            links.push({
                url: `?page=${i}&per_page=${perPage}&q=${data.query}`,
                label: i.toString(),
                active: i === data.current_page
            });
        }

        // Next page link
        links.push({
            url: data.current_page < data.last_page ? `?page=${data.current_page + 1}&per_page=${perPage}&q=${data.query}` : null,
            label: '>>',
            active: false
        });

        return links;
    };

    return (
        <div className='max-w-7xl mx-auto'>
            <div className='my-8'>
                <p className='text-3xl text-center font-bold text-red-700'></p>

                {/* Search dan Per Page Controls */}
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className='relative flex-1'>
                            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                                <svg aria-hidden='true' className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path>
                                </svg>
                            </div>
                            <input
                                type='search'
                                className='block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-red-500 focus:border-red-500'
                                placeholder='Cari Regulasi'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type='submit'
                                className='text-white absolute right-2.5 bottom-2.5 bg-accent hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2'>
                                Cari
                            </button>
                        </div>
                    </form>

                    {/* Per Page Selector */}
                    {/* <div className="flex items-center gap-2">
                        <label htmlFor="perPage" className="text-sm text-gray-600">
                            Items per page:
                        </label>
                        <select
                            id="perPage"
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value={4}>4</option>
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                            <option value={16}>16</option>
                            <option value={20}>20</option>
                        </select>
                    </div> */}
                </div>

                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="text-lg">Memuat regulasi...</div>
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

                        <div className='px-0 mx-auto mt-6 dark:text-white text-justify shadow-md'>
                            <div className='bg-accent text-center text-2xl text-white font-semibold rounded-t-lg'>Regulasi</div>
                            <div className='flex flex-col'>
                                {data.data.map((item: RegulasiItem) => (
                                    <div className='mx-4' key={item.id}>
                                        <div className='grid md:grid-cols-6 my-5'>
                                            <div className='bg-gray-100 md:col-span-4 flex flex-col md:flex-row rounded-lg border'>
                                                <img
                                                    src={`${BaseUrl}/uploads/${item.icon_regulasi}`}
                                                    className='w-28 p-2 mx-auto md:mx-0'
                                                    alt={item.nama_regulasi}
                                                />
                                                <div className='flex flex-col justify-center text-center md:text-left p-2 md-p-0'>
                                                    <p className='font-bold lg:text-xl text-accent'>{item.nama_regulasi}</p>
                                                    <p className='text-xs lg:text-sm'>
                                                        Diupload oleh: <span className='text-accent'>{item.role}</span> {FormatLongDate(item.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex flex-row md:justify-center md:gap-4 justify-between md:col-span-2 border-b border-gray-300 pb-2'>
                                                <div className='mt-4 col-span-1 flex'>
                                                    <a
                                                        href={`${BaseUrl}/uploads/${item.file_regulasi}`}
                                                        download 
                                                        className='text-xl py-2 px-8 text-accent mx-auto my-auto bg-gray-100 hover:bg-green-600 hover:text-white border border-accent rounded-3xl transition-colors duration-200'
                                                    >
                                                        <i className='fas fa-file-download'></i> Unduh
                                                    </a>
                                                </div>
                                                <div className='mt-4 col-span-1 flex'>
                                                    <a
                                                        href={`${UrlApi}/regulasi/view/${item.file_regulasi.split('/').pop()}`}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-xl py-2 px-8 text-accent mx-auto my-auto bg-gray-100 hover:bg-blue-600 hover:text-white border border-accent rounded-3xl transition-colors duration-200'
                                                    >
                                                        <i className='fas fa-eye'></i> Lihat
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.last_page > 1 && (
                                <div className="flex justify-center mt-8 mb-4">
                                    <Pagination
                                        links={generateLinks()}
                                        onPageChange={handlePageChange}
                                        currentPage={currentPage}
                                        lastPage={data.last_page}
                                    />
                                </div>
                            )}

                            {/* Info pagination */}
                            {data && (
                                <div className="mt-4 text-center text-sm text-gray-600 pb-4">
                                    Menampilkan {data.from} - {data.to} dari {data.total_items} data

                                </div>
                            )}
                        </div>
                    </>
                ) : !loading && (
                    <div className="flex justify-center py-8">
                        <div className="text-lg">Tidak ada regulasi ditemukan</div>
                    </div>
                )}
            </div>
        </div>
    );
}