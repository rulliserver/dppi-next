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

export default function Organisasi() {
    const { user } = useUser();
    //fetching Contact
    const [organisasi, setOrganisasi] = useState();
    const [loading, setLoading]: any = useState(false);
    const [dataOrganisasi, setDataOrganisasi]: any = useState({
        id: '',
        nama_organisasi: '',
        posisi: '',
        status: '',
        tahun_masuk: '',
        tahun_keluar: '',
    });

    // fetching data
    const getOrganisasi = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/organisasi/${user?.id_pdp}`, {
            withCredentials: true
        });
        setOrganisasi(response.data)
    }

    useEffect(() => {
        getOrganisasi()
    }, [])

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "status") {
            setDataOrganisasi((prev: any) => ({
                ...prev,
                status: value || null,
                tahun_keluar: value === "Masih Aktif" ? null : prev.tahun_keluar, // <- penting
            }));
            return;
        }

        if (name === "tahun_keluar") {
            const v = value.trim();
            setDataOrganisasi((prev: any) => ({
                ...prev,
                tahun_keluar: v === "" ? null : v,
            }));
            return;
        }
        setDataOrganisasi((prev: any) => ({ ...prev, [name]: value }));
    };



    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        { data: 'nama_organisasi' },
        { data: 'posisi' },

        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p>${row.tahun_masuk} - ${row.tahun_keluar != null ? row.tahun_keluar : 'Sekarang'}</p>`;
            },
        },
        { data: 'status' },
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
        await axios.delete(`${UrlApi}/userpanel/organisasi/${deleteData.id}`, {
            withCredentials: true
        });
        window.location.href = '/userpanel/organisasi';
    };

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: organisasi,
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
            setDataOrganisasi({
                id: editData.id,
                nama_organisasi: editData.nama_organisasi,
                posisi: editData.posisi,
                status: editData.status,
                tahun_masuk: editData.tahun_masuk,
                tahun_keluar: editData.tahun_keluar,
            });
            $('#nama').text(editData.nama_organisasi);
            $('#posisi').text(editData.posisi);
            $('#editModal').removeClass('hidden');
        });
        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.nama_organisasi);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
            $('#deleteModal').addClass('flex');
        });
    }, [organisasi]);
    console.log(dataOrganisasi);


    //submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!user?.id_pdp) {
                await Swal.fire({ icon: 'error', text: 'Sesi tidak valid: id_pdp tidak ditemukan.' });
                return;
            }
            if (!dataOrganisasi.id) {
                await Swal.fire({ icon: 'error', text: 'ID organisasi tidak ditemukan.' });
                return;
            }

            const jenjang = (dataOrganisasi.nama_organisasi ?? '').trim();
            const posisi = (dataOrganisasi.posisi ?? '').trim();

            const status =
                dataOrganisasi.status === ''
                    ? null
                    : (dataOrganisasi.status ?? undefined)?.toString().trim() || undefined;

            // PATOKAN AKTIF: langsung dari state terkini (bukan dari variabel status)
            const isAktif = (dataOrganisasi.status ?? '').toString().trim() === 'Masih Aktif';

            // Helper parsing aman
            const toInt = (v: unknown) => {
                if (v === '' || v === undefined || v === null) return undefined;
                const n = parseInt(String(v), 10);
                return Number.isFinite(n) ? n : undefined;
            };

            // tahun_masuk: kirim hanya jika angka valid
            const tahunMasuk = toInt(dataOrganisasi.tahun_masuk);

            // tahun_keluar:
            let tahunKeluar: number | null | undefined;
            if (isAktif) {
                tahunKeluar = null; // <-- ini kuncinya
            } else {
                const tk = toInt(dataOrganisasi.tahun_keluar);
                tahunKeluar = tk === undefined ? undefined : tk;
            }

            // Validasi ringan (hanya bila field DIKIRIM)
            if (jenjang && jenjang.length < 2) throw new Error('Nama organisasi terlalu pendek');
            if (posisi && posisi.length < 2) throw new Error('Nama posisi terlalu pendek');
            if (typeof tahunMasuk === 'number' && !Number.isInteger(tahunMasuk))
                throw new Error('Tahun masuk harus angka bulat');
            if (typeof tahunKeluar === 'number' && !Number.isInteger(tahunKeluar))
                throw new Error('Tahun keluar harus angka bulat');

            const payload: Record<string, any> = {};
            if (jenjang) payload.nama_organisasi = jenjang;
            if (posisi) payload.posisi = posisi;

            // Untuk field nullable, kirim meski null (agar clear di DB)
            if (status !== undefined) payload.status = status;
            if (tahunMasuk !== undefined) payload.tahun_masuk = tahunMasuk;
            if (tahunKeluar !== undefined) payload.tahun_keluar = tahunKeluar;

            if (Object.keys(payload).length === 0) {
                await Swal.fire({ icon: 'info', text: 'Tidak ada perubahan untuk disimpan.' });
                return;
            }

            const response = await axios.put(
                `${UrlApi}/userpanel/organisasi/${dataOrganisasi.id}`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                    validateStatus: (s) => s >= 200 && s < 300,
                }
            );

            await Swal.fire({
                icon: 'success',
                text: 'Organisasi berhasil diperbarui',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/organisasi';
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
        nama_organisasi: '',
        posisi: '',
        status: '',
        tahun_masuk: '',
        tahun_keluar: '',
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
                nama_organisasi: (data.nama_organisasi || '').trim(),
                posisi: (data.posisi || '').trim(),
                status: data.status?.trim() ? data.status.trim() : null, // kosong -> null
                tahun_masuk: Number(data.tahun_masuk),                       // string -> number
                tahun_keluar: data.tahun_keluar ? Number(data.tahun_keluar) : null,
            };

            // Validasi cepat di client biar UX enak
            if (!payload.nama_organisasi) throw new Error('Nama_organisasi wajib diisi');
            if (!payload.posisi) throw new Error('Posisi wajib diisi');
            if (!Number.isInteger(payload.tahun_masuk)) throw new Error('Tahun masuk harus angka');
            if (payload.tahun_keluar !== null && !Number.isInteger(payload.tahun_keluar)) {
                throw new Error('Tahun keluar harus angka');
            }

            const response = await axios.post(
                `${UrlApi}/userpanel/organisasi/${user.id_pdp}`,
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
                text: 'Organisasi berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });

            window.location.href = '/userpanel/organisasi';
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
                        <i className='text-accent fa fa-sitemap text-2xl md:text-3xl pr-1 md:pr-5'></i>
                        <p className='md:text-2xl py-1 font-semibold text-accent'>ORGANISASI</p>
                    </div>
                    <div className='flex flex-row text-xs md:text-base'>
                        <button className='text-center bg-green-700 hover:bg-green-800 px-2 rounded-lg text-white' onClick={createModal}>
                            <span className='fas fa-plus'></span> Riwayat Organisasi
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
                                    <th>Nama_organisasi</th>
                                    <th>Posisi</th>
                                    <th>Tahun</th>
                                    <th>Status</th>
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
                                    <span className='mr-1 text-red-500'>Organisasi</span>
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
                                        <InputLabel htmlFor='nama_organisasi'>Nama Organisasi:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='nama_organisasi'
                                            type='text'
                                            name='nama_organisasi'
                                            required
                                            tabIndex={0}
                                            autoComplete='nama_organisasi'
                                            placeholder='Nama Organisasi'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='posisi'>Posisi / Jabatan:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='posisi'
                                            type='text'
                                            name='posisi'
                                            required
                                            tabIndex={0}
                                            autoComplete='posisi'
                                            placeholder='Posisi/Jabatan di organisasi'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleChangeCreate}
                                        />
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='status'>Status:</InputLabel>
                                        <select
                                            name='status'
                                            id='status'
                                            className='dark:bg-black border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm dark:text-gray-200 text-sm'
                                            onChange={handleChangeCreate}>
                                            <option value=''>Pilih Status</option>
                                            <option value='Masih Aktif'>Masih Aktif</option>
                                            <option value='Tidak Aktif'>Tidak Aktif</option>
                                        </select>
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
                                    {data.status == '' || data.status == 'Masih Aktif' ? (
                                        ''
                                    ) : (
                                        <div className='grid gap-2 mt-4'>
                                            <InputLabel htmlFor='tahun_keluar'>Tahun Lulus:</InputLabel>
                                            <TextInput
                                                className='text-sm'
                                                id='tahun_keluar'
                                                type='number'
                                                name='tahun_keluar'
                                                required
                                                tabIndex={2}
                                                autoComplete='tahun_keluar'
                                                placeholder='Tahun Lulus'
                                                min='1900'
                                                max={new Date().getFullYear()}
                                                step='1'
                                                onChange={handleChangeCreate}
                                            />
                                        </div>
                                    )}
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
            <div id='editModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 '>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 w-full h-full rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-red-500'>Edit Organisasi</span>
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
                                    <InputLabel htmlFor='nama_organisasi'>Jenjang Organisasi:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='nama_organisasi'
                                        type='text'
                                        name='nama_organisasi'
                                        required
                                        tabIndex={0}
                                        autoComplete='nama_organisasi'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataOrganisasi.nama_organisasi}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='posisi'>Nama Posisi Organisasi:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='posisi'
                                        type='text'
                                        name='posisi'
                                        required
                                        tabIndex={1}
                                        autoComplete='posisi'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={dataOrganisasi.posisi}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='status'>Status:</InputLabel>
                                    <select
                                        name='status'
                                        id='status'
                                        className='dark:bg-black border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm dark:text-gray-200 text-sm'
                                        onChange={handleOnChange}
                                        value={dataOrganisasi.status}>
                                        <option value=''>Pilih Status</option>
                                        <option value='Masih Aktif'>Masih Aktif</option>
                                        <option value='Tidak Aktif'>Tidak Aktif</option>
                                    </select>
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
                                        defaultValue={dataOrganisasi.tahun_masuk}
                                        onChange={handleOnChange}
                                    />
                                </div>
                                {dataOrganisasi.status == '' || dataOrganisasi.status == 'Masih Aktif' ? (

                                    ''

                                ) : (
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='tahun_keluar'>Tahun Keluar:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='tahun_keluar'
                                            type='number'
                                            name='tahun_keluar'
                                            required
                                            tabIndex={4}
                                            autoComplete='tahun_keluar'
                                            min='1900'
                                            max={new Date().getFullYear()}
                                            step='1'
                                            defaultValue={dataOrganisasi.tahun_keluar}
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                )}
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
                </div >
            </div >

            {/* delete Modal */}
            < div id='deleteModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white min-h-svh bg-opacity-90 ' >
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
                            Anda yakin ingin menghapus Riwayat Organisasi <span id='deskripsiDelete' className='dark:text-white' />
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
            </div >
        </>
    );
}
