'use client';

import { useEffect, useState } from "react";
import { UrlApi } from "../components/apiUrl";
import axios from "axios";
import { BaseUrl } from "../components/baseUrl";
import Image from "next/image";

export default function MajelisPertimbangan() {
    const [mp, setMp]: any = useState();
    console.log(mp);

    const getMp = () => {
        axios
            .get(`${UrlApi}/majelis-pertimbangan`)
            .then((response: any) => {
                setMp(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    useEffect(() => {
        getMp();
    }, []);
    return (
        <div>
            <div className='mb-8 border-t-4 border-b-4 bg-primary border-secondary md:header'>
                <div className='mx-auto max-w-318.75 px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50'>
                            <span>Majelis Pertimbangan DPPI</span>
                        </div>
                    </ul>
                </div>
            </div>
            {mp ?
                mp.map((mp: any, index: any) =>
                    <div key={index} className='px-2 max-w-318.75 mb-8 mx-auto'>
                        <div className='flex justify-center '>
                            <div className='bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <Image src={BaseUrl + mp.photo} alt='Photo Majelis Pertimbangan' className='max-w-75 rounded-t-md' width={300} height={100} />
                                <p className='text-center pt-2 font-semibold px-2'>{mp.nama_lengkap}</p>
                                <p className='text-sm text-center px-2'>{mp.jabatan}</p>
                            </div>
                        </div>

                    </div>
                )
                : ''}
        </div>
    );
}