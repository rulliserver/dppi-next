'use client';

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UrlApi } from "./components/apiUrl";
import { BaseUrl } from "./components/baseUrl";
import SlideBerita from "./components/SlideBerita";
import Peta from "./components/Peta";
import Image from "next/image";
import RatingForm from './components/RatingForm';
import RatingStats from './components/RatingStats';
import RatingDisplay from "./components/RatingDisplay";
export default function Beranda() {
    const [video, setVideo]: any = useState();
    const [berita, setBerita]: any = useState();
    const [kegiatan, setKegiatan]: any = useState();
    const [gallery, setGallery]: any = useState();

    const [dataPDPProv, setDataPDPProv] = useState();
    const [dataPDPKab, setDataPDPKab] = useState();
    const [dataProv, setDataProv] = useState();
    const [dataKab, setDataKab] = useState();
    const [sessionId, setSessionId] = useState<string>('');

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

    useEffect(() => {
        getVideo();
        getBerita();
        getKegiatan();
        getGallery();
        getDataPDPProvinsi();
        getDataPDPKabupaten();
        getDataProvinsi();
        getDataKabupaten();
    }, []);



    return (
        <div>
            <div className='w-full max-h-150 2xl:max-h-187.5 flex justify-center'>
                {video ?
                    <video src={BaseUrl + video.file_video.replace('/uploads', 'uploads')} className='object-cover' loop autoPlay={true} />
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

                {/* Data PDP Peta Indonesia */}
                <Peta DataPdpProv={dataPDPProv} DataPdpKab={dataPDPKab} kab={dataKab} prov={dataProv} />

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
                                    ? BaseUrl + `uploads/assets/images/gallery/${firstFoto}`
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
                                        <img className='object-cover lg:max-h-34 xl:max-h-40 2xl:max-h-96 w-[30em] ' src={BaseUrl + item.photo} alt='Foto Kegiatan' />
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
            </div>
        </div>
    );
}


