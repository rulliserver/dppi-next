'use client';
import { useEffect, useState } from "react";
import { UrlApi } from "../Components/apiUrl";
import axios from "axios";
import Link from "next/link";

export default function PelaksanaKabupatenProvinsi() {
    const [provinsi, setProvinsi]: any = useState();
    const getPelaksana = () => {
        axios
            .get(`${UrlApi}/pelaksana-kabupaten/provinsi`)
            .then((response: any) => {
                setProvinsi(response.data.provinsi);
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
                            <span>Pelaksana DPPI Kabupaten</span>
                        </div>
                    </ul>
                </div>
            </div>
            <div className='px-2 max-w-[1275px] mb-8 mx-auto'>
                <p className='text-center font-semibold dark:text-white mb-4'>PILIH PROVINSI</p>
                <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2'>
                    {provinsi && provinsi.map((item: any) =>
                        item.id_provinsi ? (
                            <Link
                                key={item.nama_provinsi}
                                href={`/pelaksana-kabupaten/provinsi/${item.id_provinsi}`}
                                className='hover:bg-accent text-sm text-center py-4 inline-block align-middle px-2 bg-red-700 rounded-md text-white'>
                                {item.nama_provinsi}
                            </Link>
                        ) : (
                            <p key={item.nama_provinsi} className='text-sm py-4 text-center px-2 bg-gray-400 rounded-md text-white'>
                                {item.nama_provinsi}
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>

    );
}
