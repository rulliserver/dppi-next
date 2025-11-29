'use client'
import { useEffect, useRef, useState, FormEvent } from 'react';
import 'datatables.net-dt';
import $ from 'jquery';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { canvasPreview } from '@/app/components/CanvasPreview';
import { UrlApi } from '@/app/components/apiUrl';
import TextInput from '@/app/components/TextInput';
import { BaseUrl } from '@/app/components/baseUrl';
import { useDebounceEffect2 } from '@/app/components/useDebounceEffect2';
import { canvasPreview2 } from '@/app/components/CanvasPreview2';
import axios from 'axios';

function centerAspectCrop(mediaWidth: any, mediaHeight: any, aspect: any) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function User() {
    const [users, setUsers]: any = useState();
    const [deleteData, setDeleteData]: any = useState();
    const [error, setError]: any = useState();
    const [loading, setLoading]: any = useState(false);
    const [provinsi, setProvinsi]: any = useState()
    const [kabupaten, setKabupaten]: any = useState()

    useEffect(() => {
        fetchAllUsers();
    }, [setUsers, setKabupaten, setProvinsi]);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response: any = await fetch(`${UrlApi}/adminpanel/get-all-user`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const resProv: any = await fetch(`${UrlApi}/provinsi`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const resKab: any = await fetch(`${UrlApi}/kabupaten`, {
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            console.log(data);

            const dataProv = await resProv.json();
            const dataKab = await resKab.json();
            setUsers(data);
            setProvinsi(dataProv);
            setKabupaten(dataKab);

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(errorMsg);
            console.error('Error fetching user data:', errorMsg);
        }
        setLoading(false);
    };

    //data table
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { defaultContent: '', orderable: false },
        {
            data: 'avatar',
            render: function (data: any, type: any, row: any) {
                return `<img src=${BaseUrl + data} class="max-w-20 mx-auto p-0" />`;
            },
        },
        { data: 'name' },
        { data: 'email' },
        { data: 'address' },
        { data: 'phone' },
        { data: 'role' },
        { data: 'id_pdp' },
        { data: 'nama_provinsi' },
        { data: 'nama_kabupaten' },
        {

            render: function (data: any, type: any, row: any) {
                return '<div class="flex flex-col justify-center"><button class="edit-btn text-white rounded-md ml-4 hover:bg-green-700 bg-green-600 px-4 mt-2 py-1">Edit</button><button class="delete-btn text-white rounded-md ml-4 hover:bg-red-700 bg-accent px-4 mt-2 py-1">Hapus</button></div>';
            },
        },
    ];
    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: users,
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
            setEditData({
                id: editData.id,
                name: editData.name,
                email: editData.email,
                address: editData.address,
                phone: editData.phone,
                role: editData.role,
                id_pdp: editData.id_pdp,
                id_provinsi: editData.id_provinsi,
                id_kabupaten: editData.id_kabupaten,

            });
            $('#nama').text(editData.name);
            $('#email').text(editData.email);
            $('#modalEdit').removeClass('hidden');
        });
        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.nama_kegiatan);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
            $('#deleteModal').addClass('flex');
        });
    }, [users, kabupaten, provinsi]);

    //avatar
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const previewCanvasRef2 = useRef(null);
    const imgRef = useRef(null);
    const imgRef2 = useRef(null);
    const [crop, setCrop]: any = useState({
        width: 1,
        height: 1,
        aspect: 1 / 1
    });
    const [completedCrop, setCompletedCrop]: any = useState();
    const [scale, setScale]: any = useState(1);
    const [rotate, setRotate]: any = useState(0);
    const [aspect, setAspect]: any = useState(1 / 1);

    function onSelectFile(e: any) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader: any = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    function onImageLoad(e: any) {
        if (aspect) {
            const { width, height }: any = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    useDebounceEffect(
        async () => {
            if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
                canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
            }
        },
        100,
        [completedCrop, scale, rotate]
    );

    useDebounceEffect2(
        async () => {
            if (completedCrop?.width && completedCrop?.height && imgRef2.current && previewCanvasRef2.current) {
                canvasPreview2(imgRef2.current, previewCanvasRef2.current, completedCrop, scale, rotate);
            }
        },
        100,
        [completedCrop, scale, rotate]
    );
    // edit
    const [editData, setEditData]: any = useState({
        id: '',
        name: '',
        email: '',
        address: '',
        phone: '',
        role: '',
        id_pdp: '',
        id_kabupaten: 0,
        id_provinsi: 0,
        nama_provinsi: '',
        nama_kabupaten: ''
    });
    console.log(editData);

    const [editConfirmPasswordError, setEditConfirmPasswordError] = useState('');
    const handleEditChange = (e: any) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value
        });

    };
    const [selectedProvinsiEdit, setSelectedProvinsiEdit]: any = useState<string>('');
    const filteredKabupatenEdit = kabupaten?.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsiEdit ? selectedProvinsiEdit : editData.id_provinsi));
    const handleProvinsiChangeEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setEditData((prev: any) => ({
            ...prev,
            id_provinsi: value,
            id_kabupaten: '', // Reset kabupaten saat provinsi berubah
        }));
        setSelectedProvinsiEdit(value);
    };

    const closeModal = () => {
        window.location.reload();
    };

    const handleSubmitEdit = async (e: FormEvent) => {
        e.preventDefault();
        const confirmPassword = (document.getElementById('edit_confirm_password') as HTMLInputElement)?.value;

        if (editData.password && confirmPassword !== editData.password) {
            setEditConfirmPasswordError('Konfirmasi password tidak sesuai.');
            return;
        }
        setEditConfirmPasswordError('');

        try {
            const formData = new FormData();
            if (previewCanvasRef.current) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('avatar', croppedBlob);
            }
            formData.append('name', editData.name);
            formData.append('email', editData.email);
            formData.append('address', editData.address || '');
            formData.append('phone', editData.phone || '');
            formData.append('role', editData.role);
            formData.append('id_pdp', editData.id_pdp || '');
            formData.append('id_kabupaten', editData.id_kabupaten || '');
            formData.append('id_provinsi', editData.id_provinsi || '');

            await axios.put(`${UrlApi}/adminpanel/edit-user/${editData.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            Swal.fire({
                icon: 'success',
                text: 'User berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/user';
                }
            });
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', text: 'Terjadi kesalahan saat memperbarui data' });
        }
    };

    //tambah data
    const [dataUser, setDataUser]: any = useState({
        id: '',
        name: '',
        email: '',
        address: '',
        phone: '',
        password: '',
        role: '',
        id_pdp: '',
        id_kabupaten: 0,
        id_provinsi: 0,
        nama_provinsi: '',
        nama_kabupaten: ''
    });
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const createModal = () => {
        $('#createModal').removeClass('hidden');
    };
    const handleChangeCreate = (e: any) => {
        const { name, value } = e.target;
        setDataUser({
            ...dataUser,
            [name]: value
        });
    };
    const [selectedProvinsiCreate, setSelectedProvinsiCreate] = useState<string>('');
    const filteredKabupatenCreate = kabupaten?.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsiCreate ? selectedProvinsiCreate : dataUser.id_provinsi));
    const handleProvinsiChangeCreate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setDataUser((prev: any) => ({
            ...prev,
            id_provinsi: value,
            id_kabupaten: '', // Reset kabupaten saat provinsi berubah
        }));
        setSelectedProvinsiCreate(value);
    };
    //Submit Create
    const handleSubmitCreate = async (e: FormEvent) => {
        e.preventDefault();

        const confirmPasswordInput = (document.getElementById('confirm_password') as HTMLInputElement)?.value;

        if (dataUser.password !== confirmPasswordInput) {
            setConfirmPasswordError('Konfirmasi password tidak sesuai.');
            return;
        }

        setConfirmPasswordError(''); // Reset jika cocok

        try {
            const formData = new FormData();
            if (previewCanvasRef2.current) {
                const canvas: any = previewCanvasRef2.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('avatar', croppedBlob);
            }
            formData.append('name', dataUser.name);
            formData.append('email', dataUser.email);
            formData.append('address', dataUser.address || '');
            formData.append('phone', dataUser.phone || '');
            formData.append('password', dataUser.password);
            formData.append('role', dataUser.role);
            formData.append('id_pdp', dataUser.id_pdp);
            formData.append('id_provinsi', dataUser.id_provinsi);
            formData.append('id_kabupaten', dataUser.id_kabupaten);
            const response = await fetch(`${UrlApi}/adminpanel/new-user`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambahkan user');
            }

            Swal.fire({
                icon: 'success',
                text: 'User berhasil ditambahkan',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetchAllUsers();
                    closeModal();
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim data'
            });
        }
    };

    //hapus
    const handleDeleteUser = async () => {
        try {
            const response = await fetch(`${UrlApi}/adminpanel/delete-user/${deleteData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', text: 'Data berhasil dihapus' }).then((result) => {
                    if (result.isConfirmed) {
                        fetchAllUsers();
                        closeModal();
                    }
                });
            } else {
                throw new Error('Gagal hapus user');
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', text: 'Terjadi kesalahan saat menghapus data' });
        }
    };

    return (
        <div>
            <div className='py-4'>
                <div className='text-gray-900 flex flex-row justify-between mx-2'>
                    <div className='flex flex-row'>
                        <i className='text-red-600 fa fa-users text-2xl md:text-4xl pr-2'></i>
                        <p className='text-sm md:text-xl py-1 font-semibold text-red-600'>KELOLA USER</p>
                    </div>

                    <button className='text-center bg-[#1d4ed8] hover:bg-blue-600 px-2 rounded-lg text-white' onClick={createModal}>
                        Tambah User
                    </button>
                </div>
            </div>
            <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-gray-800 text-center dark:text-gray-50'>Loading...</div>}</div>

            <div className='relative p-0 overflow-hidden rounded-md shadow-sm shadow-gray-500 mr-2'>
                <div className='px-0 mx-auto rounded-md dark:bg-default lg:px-4'>
                    <div className='px-4 mx-auto overflow-auto text-xs 1xl:block 1xl:w-full 2xl:text-base my-5'>
                        <table ref={tableRef} className='table text-xs dataTable cell-border table-bordered'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Avatar</th>
                                    <th>Nama Lengkap</th>
                                    <th>Email</th>
                                    <th>Alamat</th>
                                    <th>Telepon</th>
                                    <th>role</th>
                                    <th>ID PDP</th>
                                    <th>Provinsi</th>
                                    <th>Kabupaten</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <div id='modalEdit' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-3xl mx-auto md:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <span className='font-semibold text-red-500'>Edit User</span>
                            <button type='button' onClick={closeModal} className='cursor-pointer text-red-500 hover:scale-125 p-1.5 text-lg'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='avatar'>Foto:</label>
                                    <input className='col-span-3 bg-white dark:bg-black border-2 text-sm w-full rounded-md' type='file' accept='image/*' onChange={onSelectFile} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 my-2 mx-36'>
                                    {Boolean(imgSrc) && (
                                        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                            <img
                                                ref={imgRef}
                                                alt='Crop me'
                                                src={imgSrc}
                                                data-form={`scale(${scale}) rotate(${rotate}deg)`}
                                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                    )}
                                    <div>
                                        {Boolean(completedCrop) && (
                                            <canvas
                                                ref={previewCanvasRef}
                                                style={{
                                                    border: '1px solid black',
                                                    objectFit: 'contain',
                                                    width: completedCrop.width,
                                                    height: completedCrop.height
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='edit_name'>Nama Lengkap:</label>
                                    <TextInput className='text-sm col-span-3' id='edit_name' type='text' name='name' value={editData.name || ''} onChange={handleEditChange} required />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label>Email:</label>
                                    <TextInput className='text-sm col-span-3' name='email' type='email' value={editData.email || ''} onChange={handleEditChange} required />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label>Alamat:</label>
                                    <TextInput className='text-sm col-span-3' name='address' type='text' value={editData.address || ''} onChange={handleEditChange} />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label>No. Ponsel:</label>
                                    <TextInput className='text-sm col-span-3' name='phone' type='text' value={editData.phone || ''} onChange={handleEditChange} />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label>ID PDP:</label>
                                    <TextInput className='text-sm col-span-3' name='id_pdp' type='text' value={editData.id_pdp || ''} onChange={handleEditChange} />
                                </div>

                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='role'>Role :</label>
                                    <select
                                        name='role'
                                        id='role'
                                        value={editData.role}
                                        required
                                        onChange={handleEditChange}
                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>Pilih Role</option>
                                        <option value='Administrator'>Administrator</option>
                                        <option value='Admin Kesbangpol'>Admin Kesbangpol</option>
                                        <option value='Pelaksana'>Pelaksana</option>
                                        <option value='Anggota'>Anggota</option>
                                    </select>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='id_provinsi'>Provinsi:</label>
                                    <select
                                        name='id_provinsi'
                                        onChange={handleProvinsiChangeEdit}
                                        value={editData.id_provinsi}
                                        tabIndex={13}
                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>--Pilih Provinsi--</option>
                                        {provinsi && provinsi.map((item: any) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama_provinsi}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='id_kabupaten'>Kabupaten:</label>
                                    <select
                                        name='id_kabupaten'
                                        value={editData.id_kabupaten}
                                        onChange={handleEditChange}
                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>--Pilih Kabupaten--</option>
                                        {filteredKabupatenEdit?.map((item: any) => (
                                            <option key={item.id} value={item.id}>{item.nama_kabupaten}</option>
                                        ))}
                                    </select>
                                </div>


                            </div>
                            <div className='flex justify-between px-4 pb-2 border-t-2 border-white'>
                                <button type='button' onClick={closeModal} className='cursor-pointer px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                                    Tutup
                                </button>
                                <button type='submit' className='cursor-pointer px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* create Modal */}
            <div id='createModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-3xl mx-auto md:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg dark:border dark:border-red-500'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-red-500'>Tambah User</span>
                            </div>
                            <button
                                type='button'
                                onClick={closeModal}
                                className='close-btn text-red-500 hover:text-red-500 hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='avatar'>Foto:</label>
                                    <input className='col-span-3 bg-white dark:bg-black border-2 text-sm w-full rounded-md' type='file' accept='image/*' onChange={onSelectFile} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 my-2 mx-36'>
                                    {Boolean(imgSrc) && (
                                        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                            <img
                                                ref={imgRef2}
                                                alt='Crop me'
                                                src={imgSrc}
                                                data-form={`scale(${scale}) rotate(${rotate}deg)`}
                                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                    )}
                                    <div>
                                        {Boolean(completedCrop) && (
                                            <canvas
                                                ref={previewCanvasRef2}
                                                style={{
                                                    border: '1px solid black',
                                                    objectFit: 'contain',
                                                    width: completedCrop.width,
                                                    height: completedCrop.height
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='name'>Nama Lengkap:</label>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='name'
                                        type='text'
                                        name='name'
                                        required
                                        tabIndex={0}
                                        autoComplete='name'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='email'>Email:</label>
                                    <TextInput className='text-sm col-span-3' id='email' type='email' name='email' required tabIndex={1} autoComplete='email' onChange={handleChangeCreate} />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='address'>Alamat:</label>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='address'
                                        type='text'
                                        name='address'
                                        tabIndex={2}
                                        autoComplete='address'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='phone'>No. Ponsel:</label>
                                    <TextInput className='text-sm col-span-3' id='phone' type='number' name='phone' tabIndex={3} autoComplete='phone' step={1} onChange={handleChangeCreate} />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='id_pdp'>ID PDP:</label>
                                    <TextInput className='text-sm col-span-3' id='id_pdp' type='number' name='id_pdp' tabIndex={3} autoComplete='id_pdp' step={1} onChange={handleChangeCreate} />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='role'>Role :</label>
                                    <select
                                        name='role'
                                        tabIndex={4}
                                        required
                                        onChange={handleChangeCreate}
                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>Pilih Role</option>
                                        <option value='Administrator'>Administrator</option>
                                        <option value='Admin Kesbangpol'>Admin Kesbangpol</option>
                                        <option value='Pelaksana'>Pelaksana</option>
                                        <option value='Anggota'>Anggota</option>
                                    </select>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='id_provinsi'>Provinsi:</label>
                                    <select
                                        name='id_provinsi'
                                        id='id_provinsi'
                                        onChange={handleProvinsiChangeCreate}
                                        tabIndex={13}

                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>--Pilih Provinsi--</option>
                                        {provinsi && provinsi.map((item: any) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama_provinsi}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='id_kabupaten'>Kabupaten:</label>
                                    <select
                                        name='id_kabupaten'
                                        id='id_kabupaten'
                                        value={dataUser.id_kabupaten}

                                        onChange={handleChangeCreate}
                                        className='text-sm col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-red-500'>
                                        <option value=''>--Pilih Kabupaten--</option>
                                        {filteredKabupatenCreate?.map((item: any) => (
                                            <option key={item.id} value={item.id}>{item.nama_kabupaten}</option>
                                        ))}
                                    </select>
                                </div>


                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='password'>Password:</label>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='password'
                                        minLength={8}
                                        type='password'
                                        name='password'
                                        tabIndex={7}
                                        autoComplete='password'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <label htmlFor='confirm_password'>Konfirmasi Password:</label>
                                    <div className='col-span-3'>
                                        <TextInput
                                            className='text-sm w-full'
                                            id='confirm_password'
                                            minLength={8}
                                            type='password'
                                            name='confirm_password'
                                            tabIndex={8}
                                            autoComplete='confirm_password'
                                            onChange={handleChangeCreate}
                                        />
                                        {confirmPasswordError && <p className='text-red-600 text-xs mt-1'>{confirmPasswordError}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className='border-t-2 mt-4 border-white'></div>
                            <div className='flex justify-between px-4 pb-2'>
                                <button type='button' onClick={closeModal} className='px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                                    Tutup
                                </button>

                                <button type='submit' tabIndex={10} className={`px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md`}>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Delete Modal */}
            <div id='deleteModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-md mx-auto md:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg'>
                        <div className='p-6 text-center'>
                            <i className='fas fa-exclamation-triangle text-red-500 text-4xl mb-2'></i>
                            <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                                Apakah Anda yakin ingin menghapus <strong>{deleteData?.name}</strong>?
                            </h3>
                            <button onClick={handleDeleteUser} className='text-white bg-red-600 hover:bg-red-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2 mr-2'>
                                Ya, Hapus
                            </button>
                            <button onClick={closeModal} className='text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 px-5 py-1'>
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
