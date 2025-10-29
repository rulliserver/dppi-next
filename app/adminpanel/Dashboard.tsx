'use client';

import { useEffect, useRef, useState } from 'react';

import 'datatables.net-dt';
import $ from 'jquery';
import { UrlApi } from '../Components/apiUrl';
import { BaseUrl } from '../Components/baseUrl';
import { exportContactsXlsx } from '../utils/export-contacts-xlsx';
export default function Dashboard() {
    //fetching Contact
    const [loading, setLoading]: any = useState(true);
    const [error, setError]: any = useState(null);
    const [contact, setContact]: any = useState([]);
    const [pdpTerdaftar, setPdpTerdaftar]: any = useState([]);
    const [pdpBelumDiverifikasi, setPdpBelumDiverifikasi]: any = useState([]);
    const [pdpDiverifikasi, setPdpDiverifikasi]: any = useState([]);
    const [pdpSimental, setPdpSimental]: any = useState([]);
    const [update, setUpdate]: any = useState(0);
    const [evidance, setEvidance]: any = useState();

    // ambil data
    const getContact = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${UrlApi}/contact`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            let contact = await response.json();
            setContact(contact);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setContact(null);
        } finally {
            setLoading(false);
        }
    };
    const getPdpTerdaftar = async () => {
        try {
            setLoading(true);
            const response: any = await fetch(`${UrlApi}/pdp-terdaftar`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            let pdp = await response.json();
            setPdpTerdaftar(pdp);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setPdpTerdaftar(null);
        } finally {
            setLoading(false);
        }
    };
    const getPdpBelumDiverifikasi = async () => {
        try {
            setLoading(true);
            const response: any = await fetch(`${UrlApi}/pdp-belum-diverifikasi`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            let pdp = await response.json();

            setPdpBelumDiverifikasi(pdp);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setPdpBelumDiverifikasi(null);
        } finally {
            setLoading(false);
        }
    };
    const getPdpDiverifikasi = async () => {
        try {
            setLoading(true);
            const response: any = await fetch(`${UrlApi}/pdp-diverifikasi`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            let pdp = await response.json();

            setPdpDiverifikasi(pdp);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setPdpDiverifikasi(null);
        } finally {
            setLoading(false);
        }
    };
    const getPdpSimental = async () => {
        try {
            setLoading(true);
            const response: any = await fetch(`${UrlApi}/pdp-simental`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            let pdp = await response.json();

            setPdpSimental(pdp);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setPdpSimental(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContact();
        getPdpTerdaftar();
        getPdpBelumDiverifikasi();
        getPdpDiverifikasi();
        getPdpSimental();
    }, [update]);


    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },

        {
            data: 'created_at',
            render: function (data: any, type: any, row: any) {
                const date = new Date(data);
                const options: any = {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZone: 'Asia/Jakarta',
                };
                const formattedDate = date.toLocaleDateString('id-ID', options);
                return formattedDate;
            },
        },
        { data: 'nama' },
        { data: 'telepon' },
        { data: 'email' },
        { data: 'jenis_pesan' },

        {
            data: 'pesan',
            render: function (data: any, type: any, row: any) {
                return '<button class="view-btn cursor-pointer">' + (data.length > 45 ? `${data.slice(0, 45)}...` : data) + '</button>';
            },
        },
        {
            data: 'evidance',
            render: function (data: any, type: any, row: any) {
                return data ? `<a href='${BaseUrl}/${data}' target='_blank' class="underline text-blue-600">Evidance</a>` : '';
            },
        },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return '<button class="delete-btn"><i class="text-danger px-1 mx-1 rounded-sm fas fa-trash"></button>';
            },
        },
    ];

    const closeDeleteModal = () => {
        $('#deleteModal').addClass('hidden');
    };
    const closeViewModal = () => {
        $('#viewModal').addClass('hidden');
    };
    const [deleteData, setDeleteData]: any = useState();

    const handleDelete = async (e: any) => {
        e.preventDefault();
        try {
            await fetch(`${UrlApi}/contact/${deleteData.id}`, { method: 'DELETE' });
            window.location.href = '/adminpanel';
        } catch (err) {
            console.error('Gagal hapus:', err);
        }
    };

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: contact,
            columns: columns,
            createdRow: function (row, data, dataIndex) {
                $(row)
                    .find('td')
                    .first()
                    .text(dataIndex + 1);
            },
        });
        $(tableRef.current).on('click', '.view-btn', function () {
            var viewData = datatableRef.current.row($(this).parents('tr')).data();
            $('#nama').text(viewData.nama);
            $('#telepon').text(viewData.telepon);
            $('#email').text(viewData.email);
            $('#jenisPesan').text(viewData.jenis_pesan);
            $('#isiPesan').text(viewData.pesan);
            setEvidance(viewData.evidance);
            $('#viewModal').removeClass('hidden');
        });
        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.nama);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
        });
    }, [contact]);

    return (
        <>


            <div className='py-4'>
                <div className='text-gray-900 '>
                    <div className='grid grid-cols-1 mt-2 md:grid-cols-4 md:gap-4 xl:gap-8'>
                        <div className='justify-center mt-2 shadow-md '>
                            <div className='flex flex-col w-full rounded-md text-white px-auto bg-primary'>
                                <i className='text-5xl mx-auto  mt-4 fas fa-users'></i>
                                <p className='text-center text-2xl'>{pdpTerdaftar && pdpTerdaftar.length.toLocaleString()} PDP</p>
                                <p className='text-center text-2xl'>TERDAFTAR</p>
                            </div>
                        </div>
                        <div className='justify-center mt-2 shadow-md '>
                            <div className='flex flex-col w-full rounded-md text-white px-auto bg-primary'>
                                <i className='text-5xl mx-auto  mt-4 fas fa-registered'></i>
                                <p className='text-center text-2xl'>{pdpBelumDiverifikasi && pdpBelumDiverifikasi.length.toLocaleString()} PDP</p>
                                <p className='text-center text-2xl'>TEREGISTER</p>
                            </div>
                        </div>
                        <div className='justify-center mt-2 shadow-md '>
                            <div className='flex flex-col w-full rounded-md text-white px-auto bg-primary'>
                                <i className='text-5xl mx-auto  mt-4 fas fa-user-check'></i>
                                <p className='text-center text-2xl'>{pdpDiverifikasi && pdpDiverifikasi.length.toLocaleString()} PDP</p>
                                <p className='text-center text-2xl'>TERVERIFIKASI</p>
                            </div>
                        </div>
                        <div className='justify-center mt-2 shadow-md '>
                            <div className='flex flex-col w-full rounded-md text-white px-auto bg-primary'>
                                {/* <i className=' fas fa-users'></i> */}
                                <i className='text-5xl mx-auto  mt-4 fab fa-creative-commons-by'></i>
                                <p className='text-center text-2xl'>{pdpSimental && pdpSimental.length.toLocaleString()} PDP</p>
                                <p className='text-center text-2xl'>AKTIF</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='relative p-0 overflow-hidden rounded-md'>
                <div className='px-0 mx-auto mt-2 bg-gray-100 rounded-xl shadow-lg dark:bg-default lg:px-4'>
                    <div className='grid grid-cols-3'>
                        <p className='mx-2 my-auto mt-5 font-bold lg:text-xl dark:text-white'>Pesan Kontak</p>
                        <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-slate-900 dark:text-slate-50'>Loading...</div>}</div>
                    </div>
                    <div className='px-4 mx-auto overflow-auto text-xs 1xl:block 1xl:w-full 2xl:text-base'>
                        <table ref={tableRef} className='table text-xs cell-border'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tanggal</th>
                                    <th>Nama</th>
                                    <th>Telepon</th>
                                    <th>Email</th>
                                    <th>Jenis Pesan</th>
                                    <th>Isi Pesan</th>
                                    <th>Evidance</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className='flex flex-row justify-between mt-4'>
                        <p className='px-4 text-accent'>*)klik pada pesan untuk menampilkan detail pesan</p>
                        <button
                            onClick={() => exportContactsXlsx(contact, 'data-contacts.xlsx')}
                            className="px-4 py-2 rounded bg-green-600 text-white m-4 cursor-pointer"
                        >
                            Download Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* view Modal */}
            <div id='viewModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-3xl max-h-[500px] mx-auto top-20 md:h-auto overflow-x-hidden rounded-lg dark:border-red-500 dark:border-2 shadow-md shadow-black overflow-y-auto'>
                    <div className='relative bg-gray-200 dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-700'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Detail Pesan </span>
                            </div>

                            <button
                                type='button'
                                onClick={closeViewModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='viewModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>

                        <div className='px-4 py-2 font-semibold text-dark dark:text-white'>
                            <div className='grid grid-cols-5 gap-4'>
                                Nama{' '}
                                <div className='col-span-4'>
                                    : <span id='nama'></span>
                                </div>
                            </div>
                            <div className='grid grid-cols-5 gap-4'>
                                Telepon{' '}
                                <div className='col-span-4'>
                                    : <span id='telepon'></span>
                                </div>
                            </div>
                            <div className='grid grid-cols-5 gap-4'>
                                Email{' '}
                                <div className='col-span-4'>
                                    : <span id='email'></span>
                                </div>
                            </div>
                            <div className='grid grid-cols-5 gap-4'>
                                Jenis Pesan{' '}
                                <div className='col-span-4'>
                                    : <span id='jenisPesan'></span>
                                </div>
                            </div>
                        </div>
                        <p className='px-4 font-semibold text-dark dark:text-white'>Isi Pesan:</p>

                        <p id='isiPesan' className='px-4 text-justify dark:text-white' />
                        <p className='px-4'>
                            {evidance ? (
                                <a href={`${BaseUrl}/${evidance}`} target='_blank' className='underline text-blue-600'>
                                    Link Evidance
                                </a>
                            ) : (
                                ''
                            )}
                        </p>
                        <div className='p-6 space-y-6'>
                            <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                            <div className='flex flex-row-reverse'>
                                <button type='button' onClick={closeViewModal} className='px-8 py-2 hover:bg-primary mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* delete Modal */}
            <div id='deleteModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='fixed z-30 grid w-full grid-cols-1 lg:grid-cols-5 md:top-12 lg:top-40 top-14'>
                    <div className='flex flex-col p-1 lg:p-4 dark:border-gray-600'></div>
                    <div className='w-[50%] mx-auto bg-gray-100 border-2 border-red-200 rounded-md shadow-md lg:col-span-3 lg:px-3 dark:bg-default shadow-red-200'>
                        <div className='flex flex-col p-4 rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-accent'>Hapus Data </span>
                            </div>

                            <button
                                type='button'
                                onClick={closeDeleteModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='deleteModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        {/* <div className='flex flex-row text-center'> */}
                        <span className='pl-10 mr-1 dark:text-white'>Anda yakin ingin menghapus pesan </span>
                        <span id='deskripsiDelete' className='pl-10 sm:pl-0 dark:text-white' /> <span className='dark:text-white'>?</span>
                        {/* </div> */}
                        <div className='p-6 space-y-6'>
                            <form onSubmit={handleDelete} encType='multipart/form-data'>
                                <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                                <div className='grid grid-cols-3 mt-1 mr-2'>
                                    <button type='button' onClick={closeDeleteModal} className='py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Batal
                                    </button>
                                    <div className=''></div>
                                    <button type='submit' className='py-2 mt-2 text-white rounded-md bg-accent'>
                                        HAPUS
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
