// Galeri.tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Pagination from '../Components/Pagination';
import axios from 'axios';
import { UrlApi } from '../Components/apiUrl';
import { BaseUrl } from '../Components/baseUrl';
import Link from 'next/link';

export default function KegiatanList() {
    const [kegiatan, setKegiatan]: any = useState();
    const getData = () => {

        axios
            .get(`${UrlApi}/kegiatan`)
            .then((response: any) => {
                setKegiatan(response.data);
                console.log(response.data);

            })
            .catch((error) => {
                console.error('Error fetching gallery data:', error);
            });
    };

    useEffect(() => {
        getData();
    }, [])



    return (
        <div className='max-w-7xl mx-auto'>
            <div className='my-8'>
                <p className='text-3xl text-center font-bold text-red-700'></p>
                <div className='px-0 mx-auto mt-6 dark:text-white text-justify shadow-md'>
                    <div className='bg-red-600 text-center text-2xl text-white font-semibold rounded-t-lg'>Informasi Kegiatan</div>
                    <div className='grid grid-cols-1 gap-1 mx-2 my-4 lg:mx-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'>
                        {kegiatan && kegiatan.map((item: any) => {
                            return (
                                <div key={item.id} className='relative mb-4 overflow-hidden rounded-md bg-gray-50'>
                                    <Link href={`/kegiatan/${item.slug}`}>
                                        <div className='absolute top-0 right-0 justify-center mx-auto my-0 overflow-hidden text-center justify-items-center'>
                                            <div className='h-8 w-full py-2 px-2 my-0 text-xs text-center text-white bg-black/70 xl:text-sm font-seibold'>
                                                {item.biaya == 0 ? 'Gratis' : item.biaya.toLocaleString()}
                                            </div>
                                        </div>
                                        <Image className='object-cover h-full 2xl:max-h-96 w-[30em] ' src={`${BaseUrl}/uploads/${item.photo}`} alt='Foto Kegiatan' width={400} height={200} />
                                        <div className='absolute bottom-0 justify-center w-full mx-auto my-0 overflow-hidden text-center rounded-b-md justify-items-center'>
                                            <div className='h-16 w-full py-2 px-2 my-0 text-xs text-center text-white bg-black/70 xl:text-sm font-seibold'>
                                                {item.nama_kegiatan}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}