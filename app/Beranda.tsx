'use client';

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UrlApi } from '@/app/components/apiUrl';
import { BaseUrl, getImageUrl } from '@/app/components/baseUrl';
import SlideBerita from '@/app/components/SlideBerita';
import Peta from '@/app/components/Peta';
import Image from "next/image";
import RatingForm from '@/app/components/RatingForm';
import RatingStats from '@/app/components/RatingStats';
import RatingDisplay from '@/app/components/RatingDisplay';
import AnnouncementPopup from '@/app/components/AnnouncementPopup';
import { log } from "console";
import ChatWidget from '@/app/components/ChatWidget';

export default function Beranda() {
    const [video, setVideo]: any = useState();
    const [berita, setBerita]: any = useState();
    const [kegiatan, setKegiatan]: any = useState();
    const [gallery, setGallery]: any = useState();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [dataPDPProv, setDataPDPProv] = useState();
    const [dataPDPKab, setDataPDPKab] = useState();
    const [dataProv, setDataProv] = useState();
    const [dataKab, setDataKab] = useState();
    const [sessionId, setSessionId] = useState<string>('');

    // State untuk data daerah yang sudah dilantik
    const [dilantikProv, setDilantikProv]: any = useState();
    const [dilantikKab, setDilantikKab]: any = useState();

    // State untuk tab aktif (default: 'peta')
    const [activeTab, setActiveTab] = useState<'peta' | 'provinsi' | 'kabupaten'>('peta');

    // State untuk pencarian
    const [searchProvinsi, setSearchProvinsi] = useState('');
    const [searchKabupaten, setSearchKabupaten] = useState('');

    useEffect(() => {
        // Ambil sessionId dari localStorage
        const savedSessionId = localStorage.getItem('visitor_session_id');
        if (savedSessionId) {
            setSessionId(savedSessionId);
        }
    }, []);

    const handleRatingSuccess = () => {
        // Refresh stats setelah submit berhasil
        window.location.reload();
    };

    const getVideo = () => {
        axios
            .get(`${UrlApi}/video`)
            .then((response: any) => {
                setVideo(response.data[0]);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getBerita = () => {
        axios
            .get(`${UrlApi}/berita`)
            .then((response: any) => {
                setBerita(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getKegiatan = () => {
        axios
            .get(`${UrlApi}/kegiatan`)
            .then((response: any) => {
                setKegiatan(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getGallery = () => {
        axios
            .get(`${UrlApi}/all-gallery`)
            .then((response: any) => {
                setGallery(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getDataPDPProvinsi = () => {
        axios
            .get(`${UrlApi}/pdp-provinsi`)
            .then((response: any) => {
                setDataPDPProv(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getDataPDPKabupaten = () => {
        axios
            .get(`${UrlApi}/pdp-kabupaten`)
            .then((response: any) => {
                setDataPDPKab(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getDataProvinsi = () => {
        axios
            .get(`${UrlApi}/provinsi`)
            .then((response: any) => {
                setDataProv(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getDataKabupaten = () => {
        axios
            .get(`${UrlApi}/kabupaten`)
            .then((response: any) => {
                setDataKab(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    // API call untuk data daerah yang sudah dilantik (Provinsi)
    const getDilantikProvinsi = () => {
        axios
            .get(`${UrlApi}/dppi-dilantik/provinsi`)
            .then((response: any) => {
                setDilantikProv(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data dilantik provinsi:', error);
                // Set default empty array jika endpoint belum tersedia
                setDilantikProv([]);
            });
    };

    // API call untuk data daerah yang sudah dilantik (Kabupaten)
    const getDilantikKabupaten = () => {
        axios
            .get(`${UrlApi}/dppi-dilantik/kabupaten`)
            .then((response: any) => {
                setDilantikKab(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data dilantik kabupaten:', error);
                // Set default empty array jika endpoint belum tersedia
                setDilantikKab([]);
            });
    };

    const [pengumuman, setPengumuman]: any = useState();
    const getPengumuman = () => {
        axios.get(`${UrlApi}/pengumuman`)
            .then((response: any) => {
                if (response.data) {
                    setPengumuman(response.data);
                } else {
                    setPengumuman(null);
                }
            })
            .catch((error) => {
                console.error('Error fetching pengumuman:', error);
                setPengumuman(null);
            });
    }

    useEffect(() => {
        getVideo();
        getBerita();
        getKegiatan();
        getGallery();
        getDataPDPProvinsi();
        getDataPDPKabupaten();
        getDataProvinsi();
        getDataKabupaten();
        getPengumuman();
        getDilantikProvinsi(); // Tambahan
        getDilantikKabupaten(); // Tambahan
    }, []);

    // Filter data provinsi berdasarkan pencarian
    const filteredProvinsi = dilantikProv && Array.isArray(dilantikProv)
        ? dilantikProv.filter((prov: any) => {
            const namaProvinsi = (prov.nama_provinsi || prov.name || prov.nama || '').toLowerCase();
            return namaProvinsi.includes(searchProvinsi.toLowerCase());
        })
        : [];

    // Filter data kabupaten berdasarkan pencarian
    const filteredKabupaten = dilantikKab && Array.isArray(dilantikKab)
        ? dilantikKab.filter((kab: any) => {
            const namaKabupaten = (kab.nama_kabupaten || kab.name || kab.nama || '').toLowerCase();
            return namaKabupaten.includes(searchKabupaten.toLowerCase());
        })
        : [];



    return (
        <div>
            {pengumuman ? <AnnouncementPopup pengumuman={pengumuman?.announce} /> : null}

            <div className='w-full max-h-150 2xl:max-h-187.5 flex justify-center'>
                {video ?
                    <video src={BaseUrl + video.file_video.replace('/uploads', 'uploads')} className='w-full object-cover' loop autoPlay={true} muted />
                    :
                    <Image src='/assets/images/capture.png' width='1980' height='800' alt="" />
                }
            </div>

            <div className='max-w-7xl mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2'>
                    <div>
                        {/* card */}
                        <div className='flex flex-col mt-2 mb-0 md:flex-row text-white'>
                            <div className='relative max-w-[320px] px-2 flex flex-row mx-auto'>
                                <svg xmlns='http://www.w3.org/2000/svg' width='320px' height='425.38px' version='1.1' viewBox='0 0 732.58 973.88'>
                                    <g id='Layer_x0020_1'>
                                        <path
                                            className='fil0'
                                            d='M89.64 0.19l341.74 0c0,0 94.19,-8.35 94.19,84.76 0,30.31 11.04,58.04 29.31,79.41 3.07,3.98 6.58,7.64 10.54,10.89 21.73,19.84 50.65,31.95 82.4,31.95 52.13,0 84.76,-8.06 84.76,91.3l0 585.74c0,49.3 -40.34,89.64 -89.64,89.64l-553.3 0c-49.3,0 -89.64,-40.34 -89.64,-89.64l0 -794.41c0,-49.3 40.34,-89.64 89.64,-89.64z'
                                        />
                                    </g>
                                    <image href='/assets/images/logo-dppi.png' x='530' y='0' width='200' height='200' />
                                </svg>

                                <div className='absolute mt-10 mx-4'>
                                    <p className='font-extrabold text-2xl'>Apa itu PDP?</p>
                                    <p className='mt-12 '>
                                        Purnapaskibraka Duta Pancasila adalah Purnapaskibraka yang telah mengikuti internalisasi pembinaan ideologi Pancasila dan ditetapkan oleh
                                        Kepala BPIP...
                                    </p>
                                </div>
                                <div className='absolute bottom-5 right-24 text-black mx-4'>
                                    <Link href='/profil' className='text-white'>
                                        Selengkapnya <i className='fas fa-arrow-right' />
                                    </Link>
                                </div>
                            </div>

                            <div className='relative max-w-[320px] px-2 flex flex-row mx-auto'>
                                <svg xmlns='http://www.w3.org/2000/svg' width='320px' height='425.38px' version='1.1' viewBox='0 0 732.58 973.88'>
                                    <g id='Layer_x0020_1'>
                                        <path
                                            className='fil0'
                                            d='M89.64 0.19l341.74 0c0,0 94.19,-8.35 94.19,84.76 0,30.31 11.04,58.04 29.31,79.41 3.07,3.98 6.58,7.64 10.54,10.89 21.73,19.84 50.65,31.95 82.4,31.95 52.13,0 84.76,-8.06 84.76,91.3l0 585.74c0,49.3 -40.34,89.64 -89.64,89.64l-553.3 0c-49.3,0 -89.64,-40.34 -89.64,-89.64l0 -794.41c0,-49.3 40.34,-89.64 89.64,-89.64z'
                                        />
                                    </g>
                                    <image href='/assets/images/logo-dppi.png' x='530' y='0' width='200' height='200' />
                                </svg>

                                <div className='absolute mt-10 mx-4'>
                                    <p className='font-extrabold text-2xl'>Apa Peran PDP?</p>
                                    <p className='mt-12 '>
                                        Memegang teguh konsensus berbangsa dan bernegara, yaitu Pancasila, Undang-undang Dasar Negara Republik Indonesia Tahun 1945, Negara Kesatuan
                                        Republik Indonesia, dan Bhinneka Tunggal Ika...
                                    </p>
                                </div>
                                <div className='absolute bottom-5 right-24 text-black mx-4'>
                                    <Link href='/profil' className='text-white'>
                                        Selengkapnya <i className='fas fa-arrow-right' />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className='relative w-full px-4 grid md:grid-cols-2 gap-4'>
                            <Link href='/register' className='bg-[#c40010] text-white mx-auto hover:bg-red-700 text-center mt-2 px-8 rounded-2xl py-4 w-full lg:w-75'>
                                Registrasi
                            </Link>
                            <a href='/auth/login' className='bg-[#c40010] text-white hover:bg-red-700 mx-auto text-center mt-2 px-8 rounded-2xl py-4 w-full lg:w-75'>
                                Masuk
                            </a>
                        </div>
                    </div>
                    <div className='mb-2 mt-10 mx-2'>
                        <p className='text-3xl text-center font-bold text-red-700 mb-4'>
                            Berita <span className='text-black dark:text-white'> Terbaru</span>
                        </p>
                        <SlideBerita berita={berita}></SlideBerita>
                    </div>
                </div>

                {/* Tabs untuk Peta dan Data Daerah Dilantik */}
                <div className="mt-8">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('peta')}
                            className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'peta'
                                ? 'text-red-700 border-b-2 border-red-700'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            🗺️ Peta Sebaran PDP
                        </button>
                        <button
                            onClick={() => setActiveTab('provinsi')}
                            className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'provinsi'
                                ? 'text-red-700 border-b-2 border-red-700'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Sebaran DPPI Provinsi
                        </button>
                        <button
                            onClick={() => setActiveTab('kabupaten')}
                            className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'kabupaten'
                                ? 'text-red-700 border-b-2 border-red-700'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Sebaran DPPI Kabupaten
                        </button>
                    </div>

                    {/* Tab Content - Peta */}
                    {activeTab === 'peta' && (
                        <div className="pt-6">
                            <Peta
                                DataPdpProv={dataPDPProv}
                                DataPdpKab={dataPDPKab}
                                kab={dataKab}
                                prov={dataProv}
                            />
                        </div>
                    )}

                    {/* Tab Content - Data Daerah Yang Sudah Dilantik Provinsi */}
                    {activeTab === 'provinsi' && (
                        <div className="pt-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-2xl font-bold text-center mb-8">
                                    Sebaran DPPI Provinsi <span className="text-red-600">Yang Terbentuk</span>
                                </h3>

                                {/* Input Pencarian Provinsi */}
                                <div className="mb-6">
                                    <div className="relative">

                                        <input
                                            type="text"
                                            placeholder="Cari provinsi..."
                                            value={searchProvinsi}
                                            onChange={(e) => setSearchProvinsi(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                        />
                                        {searchProvinsi && (
                                            <button
                                                onClick={() => setSearchProvinsi('')}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Data Provinsi */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-8 bg-red-700 rounded"></div>
                                        <h4 className="text-xl font-semibold">Provinsi</h4>
                                        <span className="bg-green-100 text-red-800 text-sm px-2 py-1 rounded-full">
                                            {filteredProvinsi.length} dari {dilantikProv && Array.isArray(dilantikProv) ? dilantikProv.length : 0} Provinsi
                                        </span>
                                    </div>

                                    {filteredProvinsi.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                                            {filteredProvinsi.map((prov: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                                                    onClick={() => window.location.href = `/pelaksana-provinsi/${prov.id_provinsi}`}
                                                >
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span className="text-gray-700">{prov.nama_provinsi || prov.name || prov.nama}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>{searchProvinsi ? `Tidak ditemukan provinsi dengan nama "${searchProvinsi}"` : "Belum ada data DPPI provinsi yang terbentuk"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content - Data Daerah Yang Sudah Dilantik Kabupaten */}
                    {activeTab === 'kabupaten' && (
                        <div className="pt-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-2xl font-bold text-center mb-8">
                                    Sebaran DPPI Kabupaten <span className="text-red-600">Yang Terbentuk</span>
                                </h3>

                                {/* Input Pencarian Kabupaten */}
                                <div className="mb-6">
                                    <div className="relative">

                                        <input
                                            type="text"
                                            placeholder="Cari kabupaten/kota..."
                                            value={searchKabupaten}
                                            onChange={(e) => setSearchKabupaten(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                        />
                                        {searchKabupaten && (
                                            <button
                                                onClick={() => setSearchKabupaten('')}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Data Kabupaten */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-8 bg-red-700 rounded"></div>
                                        <h4 className="text-xl font-semibold">Kabupaten</h4>
                                        <span className="bg-green-100 text-red-800 text-sm px-2 py-1 rounded-full">
                                            {filteredKabupaten.length} dari {dilantikKab && Array.isArray(dilantikKab) ? dilantikKab.length : 0} Kabupaten/Kota
                                        </span>
                                    </div>

                                    {filteredKabupaten.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                                            {filteredKabupaten.map((kab: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                                                    onClick={() => window.location.href = `/pelaksana-kabupaten/kabupaten/${kab.id_kabupaten}`}
                                                >
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span className="text-gray-700">{kab.nama_kabupaten || kab.name || kab.nama}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>{searchKabupaten ? `Tidak ditemukan kabupaten/kota dengan nama "${searchKabupaten}"` : "Belum ada data DPPI kabupaten yang terbentuk"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-12 text-2xl text-center font-black">-PORTAL PENDAFTARAN PERTAMA KALI DPPI DAERAH-</p>
                <h4 className="font-semibold text-blue-800 mt-4 mb-2">Template Dokumen Lampiran</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                    <a
                        href={`${BaseUrl}` + `uploads/assets/lampiran_1.docx`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        download
                    >
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Template Surat Sekda</span>
                    </a>

                    <a
                        href={`${BaseUrl}` + `uploads/assets/lampiran_2.docx`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        download
                    >
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Template DRH</span>
                    </a>

                    <a
                        href={`${BaseUrl}` + `uploads/assets/lampiran_3.docx`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        download
                    >
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Template Portofolio</span>
                    </a>
                    <a
                        href={`${BaseUrl}` + `uploads/assets/sk_nomor_50_pertama_kali.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        download
                    >
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700 font-medium">SK No. 50 - Tata Cara</span>
                    </a>
                    <a
                        href={`${BaseUrl}` + `uploads/assets/persiapan_sebelum_pengangkatan_dppi_daerah.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        download
                    >
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Persiapkan Sebelum Pelaksanaan</span>
                    </a>
                </div>

                <div className="md:flex md:flex-row justify-between gap-4 mb-12">
                    <button className="bg-gray-200 rounded-xl mt-4" onClick={() => { window.location.href = '/pengangkatan-dppi' }}>
                        <i className="fas fa-file-alt my-4 text-9xl text-red-700"></i>
                        <p className="text-center text-red-700 font-bold text-xl">FORM PENDAFTARAN TINGKAT KABUPATEN/KOTA
                        </p>
                        <p className="text-center text-sm text-gray-700">Form Kelengkapan Dokumen Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Kabupaten/Kota
                        </p>
                        <div className="text-white bg-accent rounded-b-xl p-2 mt-3">ISI FORM</div>
                    </button>
                    <button className="bg-gray-200 rounded-xl mt-4" onClick={() => { window.location.href = '/pengangkatan-dppi-provinsi' }}>
                        <i className="fas fa-file-alt my-4 text-9xl text-red-700"></i>
                        <p className="text-center text-red-700 font-bold text-xl">FORM PENDAFTARAN TINGKAT PROVINSI
                        </p>
                        <p className="text-center text-sm text-gray-700">Form Kelengkapan Dokumen Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Provinsi
                        </p>
                        <div className="text-white bg-accent rounded-b-xl p-2 mt-3">ISI FORM</div>
                    </button>
                </div>

                <div className='max-w-7xl  text-white justify-center mx-auto'>
                    <div className=' mt-6'>
                        <p className='text-3xl text-center font-bold text-red-700'>
                            Galeri <span className='text-black dark:text-white'> Kegiatan</span>
                        </p>
                        <div className='grid grid-cols-1 gap-1 mx-2 my-4 lg:mx-4 sm:grid-cols-2 lg:grid-cols-4'>
                            {gallery && gallery.map((item: any) => {
                                let firstFoto = '';
                                try {
                                    if (item.foto && typeof item.foto === 'string') {
                                        const fotoArray = JSON.parse(item.foto);
                                        if (Array.isArray(fotoArray) && fotoArray.length > 0) {
                                            firstFoto = fotoArray[0];
                                        }
                                    }
                                } catch (e) {
                                    console.error("Gagal parse JSON foto:", e);
                                }

                                const imageUrl = firstFoto
                                    ? getImageUrl(`uploads/assets/images/gallery/${firstFoto}`)
                                    : 'https://placehold.co/600x400/CCCCCC/333333?text=Tidak+Ada+Foto';

                                return (
                                    <div key={item.id} className='relative mb-4 overflow-hidden rounded-md bg-gray-50'>
                                        <a href={`/galeri-foto/${item.id}`}>
                                            <Image
                                                src={imageUrl}
                                                alt={item.kegiatan}
                                                width={400}
                                                height={300}
                                                className='w-full h-full object-cover'
                                                placeholder='blur'
                                                blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk9faLTyWwDdGWbqeSCO6FvKkJWWHPJADpN1qNVd4P/xAAaEQACAwAAAAAAAAAAAAAAAAAAEQESMkFR/9oACAECAQE/AGa5n//EABkRAQACAwAAAAAAAAAAAAAAAAEAAgMRE//aAAgBAwEBPwBTXbHk/9k='
                                                sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                                                onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }}
                                            />
                                            <div className='absolute bottom-0 justify-center w-full mx-auto my-0 overflow-hidden text-center rounded-b-md justify-items-center'>
                                                <div className='h-16 w-full py-2 px-2 my-0 text-xs text-center text-white bg-black/40 xl:text-sm font-seibold'>
                                                    {item.kegiatan}
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Banner Direktori Paskibraka Nasional */}
                <div className="mx-2 lg:mx-4 my-8">
                    <div className="relative bg-gradient-to-r from-red-800 via-red-700 to-amber-600 rounded-2xl p-6 md:p-8 shadow-lg overflow-hidden border border-amber-500/30 flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Decorative Background Elements */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute left-10 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                        
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center p-2 shadow-inner shrink-0 border border-white/15">
                                <img src="/assets/images/logo-paskibraka.png" alt="Logo Paskibraka" className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide">
                                    Direktori Paskibraka Nasional
                                </h3>
                                <p className="text-gray-100 text-xs md:text-sm max-w-xl leading-relaxed">
                                    Database Purnapaskibraka tingkat Nasional dari berbagai angkatan dan daerah asal.
                                </p>
                            </div>
                        </div>
                        
                        <Link 
                            href="/paskibraka-nasional" 
                            className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-amber-50 text-red-800 hover:text-red-900 font-extrabold text-sm rounded-xl transition-all duration-200 text-center shadow-md hover:shadow-lg whitespace-nowrap shrink-0 hover:scale-105 active:scale-95"
                        >
                            Lihat Paskibraka Nasional <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    </div>
                </div>

                <div className='col-span-2 mt-6'>
                    <p className='text-3xl text-center font-bold text-red-700'>
                        Kegiatan <span className='text-black dark:text-white'> Terbaru</span>
                    </p>

                    <div className='grid grid-cols-1 gap-1 mx-2 my-4 lg:mx-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {kegiatan && kegiatan.map((item: any) => {
                            return (
                                <div key={item.id} className='relative mb-4 overflow-hidden rounded-md bg-gray-50'>
                                    <Link href={`/kegiatan/${item.slug}`}>
                                        <div className='absolute top-0 right-0 justify-center mx-auto my-0 overflow-hidden text-center justify-items-center'>
                                            <div className='h-8 w-full py-2 px-2 my-0 text-xs text-center text-white bg-black/70 xl:text-sm font-semibold'>
                                                {item.biaya == 0 ? 'Gratis' : item.biaya.toLocaleString()}
                                            </div>
                                        </div>
                                        <img className='object-cover lg:max-h-34 xl:max-h-40 2xl:max-h-96 w-[30em] ' src={getImageUrl(item.photo)} alt='Foto Kegiatan' />
                                        <div className='absolute bottom-0 justify-center w-full mx-auto my-0 overflow-hidden text-center rounded-b-md justify-items-center'>
                                            <div className='h-16 w-full py-2 px-2 my-0 text-xs text-center text-white bg-black/70 font-semibold'>
                                                {item.nama_kegiatan}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gray-50 py-8 px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                💬 <span className="text-red-700"> Feedback</span> & Rating
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Pendapat Anda sangat berharga bagi kami. Berikan rating dan saran
                                untuk membantu kami meningkatkan pengalaman pengguna.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Rating Form */}
                            <div className="lg:col-span-2">
                                <RatingForm
                                    sessionId={sessionId}
                                    onSuccess={handleRatingSuccess}
                                />
                            </div>

                            {/* Right Column - Stats */}
                            <div>
                                <RatingStats />
                            </div>
                        </div>
                    </div>
                </div>

                {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
                {isChatOpen ?
                    '' :
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 z-50 bg-slate-700 hover:bg-slate-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none"
                        aria-label="Buka chat SiPena"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>}
            </div>
        </div>
    );
}