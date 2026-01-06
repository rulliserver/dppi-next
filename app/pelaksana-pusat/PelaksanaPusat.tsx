'use client';

import { useEffect, useState } from "react";
import { UrlApi } from "../components/apiUrl";
import axios from "axios";
import { BaseUrl } from "../components/baseUrl";
import Image from "next/image";

export default function PelaksanaPusat() {
    const [pelaksana, setPelaksana]: any = useState();
    const [ketum, setKetum]: any = useState();
    const [sekjen, setSekjen]: any = useState();
    const [waket1, setWaket1]: any = useState();
    const [waket2, setWaket2]: any = useState();
    const [kadep, setKadep]: any = useState();

    const getPelaksana = () => {
        axios
            .get(`${UrlApi}/pelaksana-pusat`)
            .then((response: any) => {
                setPelaksana(response.data);
                const ketuaUmum = response.data.find((item: any) => item.jabatan === 'Ketua Umum');
                setKetum(ketuaUmum);
                const waketSatu = response.data.find((item: any) => item.jabatan === 'Wakil Ketua I');
                setWaket1(waketSatu);
                const waketDua = response.data.find((item: any) => item.jabatan === 'Wakil Ketua II');
                setWaket2(waketDua);
                const sekJen = response.data.find((item: any) => item.jabatan === 'Sekretaris Jenderal',);
                setSekjen(sekJen); const semuaKaDep = response.data.filter((item: any) => item.jabatan.startsWith('Kepala Departemen'),);
                setKadep(semuaKaDep);
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
                <div className='mx-auto max-w-318.75 px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50'>
                            <span>Pelaksana DPPI Pusat</span>
                        </div>
                    </ul>
                </div>
            </div>
            {pelaksana ?

                <div className='px-2 max-w-318.75 mb-8 mx-auto'>
                    <div className='flex justify-center '>
                        <div className='bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                            <Image src={BaseUrl + ketum.photo} alt='Photo Ketum Pusat' className='max-w-75 rounded-t-md' width={300} height={100} />
                            <p className='text-center pt-2 font-semibold px-2'>{ketum.nama_lengkap}</p>
                            <p className='text-sm text-center px-2'>{ketum.jabatan}</p>
                        </div>
                    </div>
                    <div className='flex flex-col md:flex-row justify-center gap-5'>
                        <div className='flex justify-center '>
                            <div className='mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <Image src={BaseUrl + waket1.photo} alt='Photo waket1 Pusat' className='max-w-75 rounded-t-md' width={300} height={100} />
                                <p className='text-center pt-2 font-semibold px-2'>{waket1.nama_lengkap}</p>
                                <p className='text-sm text-center px-2'>{waket1.jabatan}</p>
                            </div>
                        </div>
                        <div className='flex justify-center '>
                            <div className='mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <Image src={BaseUrl + waket2.photo} alt='Photo waket2 Pusat' className='max-w-75 rounded-t-md' width={300} height={100} />
                                <p className='text-center pt-2 font-semibold px-2'>{waket2.nama_lengkap}</p>
                                <p className='text-sm text-center px-2'>{waket2.jabatan}</p>
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-center '>
                        <div className='mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                            <Image src={BaseUrl + sekjen.photo} alt='Photo sekjen Pusat' className='max-w-75 rounded-t-md' width={300} height={100} />
                            <p className='text-center pt-2 font-semibold px-2'>{sekjen.nama_lengkap}</p>
                            <p className='text-sm text-center px-2'>{sekjen.jabatan}</p>
                        </div>
                    </div>

                    <div className='flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 justify-center gap-5'>
                        {kadep.map((item: any, index: number) => (
                            <div
                                key={item.nama_lengkap}
                                className={`mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 mx-auto ${kadep.length % 4 === 1 && index === kadep.length - 1 ? 'md:col-span-2 lg:col-span-4 mx-auto' : ''
                                    }`}>
                                <Image src={BaseUrl + item.photo} alt='Photo item Pusat' className='max-w-75 rounded-t-md' width={300} height={100} />
                                <p className='text-center pt-2 font-semibold px-2'>{item.nama_lengkap}</p>
                                <p className='text-sm text-center px-2'>{item.jabatan}</p>
                            </div>
                        ))}
                    </div>
                </div>
                : ''}
        </div>
    );
}