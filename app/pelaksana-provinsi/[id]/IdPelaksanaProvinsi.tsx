'use client';
import { useEffect, useState } from "react";

import axios from "axios";
import Link from "next/link";
import { UrlApi } from "@/app/Components/apiUrl";
import { useParams } from "next/navigation";
import { BaseUrl } from "@/app/Components/baseUrl";

export default function IdPelaksanaProvinsi() {
    const { id } = useParams();
    const [ketum, setKetum]: any = useState();
    const [sekretaris, setSekretaris]: any = useState();
    const [waket, setWaket]: any = useState();
    const [kadiv, setKadiv]: any = useState();

    const getPelaksana = () => {
        axios
            .get(`${UrlApi}/pelaksana-provinsi/${id}`)
            .then((response: any) => {

                const ketuaUmum = response.data.find((item: any) => item.jabatan === 'Ketua');
                setKetum(ketuaUmum);
                const waket = response.data.find((item: any) => item.jabatan === 'Wakil Ketua');
                setWaket(waket);
                const sekretaris = response.data.find((item: any) => item.jabatan === 'Sekretaris',);
                setSekretaris(sekretaris); const semuaKaDiv = response.data.filter((item: any) => item.jabatan.startsWith('Kepala Divisi'),);
                setKadiv(semuaKaDiv);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    useEffect(() => {
        getPelaksana();
    }, []);
    return (
        <div>
            <div className='mb-8 border-t-4 border-b-4 bg-primary border-secondary md:header'>
                <div className='mx-auto max-w-[1275px] px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50'>
                            <span>
                                Pelaksana DPPI Provinsi{' '}
                                {ketum ? ketum.nama_provinsi : waket ? waket.nama_provinsi : sekretaris ? sekretaris.nama_provinsi : kadiv ? kadiv.nama_provinsi : ''}
                            </span>
                        </div>
                    </ul>
                </div>
            </div>
            <div className='px-2 max-w-[1275px] mb-8 mx-auto'>
                {ketum ? (
                    <div className='flex justify-center '>
                        <div className='bg-gray-200 rounded-md max-w-[300px] grid grid-cols-1 justify-center pb-4'>
                            <img src={BaseUrl + ketum.photo} alt='Photo Ketum Provinsi' className='max-w-[300px] rounded-t-md' />
                            <p className='text-center pt-2 font-semibold px-2'>{ketum.nama_lengkap}</p>
                            <p className='px-2 text-sm text-center'>{ketum.jabatan}</p>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {waket ? (
                    <div className='flex flex-row justify-center gap-5'>
                        <div className='mt-8 bg-gray-200 rounded-md max-w-[300px] grid grid-cols-1 justify-center pb-4'>
                            <img src={BaseUrl + waket.photo} alt='Photo waket Provinsi' className='max-w-[300px] rounded-t-md' />
                            <p className='text-center pt-2 font-semibold px-2'>{waket.nama_lengkap}</p>
                            <p className='px-2 text-sm text-center'>{waket.jabatan}</p>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {sekretaris ? (
                    <div className='flex justify-center '>
                        <div className='mt-8 bg-gray-200 rounded-md max-w-[300px] grid grid-cols-1 justify-center pb-4'>
                            <img src={BaseUrl + sekretaris.photo} alt='Photo sekretaris Provinsi' className='max-w-[300px] rounded-t-md' />
                            <p className='text-center pt-2 font-semibold px-2'>{sekretaris.nama_lengkap}</p>
                            <p className='px-2 text-sm text-center'>{sekretaris.jabatan}</p>
                        </div>
                    </div>
                ) : (
                    ''
                )}

                {kadiv ? (
                    <div className='flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 justify-center gap-5'>
                        {kadiv.map((item: any, index: number) => (
                            <div
                                key={item.nama_lengkap}
                                className={`mt-8 bg-gray-200 rounded-md max-w-[300px] grid grid-cols-1 mx-auto ${kadiv.length % 4 === 1 && index === kadiv.length - 1 ? 'md:col-span-2 lg:col-span-4 mx-auto' : ''
                                    }`}>
                                <img src={BaseUrl + item.photo} alt='Photo item Provinsi' className='max-w-[300px] rounded-t-md' />
                                <p className='text-center pt-2 font-semibold px-2'>{item.nama_lengkap}</p>
                                <p className='px-2 text-sm text-center'>{item.jabatan}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    ''
                )}
            </div>

        </div>

    );
}
