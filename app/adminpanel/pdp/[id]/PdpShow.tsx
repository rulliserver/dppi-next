'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { UrlApi } from '@/app/Components/apiUrl';
import { useUser } from '@/app/Components/UserContext';
import FormatLongDate from '@/app/Components/FormatLongDate';
import { BaseUrl } from '@/app/Components/baseUrl';
import Image from 'next/image';
import DownloadCVButton from '@/app/Components/DownloadCVButton';

// Interface untuk data PDP - SESUAI DENGAN BACKEND
interface PdpData {
    id: number;
    no_simental: string | null;
    no_piagam: string | null;
    nama_lengkap: string;
    jk: string | null;
    tempat_lahir: string | null;
    tgl_lahir: string | null;
    alamat: string | null;
    id_kabupaten_domisili: number | null;
    id_provinsi_domisili: number | null;
    kabupaten_domisili: string | null;
    provinsi_domisili: string | null;
    email: string | null;
    telepon: string | null;
    posisi: string | null;
    tingkat_penugasan: string | null;
    id_kabupaten: number | null;
    id_provinsi: number | null;
    kabupaten: string | null;
    provinsi: string | null;
    thn_tugas: number | null;
    status: string | null;
    photo: string | null;
    id_hobi: string | null;
    detail_bakat: string | null;
    file_piagam: string | null;
}

export default function PdpShow() {
    const { id } = useParams();
    const { user } = useUser();
    const [pdp, setPdp] = useState<PdpData | null>(null);
    const [pendidikan, setPendidikan] = useState<any[]>([]);
    const [organisasi, setOrganisasi] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getPdp = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${UrlApi}/adminpanel/pdp/${id}`, {
                withCredentials: true
            });
            setPdp(response.data);
        } catch (error: any) {
            setError(error.message || 'Error fetching PDP data');
        } finally {
            setLoading(false);
        }
    };


    const getOrganisasi = async () => {
        try {
            const response = await axios.get(`${UrlApi}/adminpanel/organisasi/${id}`, {
                withCredentials: true
            });
            setOrganisasi(response.data);
        } catch (error: any) {
            console.error('Error fetching organisasi:', error);
        }
    };

    const getPendidikan = async () => {
        try {
            const response = await axios.get(`${UrlApi}/adminpanel/pendidikan/${id}`, {
                withCredentials: true
            });
            setPendidikan(response.data);
        } catch (error: any) {
            console.error('Error fetching pendidikan:', error);
        }
    };

    console.log(pdp);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                getPdp(),
                getPendidikan(),
                getOrganisasi()
            ]);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className='dark:bg-slate-900 min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto'></div>
                    <p className='mt-4 text-gray-600 dark:text-gray-300'>Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='dark:bg-slate-900 min-h-screen flex items-center justify-center'>
                <div className='text-center text-red-500'>
                    <p>Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!pdp) {
        return (
            <div className='dark:bg-slate-900 min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-gray-600 dark:text-gray-300'>Data tidak ditemukan</p>
                </div>
            </div>
        );
    }

    return (
        <div className='dark:bg-slate-900 min-h-screen'>
            <div className='bg-gray-50 pb-28 dark:bg-gray-700'>
                <div className='container mx-auto px-4 py-6'>
                    <div className='flex flex-row justify-between items-center mb-6'>
                        <div className='flex flex-row justify-start items-center'>
                            <i className='fas fa-server text-red-500 text-3xl'></i>
                            <p className='text-red-500 mt-1 mx-2 font-bold lg:text-2xl dark:text-white'>
                                DETAIL DATA PDP
                            </p>
                        </div>
                        {(user?.role === 'Administrator' || user?.role === 'Superadmin') && (
                            <div className='bg-accent text-white rounded-2xl flex'>
                                <i className='pt-2.5 pl-2 text-xl fas fa-external-link-alt text-white'></i>
                                <DownloadCVButton pdp={pdp} pendidikan={pendidikan} organisasi={organisasi} />
                            </div>
                        )}
                    </div>

                    <div className='container-cv dark:text-dark'>
                        <div className='header-cv text-center mb-8 relative'>
                            {pdp.photo && (
                                <Image
                                    src={`${BaseUrl + pdp.photo}`}
                                    className='mx-auto md:absolute md:top-3 md:left-8 w-32 h-40 object-cover border border-white rounded-lg shadow-md'
                                    alt='Profile Picture'
                                    width={128}
                                    height={200}
                                    priority
                                />
                            )}
                            <p className='text-center font-bold text-2xl md:text-3xl md:mt-8 lg:text-4xl text-gray-800 '>
                                CURRICULUM VITAE
                            </p>
                            <p className='text-red-600 font-semibold text-center text-xl md:text-2xl'>
                                {pdp.no_simental ? `NRA. ${pdp.no_simental}` : ''}
                            </p>
                            <p className='text-red-600 text-center md:mb-4'>
                                {pdp.no_piagam ? `Nomor Piagam: ${pdp.no_piagam}` : ''}
                            </p>
                        </div>

                        <div className='section-cv mt-8'>
                            <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 pb-2'>
                                DATA PRIBADI
                            </h3>
                            <table className='table-cv w-full'>
                                <tbody>
                                    <tr>
                                        <td className='font-semibold w-1/4'>Nama</td>
                                        <td className='w-1'>:</td>
                                        <td>{pdp.nama_lengkap}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Kelahiran</td>
                                        <td>:</td>
                                        <td>{pdp.tgl_lahir ? FormatLongDate(pdp.tgl_lahir) : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Alamat</td>
                                        <td>:</td>
                                        <td>
                                            {pdp.alamat} {pdp.kabupaten_domisili} - {pdp.provinsi_domisili}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Kewarganegaraan</td>
                                        <td>:</td>
                                        <td>Indonesia</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Telepon</td>
                                        <td>:</td>
                                        <td>{pdp.telepon || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Email</td>
                                        <td>:</td>
                                        <td>{pdp.email || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='section-cv mt-8'>
                            <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 pb-2'>
                                PENDIDIKAN
                            </h3>
                            <table className='table-cv w-full'>
                                <tbody>
                                    {pendidikan?.map((item: any, key: number) => (
                                        <tr key={key} className='border-b border-gray-300 dark:border-gray-700'>
                                            <td className='py-2'>
                                                {item.nama_instansi_pendidikan}
                                                {item.jurusan ? ` Jurusan ${item.jurusan}` : ''}
                                            </td>
                                            <td className='text-right pr-4 py-2 whitespace-nowrap'>
                                                {item.tahun_masuk} - {item.tahun_lulus}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!pendidikan || pendidikan.length === 0) && (
                                        <tr>
                                            <td colSpan={2} className='text-center py-4 text-gray-500'>
                                                Tidak ada data pendidikan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='section-cv mt-8'>
                            <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 pb-2'>
                                ORGANISASI
                            </h3>
                            <table className='table-cv w-full'>
                                <tbody>
                                    {organisasi?.map((item: any, key: number) => (
                                        <tr key={key} className='border-b border-gray-300 dark:border-gray-700'>
                                            <td className='py-2'>
                                                - {item.posisi} {item.nama_organisasi}
                                            </td>
                                            {item.status === 'Masih Aktif' ? (
                                                <td className='text-right pr-4 py-2 whitespace-nowrap'>
                                                    {item.tahun_masuk} - sekarang
                                                </td>
                                            ) : (
                                                <td className='text-right pr-4 py-2 whitespace-nowrap'>
                                                    {item.tahun_masuk} - {item.tahun_keluar}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {(!organisasi || organisasi.length === 0) && (
                                        <tr>
                                            <td colSpan={2} className='text-center py-4 text-gray-500'>
                                                Tidak ada data organisasi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='section-cv mt-8'>
                            <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 pb-2'>
                                HOBI
                            </h3>
                            <div className='flex flex-wrap gap-2 px-2'>
                                {pdp.id_hobi ? (

                                    () => {
                                        let hobiList = [];

                                        if (pdp.id_hobi) {
                                            try {
                                                const parsed = JSON.parse(pdp.id_hobi);
                                                if (Array.isArray(parsed)) {
                                                    hobiList = parsed;
                                                } else if (typeof parsed === 'string') {
                                                    hobiList = parsed.split(',').map(item => item.trim()).filter(item => item);
                                                }
                                            } catch (error) {
                                                // Jika bukan JSON, treat sebagai string biasa
                                                if (typeof pdp.id_hobi === 'string') {
                                                    hobiList = pdp.id_hobi.split(',').map(item => item.trim()).filter(item => item);
                                                }
                                            }
                                        }

                                        return hobiList.length > 0 ? (
                                            hobiList.map((item: string, key: number) => (
                                                <span
                                                    key={key}
                                                    className='bg-red-100 text-red-900 px-3 py-1 rounded-full text-sm dark:bg-red-900 dark:text-red-200'
                                                >
                                                    {item}
                                                </span>
                                            ))
                                        ) : (
                                            <span className='text-gray-500'>Tidak ada hobi</span>
                                        );
                                    })()
                                    : <span className='text-gray-500'>Tidak ada hobi</span>
                                }
                            </div>
                        </div>

                        <div className='section-cv mt-8'>
                            <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 pb-2'>
                                BAKAT
                            </h3>
                            <p className='text-gray-700 pb-2 dark:text-gray-300 ml-2'>
                                {pdp.detail_bakat || 'Tidak ada data bakat'}
                            </p>
                        </div>

                    </div>

                </div>

                {pdp.file_piagam &&
                    <div className=''>
                        <a href={BaseUrl + pdp.file_piagam} target="_blank" rel="noopener noreferrer" className="ml-6 py-2 px-2 font-bold text-blue-600 underline">LAMPIRAN PIAGAM / SK</a>
                    </div>
                }
            </div>
        </div>
    );
}
