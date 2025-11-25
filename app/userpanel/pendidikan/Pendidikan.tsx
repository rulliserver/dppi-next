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

export default function Pendidikan() {
    const { user } = useUser();
    //fetching Contact
    const [pendidikan, setPendidkan] = useState();
    const [loading, setLoading]: any = useState(false);
    const [dataPendidikan, setDataPendidikan]: any = useState({
        id: '',
        jenjang_pendidikan: '',
        nama_instansi_pendidikan: '',
        jurusan: '',
        tahun_masuk: '',
        tahun_lulus: '',
    });

    // fetching data
    const getPendidikan = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/pendidikan/${user?.id_pdp}`, {
            withCredentials: true
        });
        setPendidkan(response.data)
    }

    useEffect(() => {
        getPendidikan()
    }, [])

    const handleOnChange = (e: any) => {
        setDataPendidikan({
            ...dataPendidikan,
            [e.target.name]: e.target.value,
        });
    };


    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        { data: 'jenjang_pendidikan' },
        { data: 'nama_instansi_pendidikan' },
        { data: 'jurusan' },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p>${row.tahun_masuk} - ${row.tahun_lulus}</p>`;
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
        await axios.delete(`${UrlApi}/userpanel/pendidikan/${deleteData.id}`, {

            withCredentials: true
        });
        window.location.href = '/userpanel/pendidikan';
    };

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: pendidikan,
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
            setDataPendidikan({
                id: editData.id,
                jenjang_pendidikan: editData.jenjang_pendidikan,
                nama_instansi_pendidikan: editData.nama_instansi_pendidikan,
                jurusan: editData.jurusan,
                tahun_masuk: editData.tahun_masuk,
                tahun_lulus: editData.tahun_lulus,
            });
            $('#nama').text(editData.jenjang_pendidikan);
            $('#nama_instansi_pendidikan').text(editData.nama_instansi_pendidikan);
            $('#editModal').removeClass('hidden');
        });
        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.jenjang_pendidikan);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
            $('#deleteModal').addClass('flex');
        });
    }, [pendidikan]);

    //submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // Pastikan user login valid
            if (!user?.id_pdp) {
                await Swal.fire({ icon: 'error', text: 'Sesi tidak valid: id_pdp tidak ditemukan.' });
                return;
            }

            // Pastikan ada ID pendidikan untuk PUT
            if (!dataPendidikan.id) {
                await Swal.fire({ icon: 'error', text: 'ID pendidikan tidak ditemukan.' });
                return;
            }

            // Normalisasi & tri-state
            const jenjang = (dataPendidikan.jenjang_pendidikan ?? '').trim();
            const instansi = (dataPendidikan.nama_instansi_pendidikan ?? '').trim();

            // jurusan: '' => null (clear), string non-blank => set, otherwise undefined (abaikan)
            const jurusan =
                dataPendidikan.jurusan === ''
                    ? null
                    : (dataPendidikan.jurusan ?? undefined)?.toString().trim() || undefined;

            // tahun_masuk: ''/undefined => undefined (abaikan), angka valid => set
            const tahunMasuk =
                dataPendidikan.tahun_masuk === '' || dataPendidikan.tahun_masuk === undefined
                    ? undefined
                    : Number(dataPendidikan.tahun_masuk);

            // tahun_lulus: '' => null (clear), undefined => undefined (abaikan), angka valid => set
            const tahunLulus =
                dataPendidikan.tahun_lulus === ''
                    ? null
                    : dataPendidikan.tahun_lulus === undefined
                        ? undefined
                        : Number(dataPendidikan.tahun_lulus as any);

            // Validasi ringan (opsional): hanya validasi jika fieldnya DIKIRIM
            if (jenjang && jenjang.length < 2) throw new Error('Jenjang pendidikan terlalu pendek');
            if (instansi && instansi.length < 2) throw new Error('Nama instansi terlalu pendek');
            if (typeof tahunMasuk === 'number' && !Number.isInteger(tahunMasuk))
                throw new Error('Tahun masuk harus angka bulat');
            if (typeof tahunLulus === 'number' && !Number.isInteger(tahunLulus))
                throw new Error('Tahun lulus harus angka bulat');

            // Bangun payload hanya dengan field yang ingin diubah
            const payload: Record<string, any> = {};
            if (jenjang) payload.jenjang_pendidikan = jenjang;
            if (instansi) payload.nama_instansi_pendidikan = instansi;

            // Untuk field nullable, kita kirim meski null (untuk clear)
            if (jurusan !== undefined) payload.jurusan = jurusan;
            if (tahunMasuk !== undefined) payload.tahun_masuk = tahunMasuk;
            if (tahunLulus !== undefined) payload.tahun_lulus = tahunLulus;

            // Safety: jangan kirim PUT tanpa perubahan sama sekali
            if (Object.keys(payload).length === 0) {
                await Swal.fire({ icon: 'info', text: 'Tidak ada perubahan untuk disimpan.' });
                return;
            }

            const response = await axios.put(
                `${UrlApi}/userpanel/pendidikan/${dataPendidikan.id}`, // <— gunakan ID pendidikan
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                    validateStatus: (s) => s >= 200 && s < 300, // 200/204 untuk update
                }
            );

            console.log(response);

            await Swal.fire({
                icon: 'success',
                text: 'Pendidikan berhasil diperbarui',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/pendidikan';
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
        jenjang_pendidikan: '',
        nama_instansi_pendidikan: '',
        jurusan: '',
        tahun_masuk: '',
        tahun_lulus: '',
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
            if (!user?.id_pdp) {
                await Swal.fire({
                    icon: 'error',
                    text: 'Sesi tidak valid: id_pdp tidak ditemukan.',
                });
                return;
            }

            // Normalisasi + konversi tipe
            const payload = {
                jenjang_pendidikan: (data.jenjang_pendidikan || '').trim(),
                nama_instansi_pendidikan: (data.nama_instansi_pendidikan || '').trim(),
                jurusan: data.jurusan?.trim() ? data.jurusan.trim() : null, // kosong -> null
                tahun_masuk: Number(data.tahun_masuk),                       // string -> number
                tahun_lulus: data.tahun_lulus ? Number(data.tahun_lulus) : null,
            };

            // Validasi cepat di client biar UX enak
            if (!payload.jenjang_pendidikan) throw new Error('Jenjang pendidikan wajib diisi');
            if (!payload.nama_instansi_pendidikan) throw new Error('Nama instansi pendidikan wajib diisi');
            if (!Number.isInteger(payload.tahun_masuk)) throw new Error('Tahun masuk harus angka');
            if (payload.tahun_lulus !== null && !Number.isInteger(payload.tahun_lulus)) {
                throw new Error('Tahun lulus harus angka');
            }

            const response = await axios.post(
                `${UrlApi}/userpanel/pendidikan/${user.id_pdp}`,
                payload,
                {
                    // axios default-nya sudah application/json; ini opsional
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                    validateStatus: (s) => s >= 200 && s < 400, // terima 201 Created
                }
            );

            console.log(response);

            await Swal.fire({
                icon: 'success',
                text: 'Pendidikan berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/pendidikan';
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


    return (
        <>
            <div className='py-4'>
                <div className='text-gray-9000 flex flex-row justify-between'>
                    <div className='flex flex-row'>
                        <i className='text-accent fa fa-graduation-cap text-2xl md:text-3xl pr-1 md:pr-5'></i>
                        <p className='md:text-2xl py-1 font-semibold text-accent'>PENDIDIKAN</p>
                    </div>
                    <div className='flex flex-row text-xs md:text-base'>
                        <button className='text-center bg-green-700 hover:bg-green-800 px-2 rounded-lg text-white' onClick={createModal}>
                            <span className='fas fa-plus'></span> Riwayat Pendidikan
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
                                    <th>Jenjang Pendidikan</th>
                                    <th>Nama Instansi Pendidikan</th>
                                    <th>Jurusan</th>
                                    <th>Tahun</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>


            {/* create Modal */}
            <div id='createModal' aria-hidden='true' className='absolute hidden top-0 left-0 z-50 min-w-full min-h-full bg-white bg-opacity-50 backdrop-blur-sm'>
                <div className='sticky mt-10 p-4 overflow-x-hidden overflow-y-auto md:inset-0'>
                    <div className='relative w-full h-full max-w-xl mx-auto top-2 md:h-auto'>
                        <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                            <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white '>
                                    <span className='mr-1 text-red-500'>Riwayat Pendidikan</span>
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
                                        <InputLabel htmlFor='jenjang_pendidikan'>Jenjang Pendidikan:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='jenjang_pendidikan'
                                            type='text'
                                            name='jenjang_pendidikan'
                                            required
                                            tabIndex={0}
                                            autoComplete='jenjang_pendidikan'
                                            placeholder='SD, SMP/SLTA/MTs...'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='nama_instansi_pendidikan'>Nama Instansi Pendidikan:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='nama_instansi_pendidikan'
                                            type='text'
                                            name='nama_instansi_pendidikan'
                                            required
                                            tabIndex={0}
                                            autoComplete='nama_instansi_pendidikan'
                                            placeholder='Nama Sekolah/Univeritas/Perguruan Tinggi...'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='jurusan'>Jurusan:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='jurusan'
                                            type='text'
                                            name='jurusan'
                                            tabIndex={0}
                                            autoComplete='jurusan'
                                            placeholder='Optional'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='tahun_masuk'>Tahun Masuk:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='tahun_masuk'
                                            type='number'
                                            name='tahun_masuk'
                                            required
                                            tabIndex={1}
                                            autoComplete='tahun_masuk'
                                            placeholder='Tahun Masuk'
                                            min='1900'
                                            max={new Date().getFullYear()}
                                            step='1'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='tahun_lulus'>Tahun Lulus:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='tahun_lulus'
                                            type='number'
                                            name='tahun_lulus'
                                            required
                                            tabIndex={2}
                                            autoComplete='tahun_lulus'
                                            placeholder='Tahun Lulus'
                                            min='1900'
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

                                    <button type='submit' tabIndex={3} className="px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* edit Modal */}
            <div id='editModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 '>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 w-full h-full rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-red-500'>Edit Pendidikan</span>
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
                                    <InputLabel htmlFor='jenjang_pendidikan'>Jenjang Pendidikan:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='jenjang_pendidikan'
                                        type='text'
                                        name='jenjang_pendidikan'
                                        required
                                        tabIndex={0}
                                        autoComplete='jenjang_pendidikan'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataPendidikan.jenjang_pendidikan}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_instansi_pendidikan'>Nama Instansi Pendidikan:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='nama_instansi_pendidikan'
                                        type='text'
                                        name='nama_instansi_pendidikan'
                                        required
                                        tabIndex={1}
                                        autoComplete='nama_instansi_pendidikan'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataPendidikan.nama_instansi_pendidikan}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='jurusan'>Jurusan:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='jurusan'
                                        type='text'
                                        name='jurusan'
                                        tabIndex={2}
                                        autoComplete='jurusan'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataPendidikan.jurusan}
                                        placeholder='optional'
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='tahun_masuk'>Tahun Masuk:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='tahun_masuk'
                                        type='number'
                                        name='tahun_masuk'
                                        required
                                        tabIndex={3}
                                        autoComplete='tahun_masuk'
                                        min='1900'
                                        max={new Date().getFullYear()}
                                        step='1'
                                        defaultValue={dataPendidikan.tahun_masuk}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='tahun_lulus'>Tahun Lulus:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='tahun_lulus'
                                        type='number'
                                        name='tahun_lulus'
                                        required
                                        tabIndex={4}
                                        autoComplete='tahun_lulus'
                                        min='1900'
                                        max={new Date().getFullYear()}
                                        step='1'
                                        defaultValue={dataPendidikan.tahun_lulus}
                                        onChange={handleOnChange}
                                    />
                                </div>
                            </div>

                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeEditModal} className='px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                                    Tutup
                                </button>

                                <button type='submit' tabIndex={3} className="px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* delete Modal */}
            <div id='deleteModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 '>
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
                            Anda yakin ingin menghapus Riwayat Pendidikan <span id='deskripsiDelete' className='dark:text-white' />
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
