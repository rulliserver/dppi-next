'use client';

import { useEffect, useState } from "react";
import TextEditor from "../components/TextEditor";
import { UrlApi } from "../components/apiUrl";
import axios from "axios";

export default function Profil() {
    const [profile, setProfile]: any = useState();
    const getProfile = () => {
        axios
            .get(`${UrlApi}/profil`)
            .then((response: any) => {
                setProfile(response.data[0]);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    useEffect(() => {
        getProfile();
    }, []);
    return (
        <div className='max-w-7xl mx-auto'>
            <div className='my-8'>
                <p className='text-3xl text-center font-bold text-red-700'>
                    Tentang <span className='text-black dark:text-white'> PDP</span>
                </p>
                {profile ?
                    <div className='px-0 mx-auto mt-6 dark:text-white text-justify'>
                        <div className='relative px-4 mb-4'>
                            <p className='mt-4 mb-2 text-xl font-bold'>
                                I. <span className='pl-5'>DASAR HUKUM</span>
                            </p>
                            <div className='pl-8'>
                                <TextEditor data={profile.dasar_hukum} />
                            </div>
                        </div>
                        <div className='px-0 mx-auto mt-6 dark:text-white'>
                            <div className='relative px-4 mb-4'>
                                <p className='mt-4 mb-2 text-xl font-bold'>
                                    II. <span className='pl-4'>PENGERTIAN </span>
                                </p>
                                <div className='pl-8'>
                                    <TextEditor data={profile.pengertian} />
                                </div>
                            </div>
                        </div>

                        <div className='px-0 mx-auto mt-6 dark:text-white'>
                            <div className='relative px-4 mb-4'>
                                <p className='mt-4 mb-2 text-xl font-bold'>
                                    III. <span className='pl-3'>PERAN PURNAPASKIBRAKA DUTA PANCASILA</span>
                                </p>
                                <div className='pl-8'>
                                    <TextEditor data={profile.peran} />
                                </div>
                            </div>
                        </div>
                        <div className='px-0 mx-auto mt-6 dark:text-white'>
                            <div className='relative px-4 mb-4'>
                                <p className='mt-4 mb-2 text-xl font-bold'>
                                    IV. <span className='pl-1'>TUGAS DAN FUNGSI DPPI</span>
                                </p>
                                <div className='pl-8'>
                                    <ol>
                                        <li>
                                            DPPI mempunyai tugas membantu BPIP dalam menanamkan nilai Pancasila, kebangsaan, persatuan dan kesatuan, cinta tanah air serta rela
                                            berkorban untuk kepentingan bangsa dan negara dalam wadah Negara Kesatuan Republik Indonesia, melaksanakan pembinaan lanjutan kepada
                                            Purnapaskibraka Duta Pancasila, dan pembinaan terhadap aktivitas kepaskibrakaan dan kepada Purnapaskibraka
                                        </li>
                                        <li>Dalam menjalankan tugasnya, DPPI mempunyai fungsi:</li>
                                    </ol>
                                </div>
                                <div className='pl-8'>
                                    <p className='plist'>
                                        Penanaman nilai Pancasila, kebangsaan, persatuan dan kesatuan, cinta tanah air, serta rela berkorban untuk kepentingan bangsa dan negara
                                        dalam wadah Negara Kesatuan Republik Indonesia
                                    </p>
                                    <p className='plist'>Penyusunan dan pelaksanaan rencana kerja dan program DPPI</p>
                                    <p className='plist'>Melaksanakan Pembinaan Ideologi Pancasila melalui program Paskibraka berdasarkan penugasan dari BPIP</p>
                                </div>
                            </div>
                        </div>

                        <div className='px-0 mx-auto mt-6 dark:text-white'>
                            <div className='relative px-4 mb-4'>
                                <p className='mt-4 mb-2 text-xl font-bold'>
                                    V. <span className='pl-2'>KEPENGURUSAN</span>
                                </p>
                                <div className='pl-8'>
                                    <p>Terdiri atas:</p>
                                    <div className='mt-4'>
                                        <p className='font-semibold'>1. &nbsp; DPPI Tingkat Pusat</p>
                                        <p className='ml-6 mt-4'>-&nbsp; Pembina</p>
                                        <p className='sub-plist'>
                                            Dewan Pembina secara <span className='italic'>ex officio </span>oleh:
                                        </p>
                                        <ul className='pl-9'>
                                            <li className='ml-9 list-decimal'>Ketua Dewan Pengarah BPIP;</li>
                                            <li className='ml-9 list-decimal'>Menteri Koordinator bidang Politik, Hukum, dan Keamanan;</li>
                                            <li className='ml-9 list-decimal'>Menteri Koordinator bidang Pembangunan Manusia dan Kebudayaan;</li>
                                            <li className='ml-9 list-decimal'>Menteri Dalam Negeri; dan</li>
                                            <li className='ml-9 list-decimal'>Kepala BPIP.</li>
                                        </ul>
                                        <p className='ml-6 mt-4'>-&nbsp; Anggota</p>
                                        <div className='pl-1'>
                                            <p className='sub-plist'>
                                                Pejabat pimpinan tinggi madya yang membidangi koordinasi revolusi mental pada kementerian Koordinator bidang Pembangunan Manusia dan
                                                Kebudayaan;
                                            </p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi pemerintahan umum pada Kementerian Dalam Negeri;</p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi keuangan daerah pada Kementerian Dalam Negeri;</p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi pendidikan keagamaan pada Kementerian Agama;</p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi pendidikan menengah pada Kementerian Pendidikan;</p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi peraturan perundang-undangan pada Kementerian Hukum dan HAM;</p>
                                            <p className='sub-plist'>
                                                Pejabat pimpinan tinggi madya yang membidangi hak asasi manusia pada Kementerian Hukum dan&nbsp;Hak Asasi Manusia;
                                            </p>
                                            <p className='sub-plist'>Pejabat pimpinan tinggi madya yang membidangi pengembangan pemuda pada Kementerian Pemuda dan Olah Raga;</p>
                                            <p className='sub-plist'>Deputi Bidang Pendidikan dan Pelatihan BPIP; dan</p>
                                            <p className='sub-plist'>Deputi Pengendalian dan Evaluasi.</p>
                                        </div>
                                        <p className='ml-6 mt-4'>-&nbsp; Pelaksana</p>
                                        <div className='pl-1'>
                                            <p className='sub-plist'>Majelis Pertimbangan;</p>
                                            <p className='sub-plist'>Ketua Umum;</p>
                                            <p className='sub-plist'>Wakil Ketua I;</p>
                                            <p className='sub-plist'>Wakil Ketua II;</p>
                                            <p className='sub-plist'>Sekretaris Jenderal; dan</p>
                                            <p className='sub-plist'>Kepala Departemen.</p>
                                        </div>
                                        <p className='ml-6 mt-4'>-&nbsp; Sekretariat</p>
                                        <div className='pl-1'>
                                            <p className='sub-plist'>
                                                Ketua, yang dijabat secara <span className='italic'> ex officio </span>oleh pejabat pimpinan tinggi Pratama pada kedeputian yang
                                                membidangi pengendalian dan evaluasi di lingkungan BPIP; dan
                                            </p>
                                            <p className='sub-plist'>
                                                Anggota, yang dijabat secara <span className='italic'> ex officio </span> oleh:
                                            </p>
                                            <ul className='ml-14'>
                                                <li className='list-decimal'>
                                                    Pejabat pimpinan tinggi pratama pada direktorat jenderal yang membidangi pemerintahan umum pada kementerian yang
                                                    menyelenggarakan urusan pemerintahan dalam negeri; dan
                                                </li>
                                                <li className='list-decimal'>Pejabat pimpinan tinggi pratama yang membidangi perencanaan atau keuangan di lingkungan BPIP.</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <p className='font-semibold'>2. &nbsp; DPPI Tingkat Provinsi</p>
                                        <div className='ml-2'>
                                            <p className='plist'>Pembina DPPI tingkat Provinsi dijabat secara ex officio oleh Gubernur</p>
                                            <p className='plist'>Pelaksana dan Sekretariat DPPI tingkat provinsi ditetapkan oleh Gubernur dengan persetujuan Kepala BPIP.</p>
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <p className='font-semibold'>3. &nbsp; DPPI Tingkat Kabupaten/Kota </p>
                                        <div className='ml-2'>
                                            <p className='plist'>Pembina DPPI tingkat Kabupaten/Kota dijabat secara ex officio oleh Bupati/Walikota.</p>
                                            <p className='plist'>
                                                Pelaksana dan Sekretariat DPPI tingkat Kabupaten/Kota ditetapkan oleh Bupati/Walikota dengan persetujuan Kepala BPIP.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    : ''}
            </div>
        </div>
    )
}