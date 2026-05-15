'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { UrlApi } from '../components/apiUrl';
import { BaseUrl } from '../components/baseUrl';

export default function MajelisPertimbangan() {
    const [mp, setMp]: any = useState();
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);

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



    const handleImageClick = (member: any) => {
        setSelectedMember(member);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedMember(null);
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
                                <div
                                    onClick={() => handleImageClick(mp)}
                                    className='cursor-pointer'
                                >
                                    <Image
                                        src={BaseUrl + mp.photo}
                                        alt='Photo Majelis Pertimbangan'
                                        className='max-w-75 rounded-t-md hover:opacity-80 transition-opacity'
                                        width={300}
                                        height={100}
                                    />
                                </div>
                                <p className='text-center pt-2 font-semibold px-2'>{mp.nama_lengkap}</p>
                                <p className='text-sm text-center px-2'>{mp.jabatan}</p>
                            </div>
                        </div>
                    </div>
                )
                : ''}

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
                        <div className='p-6'>
                            <div className='flex justify-center mb-4'>
                                <Image
                                    src={BaseUrl + selectedMember.photo}
                                    alt={selectedMember.nama_lengkap}
                                    className='rounded-lg object-cover'
                                    width={200}
                                    height={200}
                                />
                            </div>

                            <h3 className='text-xl font-bold text-center mb-4'>
                                {selectedMember.nama_lengkap}
                            </h3>

                            <div className='space-y-3'>
                                <div className='border-b pb-2'>
                                    <p className='text-sm text-gray-500'>Provinsi</p>
                                    <p className='font-medium'>{selectedMember.nama_provinsi}</p>
                                </div>

                                <div className='border-b pb-2'>
                                    <p className='text-sm text-gray-500'>Tingkat Penugasan</p>
                                    <p className='font-medium'>{selectedMember.tingkat_penugasan}</p>
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
            )}
        </div>
    );
}