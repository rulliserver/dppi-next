// Galeri.tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { UrlApi } from '@/app/components/apiUrl';
import { BaseUrl } from '@/app/components/baseUrl';
import { useParams } from 'next/navigation';
import FormatLongDate from '@/app/components/FormatLongDate';

export default function ViewKegiatan() {
    const { slug } = useParams();
    const [kegiatan, setKegiatan]: any = useState();
    const getData = () => {

        axios
            .get(`${UrlApi}/kegiatan/${slug}`)
            .then((response: any) => {
                setKegiatan(response.data);
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
                    <div className='bg-accent text-center text-2xl text-white font-semibold rounded-t-lg'>Informasi Kegiatan</div>
                    {kegiatan &&
                        <div className='bg-white rounded-b-lg px-4 py-4'>
                            <p className='font-body font-semibold text-xl text-center mb-4'>{kegiatan.nama_kegiatan}</p>
                            <Image alt='Foto Kegiatan' src={BaseUrl + kegiatan.photo} className='mx-auto border-2 w-full md:w-125 border-black' width={400} height={200} />
                            <div className='grid grid-cols-12 mt-4 pt-4 border-t-2 border-black'>
                                <p className='col-span-4'>Lokasi Kegiatan</p>
                                <p className='col-span-1'>:</p>
                                <p className='col-span-7 text-left font-body '>{kegiatan.lokasi}</p>
                            </div>
                            <div className='grid grid-cols-12'>
                                <p className='col-span-4'>Biaya</p>
                                <p className='col-span-1'>:</p>
                                <p className='col-span-7 text-left font-body '>
                                    {kegiatan.biaya == 0 ? 'Gratis' : `Rp${kegiatan.biaya.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                </p>
                            </div>
                            <div className='grid grid-cols-12'>
                                <p className='col-span-4'>Waktu Kegiatan</p>
                                <p className='col-span-1'>:</p>
                                <p className='col-span-7 text-left font-body '>
                                    {FormatLongDate(kegiatan.tanggal)} Pukul: {kegiatan.jam.slice(0, 5)}
                                </p>
                            </div>
                            <div className='grid grid-cols-12'>
                                <p className='col-span-4'>Batas Pendaftaran</p>
                                <p className='col-span-1'>:</p>
                                <p className='col-span-7 text-left font-body '>{FormatLongDate(kegiatan.batas_pendaftaran)}</p>
                            </div>
                            <div className='grid grid-cols-12'>
                                <p className='col-span-4'>Link Pendaftaran</p>
                                <p className='col-span-1'>:</p>
                                <p className='col-span-7 text-left font-body '>
                                    {kegiatan.status == 'Pendaftaran Ditutup' ? kegiatan.status : <a href={kegiatan.link_pendaftaran} className='text-blue-600 underline'>Ikuti Kegiatan</a>}
                                </p>
                            </div>
                            {kegiatan.map ? (
                                <div className='grid md:grid-cols-12'>
                                    <p className='col-span-4'>Peta Lokasi</p>
                                    <p className='col-span-1 hidden md:block'>:</p>
                                    <a href={kegiatan.map} target='_blank' rel='noopener noreferrer' className='text-blue-500 underline'>
                                        Ikuti Map
                                    </a>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}