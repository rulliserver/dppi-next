'use client';
import { useEffect, useState } from "react";

import axios from "axios";
import Link from "next/link";
import { UrlApi } from "@/app/components/apiUrl";
import { useParams } from "next/navigation";
import { BaseUrl, getImageUrl } from "@/app/components/baseUrl";
import Image from "next/image";

export default function IdPelaksanaProvinsi() {
    const { id } = useParams();
    const [ketum, setKetum]: any = useState();
    const [sekretaris, setSekretaris]: any = useState();
    const [waket, setWaket]: any = useState();
    const [kadiv, setKadiv]: any = useState();
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleImageClick = (member: any) => {
        setSelectedMember(member);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedMember(null);
    };

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
                <div className='mx-auto max-w-318.75 px-2'>
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
            <div className='px-2 max-w-318.75 mb-8 mx-auto'>
                {ketum ? (
                    <div className='flex justify-center '>
                        <div
                            onClick={() => handleImageClick(ketum)}
                            className='cursor-pointer'
                        >
                            <div className='bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <img src={getImageUrl(ketum.photo)} alt='Photo Ketum Provinsi' className='max-w-75 rounded-t-md' />
                                <p className='text-center pt-2 font-semibold px-2'>{ketum.nama_lengkap}</p>
                                <p className='px-2 text-sm text-center'>{ketum.jabatan}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {waket ? (
                    <div className='flex flex-row justify-center gap-5'>
                        <div
                            onClick={() => handleImageClick(waket)}
                            className='cursor-pointer'
                        >
                            <div className='mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <img src={getImageUrl(waket.photo)} alt='Photo waket Provinsi' className='max-w-75 rounded-t-md' />
                                <p className='text-center pt-2 font-semibold px-2'>{waket.nama_lengkap}</p>
                                <p className='px-2 text-sm text-center'>{waket.jabatan}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {sekretaris ? (
                    <div className='flex justify-center '>
                        <div
                            onClick={() => handleImageClick(sekretaris)}
                            className='cursor-pointer'
                        >
                            <div className='mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 justify-center pb-4'>
                                <img src={getImageUrl(sekretaris.photo)} alt='Photo sekretaris Provinsi' className='max-w-75 rounded-t-md' />
                                <p className='text-center pt-2 font-semibold px-2'>{sekretaris.nama_lengkap}</p>
                                <p className='px-2 text-sm text-center'>{sekretaris.jabatan}</p>
                            </div>
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
                                className={`mt-8 bg-gray-200 rounded-md max-w-75 grid grid-cols-1 mx-auto ${kadiv.length % 4 === 1 && index === kadiv.length - 1 ? 'md:col-span-2 lg:col-span-4 mx-auto' : ''
                                    }`}>
                                <div
                                    onClick={() => handleImageClick(item)}
                                    className='cursor-pointer'
                                >
                                    <img src={getImageUrl(item.photo)} alt='Photo item Provinsi' className='max-w-75 rounded-t-md' />
                                    <p className='text-center pt-2 font-semibold px-2'>{item.nama_lengkap}</p>
                                    <p className='px-2 text-sm text-center'>{item.jabatan}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    ''
                )}

            </div>

            {/* Popup Modal */}
            {showPopup && selectedMember && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg max-w-md w-full mx-4 relative'>
                        {/* Tombol Close */}
                        <button
                            onClick={closePopup}
                            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl'
                        >
                            &times;
                        </button>

                        {/* Konten Popup */}
                        <div className='p-4'>
                            <div className='flex justify-center mb-4'>
                                <Image
                                    src={getImageUrl(selectedMember.photo)}
                                    alt={selectedMember.nama_lengkap}
                                    className='rounded-lg object-cover'
                                    width={150}
                                    height={200}
                                />
                            </div>


                            <h3 className='text-xl font-bold text-center mb-4'>
                                {selectedMember.nama_lengkap}
                            </h3>

                            <div className='space-y-3'>
                                {selectedMember.asal_sma ?
                                    <div className='border-b pb-2'>
                                        <p className='text-sm text-gray-500'>Asal SMA/SMK/MA</p>
                                        <p className='font-medium'>{selectedMember.asal_sma}</p>
                                    </div>
                                    : <></>}
                                <div className='border-b pb-2'>
                                    <p className='text-sm text-gray-500'>Tingkat Penugasan</p>
                                    <p className='font-medium'>{selectedMember.tingkat_penugasan === "Paskibraka Tingkat Kabupaten/Kota" ? "Paskibraka Tingkat " + selectedMember.nama_kabupaten : selectedMember.tingkat_penugasan === "Paskibraka Tingkat Provinsi" ? "Paskibraka Tingkat Provinsi " + selectedMember.nama_provinsi : selectedMember.tingkat_penugasan === "Paskibraka Tingkat Pusat" ? selectedMember.tingkat_penugasan : ""}</p>
                                </div>


                                <div className='border-b pb-2'>
                                    <p className='text-sm text-gray-500'>Tahun Tugas</p>
                                    <p className='font-medium'>{selectedMember.thn_tugas}</p>
                                </div>

                                <div>
                                    <p className='text-sm text-gray-500'>Jabatan</p>
                                    <p className='font-medium'>{selectedMember.jabatan}</p>
                                </div>
                            </div>

                            <button
                                onClick={closePopup}
                                className='mt-6 w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors'
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div>

    );
}
