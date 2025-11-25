'use client';
import { useEffect, useRef, useState, FormEvent } from 'react';
import axios from 'axios';
import 'datatables.net-dt';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import { UrlApi } from '@/app/Components/apiUrl';
import { useUser } from '@/app/Components/UserContext';

export default function KegiatanPdp(props: any) {
    const { user } = useUser();
    //fetching Contact
    const [kegiatan, setKegiatan] = useState();
    const [loading, setLoading]: any = useState(false);
    const getKegiatan = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/kegiatan/${user?.id_pdp}`, {
            withCredentials: true
        });
        setKegiatan(response.data)
    }

    useEffect(() => {
        getKegiatan()
    }, [])

    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        { data: 'kode_pendaftaran' },
        { data: 'nama_kegiatan' },
        { data: 'waktu_pelaksanaan' },
        { data: 'biaya' },
        { data: 'bukti_pembayaran' },
        { data: 'jumlah_pembayaran' },
        { data: 'status' },
    ];

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: kegiatan,
            columns: columns,
            createdRow: function (row, data, dataIndex) {
                $(row)
                    .find('td')
                    .first()
                    .text(dataIndex + 1);
            },
        });
    }, [kegiatan]);

    return (
        <>


            <div className='py-4'>
                <div className='text-gray-9000 flex flex-row justify-between'>
                    <div className='flex flex-row'>
                        <i className='text-accent fas fa-calendar-check text-2xl md:text-3xl pr-1 md:pr-5'></i>
                        <p className='md:text-2xl py-1 font-semibold text-accent'>KEGIATAN</p>
                    </div>
                </div>
            </div>
            <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-slate-900 dark:text-slate-50'>Loading...</div>}</div>
            <div className='relative p-0 overflow-hidden rounded-md'>
                <div className='px-0 mx-auto mt-2 bg-white rounded-md shadow-lg dark:bg-default lg:px-4'>
                    <div className='px-4 mx-auto overflow-auto text-xs 1xl:block 1xl:w-full 2xl:text-base'>
                        <table ref={tableRef} className='table text-xs dataTable cell-border table-bordered'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Kode Pendaftaran</th>
                                    <th>Nama Kegiatan</th>
                                    <th>Waktu Pelaksanaan</th>
                                    <th>Biaya Pendaftaran</th>
                                    <th>Bukti Transfer</th>
                                    <th>Jumlah Transfer</th>
                                    <th>Status</th>
                                    {/* <th>Aksi</th> */}
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>

        </>
    );
}
