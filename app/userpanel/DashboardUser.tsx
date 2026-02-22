'use client';

import { useEffect, useState } from "react";
import { BaseUrl } from "../components/baseUrl";
import { useUser } from "../components/UserContext";
import axios from "axios";
import { UrlApi } from "../components/apiUrl";
import Image from "next/image";

export default function Userpanel() {
    const { user } = useUser();
    const [loading, setLoading]: any = useState(false);
    const [pdp, setPdp]: any = useState();
    const fetchPdp = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${UrlApi}/userpanel/pdp/${user?.id_pdp}`, {
                withCredentials: true
            });
            setPdp(response.data);


        } catch (err) {
            console.error(err);
        }
        setLoading(false)
    };
    useEffect(() => {

        if (user) fetchPdp();
    }, [user, setPdp]);
    return (
        <>

            <div className='mt-4'>
                <p className='text-center md:text-xl font-medium'>SELAMAT DATANG DI</p>
                <p className='text-center md:text-xl font-semibold'>SISTEM INFORMASI MANAJEMEN TALENTA PURNAPASKIBRAKA DUTA PANCASILA</p>
                <p className='text-center text-xl md:text-2xl font-bold text-accent'>SIMENTAL PERKASA</p>
            </div>
            {pdp ?
                <div className='mt-8 bg-white shadow-md shadow-gray-300 '>
                    <div className='px-4 pt-4 md:flex md:flex-row md:justify-between'>
                        <div className='md:flex md:flex-row'>
                            <div>
                                {pdp.photo ? (
                                    <Image src={BaseUrl + pdp.photo} alt={`Photo`} width={40} height={40} className='h-40 w-40 mx-auto md:mr-3 rounded-full object-contain border-2 border-accent' />
                                ) : (
                                    <img src='/assets/images/logo-dppi.png' className='h-40 w-40 mx-auto md:mr-3 rounded-full object-contain border-2 border-accent' />
                                )}
                                <p className='text-center text-red-500 text-sm font-semibold'>ID: {pdp.id}</p>
                            </div>
                            <div>
                                <p className='mx-4 text-center text-base md:text-left md:text-3xl font-semibold'>{pdp.nama_lengkap}</p>
                                <p className='mx-4 text-center text-base md:text-left md:text-xl font-semibold'>NRA. {pdp.no_simental}</p>
                                {pdp.tingkat_kepengurusan ? (
                                    <div className='mx-4 font-semibold'>
                                        {pdp.tingkat_kepengurusan == 'Pelaksana Tingkat Kabupaten/Kota' ? (
                                            <div className='my-4'>
                                                <p>{pdp.tingkat_kepengurusan}</p>
                                                <p className='text-accent'>{pdp.kabupaten}</p>
                                            </div>
                                        ) : (
                                            <div className='my-4'>
                                                <p>{pdp.tingkat_kepengurusan}</p>
                                                <p className='text-accent'>{pdp.provinsi}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className='mx-4 my-4 font-semibold'>
                                        {pdp.posisi === 'Majelis Pertimbangan DPPI' ? 'Majelis Pertimbangan DPPI' : `${pdp.posisi} ${pdp.tingkat_penugasan}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        <img src='/assets/images/logo-dppi.png' alt='Logo DPPI' className='w-40 h-40 my-8 mx-auto md:mx-0 md:my-0' />
                    </div>
                    <div className='px-4 mt-8 lg:mt-0 pb-4 lg:flex lg:flex-row lg:justify-start 1xl:ml-48 lg:gap-2'>
                        <div className='flex flex-row'>
                            <div>
                                <i className='fas fa-id-card text-lg text-white bg-accent py-1 mr-2 rounded-full px-2' />
                            </div>
                            <div className='mr-8 font-semibold'>
                                <p className='text-gray-500'>Alamat</p>
                                <p className='text-accent'>
                                    {pdp.alamat} {pdp.kabupaten}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-row'>
                            <div>
                                <i className='fas fa-envelope text-lg text-white bg-accent py-1 mr-2 rounded-full px-2' />
                            </div>
                            <div className='mr-8 font-semibold'>
                                <p className='text-gray-500'>Email</p>
                                <p className='text-accent'>{pdp.email}</p>
                            </div>
                        </div>
                        <div className='flex flex-row'>
                            <div>
                                <i className='fas fa-phone text-lg text-white bg-accent py-1 mr-2 rounded-full px-2' />
                            </div>
                            <div className='mr-8 font-semibold'>
                                <p className='text-gray-400'>Telepon</p>
                                <p className='text-accent'>{pdp.telepon}</p>
                            </div>
                        </div>
                    </div>
                </div>
                : <div>{loading}</div>}
        </>
    );
}
