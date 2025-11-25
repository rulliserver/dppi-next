'use client';
import { useEffect, useRef, useState, FormEvent } from 'react';
import axios from 'axios';
import 'datatables.net-dt';
import $ from 'jquery';
import InputLabel from '@/app/components/InputLabel';
import TextInput from '@/app/components/TextInput';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';

import Swal from 'sweetalert2';
import { UrlApi } from '@/app/components/apiUrl';
import { useUser } from '@/app/components/UserContext';
import { BaseUrl } from '@/app/components/baseUrl';

export default function Diklat() {
    const { user } = useUser();
    //fetching Contact
    const [diklat, setDiklat] = useState();
    const [loading, setLoading]: any = useState(false);
    const [dataDiklat, setDataDiklat]: any = useState({
        id: '',
        keterangan_diklat: '',
        tahun_diklat: '',
    });
    const [selectedFileSertifikat, setSelectedFileSertifikat]: any = useState(0);

    // fetching data
    const getDiklat = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/diklat/${user?.id_pdp}`, {
            withCredentials: true
        });
        setDiklat(response.data)
    }

    useEffect(() => {
        getDiklat()
    }, [])

    const handleOnChange = (e: any) => {
        setDataDiklat({
            ...dataDiklat,
            [e.target.name]: e.target.value,
        });
    };


    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        { data: 'keterangan_diklat' },
        {
            data: 'sertifikat_diklat',
            render: function (data: any) {
                if (!data) return '-';
                return `<a href="${BaseUrl + data}" target="_blank" rel="noopener" class="underline text-blue-600">Lihat Sertifikat</a>`;
            },
        },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p>${row.tahun_diklat}</p>`;
            },
        },

        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return '<div class="flex flex-row justify-center"><button class="edit-btn text-white rounded-md hover:bg-green-700 bg-green-600 px-4">Edit</button><button class="delete-btn text-white rounded-md hover:bg-red-700 bg-accent px-4 ml-2 py-1">Hapus</button></div>';
            },
        },
    ];

    const closeDeleteModal = () => {
        window.location.reload();
    };
    const closeEditModal = () => {
        window.location.reload();
    };
    const [deleteData, setDeleteData]: any = useState();
    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        await axios.delete(`${UrlApi}/userpanel/diklat/${deleteData.id}`, {

            withCredentials: true
        });
        window.location.href = '/userpanel/diklat';
    };

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: diklat,
            columns: columns,
            createdRow: function (row, data, dataIndex) {
                $(row)
                    .find('td')
                    .first()
                    .text(dataIndex + 1);
            },
        });
        $(tableRef.current).on('click', '.edit-btn', function () {
            var editData = datatableRef.current.row($(this).parents('tr')).data();
            setDataDiklat({
                id: editData.id,
                keterangan_diklat: editData.keterangan_diklat,
                sertifikat_diklat: editData.sertifikat_diklat,
                tahun_diklat: editData.tahun_diklat,
            });
            $('#nama').text(editData.keterangan_diklat);
            $('#sertifikat_diklat').text(editData.sertifikat_diklat);
            $('#editModal').removeClass('hidden');
        });
        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.keterangan_diklat);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
            $('#deleteModal').addClass('flex');
        });
    }, [diklat]);

    //submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            // Pastikan user login valid
            if (!user?.id_pdp) {
                await Swal.fire({ icon: 'error', text: 'Sesi tidak valid: id_pdp tidak ditemukan.' });
                return;
            }

            // Pastikan ada ID diklat untuk PUT
            if (!dataDiklat.id) {
                await Swal.fire({ icon: 'error', text: 'ID diklat tidak ditemukan.' });
                return;
            }
            if (dataDiklat.keterangan_diklat && dataDiklat.keterangan_diklat.length < 2) throw new Error('Keterangan diklat terlalu pendek');

            if (typeof dataDiklat.tahun_diklat === 'number' && !Number.isInteger(dataDiklat.tahun_diklat))
                throw new Error('Tahun masuk harus angka bulat');

            if (selectedFileSertifikat && selectedFileSertifikat.target.files[0]) {
                formData.append('sertifikat_diklat', selectedFileSertifikat.target.files[0]);
            }
            formData.append('keterangan_diklat', dataDiklat.keterangan_diklat);
            formData.append('tahun_diklat', dataDiklat.tahun_diklat);
            const response = await axios.put(`${UrlApi}/userpanel/diklat/${dataDiklat.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },

                    withCredentials: true,
                    validateStatus: (s) => s >= 200 && s < 300, // 200/204 untuk update
                }
            );

            console.log(response);

            await Swal.fire({
                icon: 'success',
                text: 'Diklat berhasil diperbarui',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/diklat';
        } catch (err: any) {
            console.error(err);
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Terjadi kesalahan saat mengirim data';
            Swal.fire({ icon: 'error', text: msg });
        }
    };
    //tambah data
    const [data, setData]: any = useState({
        keterangan_diklat: '',
        tahun_diklat: '',
    });
    const createModal = () => {
        $('#createModal').removeClass('hidden');
    };
    const handleChangeCreate = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    //Submit Create
    const handleSubmitCreate = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            if (!user?.id_pdp) {
                await Swal.fire({
                    icon: 'error',
                    text: 'Sesi tidak valid: id_pdp tidak ditemukan.',
                });
                return;
            }
            // Validasi
            if (!data.keterangan_diklat) throw new Error('Keterangan diklat wajib diisi');


            if (selectedFileSertifikat && selectedFileSertifikat.target.files[0]) {
                formData.append('sertifikat_diklat', selectedFileSertifikat.target.files[0]);
            }
            formData.append('tahun_diklat', data.tahun_diklat);
            formData.append('keterangan_diklat', data.keterangan_diklat);
            await axios.post(
                `${UrlApi}/userpanel/diklat/${user.id_pdp}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },

                    withCredentials: true,
                    validateStatus: (s) => s >= 200 && s < 400, // terima 201 Created
                }
            );

            await Swal.fire({
                icon: 'success',
                text: 'Diklat berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/diklat';
        } catch (err: any) {
            console.error(err);
            const msg =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                'Terjadi kesalahan saat mengirim data';

            Swal.fire({ icon: 'error', text: msg });
        }
    };

    return (
        <>


            <div className='py-4'>
                <div className='text-gray-9000 flex flex-row justify-between'>
                    <div className='flex flex-row'>
                        <i className='text-accent fas fa-chalkboard-teacher text-2xl md:text-3xl pr-1 md:pr-5'></i>
                        <p className='md:text-2xl py-1 font-semibold text-accent'>DIKLAT/KURSUS SINGKAT</p>
                    </div>
                    <div className='flex flex-row text-xs md:text-base'>
                        <button className='text-center bg-green-700 hover:bg-green-800 px-2 rounded-lg text-white' onClick={createModal}>
                            <span className='fas fa-plus'></span> Riwayat Diklat
                        </button>
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
                                    <th>Keterangan</th>
                                    <th>Sertifikat Diklat</th>
                                    <th>Tahun Diklat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>

            {/* create Modal */}
            <div id='createModal' className='absolute hidden top-0 left-0 z-50 min-w-full min-h-full bg-white bg-opacity-50 backdrop-blur-sm'>
                <div className='sticky mt-10 p-4 overflow-x-hidden overflow-y-auto md:inset-0'>
                    <div className='relative w-full h-full max-w-xl mx-auto top-2 md:h-auto'>
                        <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                            <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white '>
                                    <span className='mr-1 text-red-500'>Riwayat Diklat</span>
                                </div>
                                <button
                                    type='button'
                                    onClick={closeEditModal}
                                    className='close-btn text-red-500 hover:text-accent hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                    publikasi-modal-hide='editModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmitCreate}>
                                <div className='px-4 py-2 text-dark dark:text-white'>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='keterangan_diklat'>Keterangan:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='keterangan_diklat'
                                            type='text'
                                            name='keterangan_diklat'
                                            required
                                            tabIndex={0}
                                            autoComplete='keterangan_diklat'
                                            placeholder='Detail Diklat/Kursus...'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='sertifikat_diklat'>Sertifikat Diklat/Kursus:</InputLabel>
                                        <input
                                            className='text-sm border-2 w-full rounded-md'
                                            tabIndex={1}
                                            type='file'
                                            accept='image/jpeg, image/jpg, image/png, application/pdf'
                                            onChange={setSelectedFileSertifikat}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='tahun_diklat'>Tahun:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='tahun_diklat'
                                            type='number'
                                            name='tahun_diklat'
                                            required
                                            tabIndex={1}
                                            autoComplete='tahun_diklat'
                                            placeholder='Tahun Diklat/Kursus'
                                            min='1970'
                                            max={new Date().getFullYear()}
                                            step='1'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                </div>
                                <div className='border-t-2 mt-4'></div>
                                <div className='flex justify-between mt-4 px-8 pb-8'>
                                    <button type='button' onClick={closeEditModal} className='px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                                        Tutup
                                    </button>

                                    <button type='submit' tabIndex={3} className={`px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md`}>
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* edit Modal */}
            <div id='editModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 '>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 w-full h-full rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-red-500'>Edit Diklat</span>
                            </div>
                            <button
                                type='button'
                                onClick={closeEditModal}
                                className='close-btn text-red-500 hover:text-accent hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='keterangan_diklat'>Keterangan:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='keterangan_diklat'
                                        type='text'
                                        name='keterangan_diklat'
                                        required
                                        tabIndex={0}
                                        autoComplete='keterangan_diklat'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataDiklat.keterangan_diklat}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='sertifikat_diklat'>Sertifikat Diklat/Kursus*):</InputLabel>
                                    <input
                                        className='text-sm border-2 w-full rounded-md'
                                        tabIndex={1}
                                        type='file'
                                        accept='image/jpeg, image/jpg, image/png, application/pdf'
                                        onChange={setSelectedFileSertifikat}
                                    />
                                    <p className='text-red-600 text-xs'>*) abaikan jika tidak ada perubahan file</p>
                                </div>

                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='tahun_diklat'>Tahun:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='tahun_diklat'
                                        type='number'
                                        name='tahun_diklat'
                                        required
                                        tabIndex={3}
                                        autoComplete='tahun_diklat'
                                        min='1900'
                                        max={new Date().getFullYear()}
                                        step='1'
                                        defaultValue={dataDiklat.tahun_diklat}
                                        onChange={handleOnChange}
                                    />
                                </div>
                            </div>

                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeEditModal} className='px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                                    Tutup
                                </button>

                                <button type='submit' tabIndex={3} className={`px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md`}>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* delete Modal */}
            <div id='deleteModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 '>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='w-full mx-auto bg-gray-100 border-2 border-red-200 rounded-md shadow-md lg:col-span-3 lg:px-3 dark:bg-default shadow-red-200'>
                        <div className='flex flex-col p-4 rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-red-500'>Hapus Data</span>
                            </div>

                            <button
                                type='button'
                                onClick={closeDeleteModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='deleteModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <p className='px-4 mr-1 dark:text-white'>
                            Anda yakin ingin menghapus Riwayat Diklat <span id='deskripsiDelete' className='dark:text-white' />
                            <span className='dark:text-white'>?</span>
                        </p>

                        <div className='p-6 space-y-6'>
                            <form onSubmit={deleteSubmit} encType='multipart/form-data'>
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
