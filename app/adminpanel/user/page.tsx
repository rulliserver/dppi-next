'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { UrlApi } from '../../Components/apiUrl';
import $ from 'jquery';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import Swal from 'sweetalert2';
import { useDebounceEffect } from '../../Components/useDebounceEffect';
import { canvasPreview } from '../../Components/CanvasPreview';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import TextInput from '../../Components/TextInput';
import { useDebounceEffect2 } from '../../Components/useDebounceEffect2';
import { canvasPreview2 } from '../../Components/CanvasPreview2';
import AdminLayout from '@/app/Layouts/AdminLayout';
import Image from 'next/image';
import { BaseUrl } from '@/app/Components/baseUrl';
type Users = {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    role: string;
    geotourism_id: number;
    geotourism_name: string;
    status: string;
    photo: string;
};
const columnHelper = createColumnHelper<Users>();
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

export default function Page() {
    const [users, setUsers]: any = useState();
    const [deleteData, setDeleteData]: any = useState();
    const [error, setError]: any = useState();
    const [loading, setLoading]: any = useState(false);

    useEffect(() => {
        fetchAllUsers();
    }, [setUsers]);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${UrlApi}/get-all-user`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(errorMsg);
            console.error('Error fetching user data:', errorMsg);
        }
        setLoading(false);
    };

    //ambil geotourismn
    const [geotourism, setGeotourism]: any = useState(null);
    const [isLoading, setIsLoading]: any = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${UrlApi}/geotourism`);

                const result = await response.json();

                setGeotourism(result.geotourisms);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    //edit
    //photo
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
        geotourism_id: '',
        geotourism_name: '',
        status: ''
    });

    const [editConfirmPasswordError, setEditConfirmPasswordError] = useState('');
    const handleEditChange = (e: any) => {
        const { name, value } = e.target;

        if (name === 'geotourism_id') {
            const selected = geotourism?.find((item: any) => item.id === parseInt(value));
            setEditData({
                ...editData,
                geotourism_id: value,
                geotourism_name: selected?.nama_geowisata
            });
        } else {
            setEditData({
                ...editData,
                [name]: value
            });
        }
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
                formData.append('photo', croppedBlob);
            }
            formData.append('name', editData.name);
            formData.append('email', editData.email);
            formData.append('address', editData.address || '');
            formData.append('phone', editData.phone || '');
            formData.append('role', editData.role);
            formData.append('geotourism_id', editData.geotourism_id || '');
            formData.append('geotourism_name', editData.geotourism_name || '');
            formData.append('status', editData.status || '');

            const response = await fetch(`${UrlApi}/edit-user/${editData.id}`, {
                method: 'put',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                fetchAllUsers();
                closeModal();
            }
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
        geotourism_id: '',
        geotourism_name: '',
        status: ''
    });
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const createModal = () => {
        $('#createModal').removeClass('hidden');
    };
    const handleChangeCreate = (e: any) => {
        const { name, value } = e.target;

        // Jika memilih geotourism_id, maka isi juga nama geowisatanya
        if (name === 'geotourism_id') {
            const selected = geotourism?.find((item: any) => item.id === value);
            setDataUser({
                ...dataUser,
                geotourism_id: value,
                geotourism_name: selected?.nama_geowisata || ''
            });
        } else {
            setDataUser({
                ...dataUser,
                [name]: value
            });
        }
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
                formData.append('photo', croppedBlob);
            }
            formData.append('name', dataUser.name);
            formData.append('email', dataUser.email);
            formData.append('address', dataUser.address || '');
            formData.append('phone', dataUser.phone || '');
            formData.append('password', dataUser.password);
            formData.append('role', dataUser.role);
            formData.append('geotourism_id', dataUser.geotourism_id || '');
            formData.append('status', dataUser.status || '');

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
            const response = await fetch(`${UrlApi}/delete-user/${deleteData.id}`, {
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
    //data table
    const columns: any = [
        columnHelper.display({
            id: 'photo',
            header: 'Photo',
            cell: ({ row }) => {
                const userPhoto = row.original.photo;

                return <Image src={`${BaseUrl}/${userPhoto}`} alt='User Photo' width={40} height={40} />;
            }
        }),
        columnHelper.accessor('name', {
            header: 'Nama'
        }),
        columnHelper.accessor('geotourism_name', {
            header: 'Nama Geowisata'
        }),
        columnHelper.accessor('address', {
            header: 'Alamat'
        }),
        columnHelper.accessor('email', {
            header: 'Email'
        }),
        columnHelper.accessor('phone', {
            header: 'Telepon'
        }),

        columnHelper.display({
            id: 'aksi',
            header: 'Aksi',
            cell: ({ row }) => {
                const userSelected = row.original;

                return (
                    <button
                        className='px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition'
                        onClick={() => {
                            setEditData(userSelected);
                            $('#modalEdit').removeClass('hidden');
                        }}>
                        Edit
                    </button>
                );
            }
        })
    ];

    function UserTable({ data }: { data: Users[] }) {
        const [globalFilter, setGlobalFilter] = useState('');
        const [pageSize, setPageSize] = useState(10);

        const table = useReactTable({
            data,
            columns,
            state: {
                globalFilter
            },
            onGlobalFilterChange: setGlobalFilter,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel()
        });
        return (
            <div>
                {/* Global Filter */}
                <input
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder='🔍 Cari user...'
                    className='border border-orange-500 dark:text-white px-2 py-1 mb-3 rounded w-full'
                />

                {/* Tabel */}
                <div className='data-table dark:text-white'>
                    <div className='table-responsive'>
                        <table className='table dark:border-white border-orange-500 border mb-0 w-full'>
                            <thead className=''>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className='px-2 py-1'>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className='dark:border-white dark:hover:text-black dark:bg-gray-900 border-orange-500 border'>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={`px-2  border-orange-500 py-1`}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                <div className='flex justify-between items-center mt-4 dark:text-white'>
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        ⬅️ Sebelumnya
                    </button>
                    <span>
                        Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                    </span>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Selanjutnya ➡️
                    </button>
                    <select
                        className='ml-2 border px-2 py-1 rounded-xl border-orange-500 dark:border-white'
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            table.setPageSize(Number(e.target.value));
                        }}>
                        {[10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                Tampilkan {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }
    return (
        <AdminLayout>
            <div>
                <div className='py-4'>
                    <div className='text-gray-900 flex flex-row justify-between mx-2'>
                        <div className='flex flex-row'>
                            <i className='text-orange-600 fa fa-users text-2xl md:text-4xl pr-2'></i>
                            <p className='text-sm md:text-xl py-1 font-semibold text-orange-600'>KELOLA USER</p>
                        </div>

                        <button className='text-center bg-[#1d4ed8] hover:bg-blue-600 px-2 rounded-lg text-white' onClick={createModal}>
                            Tambah User
                        </button>
                    </div>
                </div>
                <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-gray-800 text-center dark:text-gray-50'>Loading...</div>}</div>

                <div className='relative p-0 overflow-hidden rounded-md shadow-sm shadow-gray-500 mr-2'>
                    <div className='px-0 mx-auto rounded-md dark:bg-default lg:px-4'>
                        <div className='px-4 mx-auto overflow-auto text-xs 1xl:block 1xl:w-full 2xl:text-base my-5'>{users ? <UserTable data={users} /> : <></>}</div>
                    </div>
                </div>

                {/* Edit Modal */}
                <div id='modalEdit' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-modal md:h-full'>
                    <div className='relative w-full h-full max-w-3xl mx-auto md:h-auto overflow-x-hidden overflow-y-auto'>
                        <div className='relative bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg'>
                            <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                                <span className='font-semibold text-orange-500'>Edit User</span>
                                <button type='button' onClick={closeModal} className='cursor-pointer text-orange-500 hover:scale-125 p-1.5 text-lg'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmitEdit}>
                                <div className='px-4 py-2 text-dark dark:text-white'>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <label htmlFor='photo'>Foto:</label>
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
                                        <label>Geowisata:</label>
                                        <select
                                            name='geotourism_id'
                                            value={editData.geotourism_id || ''}
                                            onChange={handleEditChange}
                                            className='text-sm col-span-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500'>
                                            <option value=''>Pilih Geowisata</option>
                                            {geotourism?.map((item: any, key: any) => (
                                                <option key={key} value={item.id}>
                                                    {item.nama_geowisata}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <label htmlFor='status'>Status :</label>
                                        <select
                                            name='status'
                                            id='status'
                                            value={editData.status}
                                            required
                                            onChange={handleEditChange}
                                            className='text-sm col-span-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500'>
                                            <option value=''>Pilih Status</option>
                                            <option value='Aktif'>Aktif</option>
                                            <option value='Tidak Aktif'>Tidak Aktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='flex justify-between px-4 pb-2 border-t-2 border-white'>
                                    <button type='button' onClick={closeModal} className='cursor-pointer px-8 py-2 mt-2 text-white bg-orange-500 rounded-md'>
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
                        <div className='relative bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg dark:border dark:border-orange-500'>
                            <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white '>
                                    <span className='mr-1 text-orange-500'>Tambah User</span>
                                </div>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='close-btn text-orange-500 hover:text-orange-500 hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                    publikasi-modal-hide='editModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmitCreate}>
                                <div className='px-4 py-2 text-dark dark:text-white'>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <label htmlFor='photo'>Foto:</label>
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
                                        <label htmlFor='role'>Role :</label>
                                        <select
                                            name='role'
                                            id='role'
                                            tabIndex={4}
                                            required
                                            onChange={handleChangeCreate}
                                            className='text-sm col-span-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500'>
                                            <option value=''>Pilih Role</option>
                                            <option value='Administrator'>Administrator</option>
                                            <option value='BP Geopark'>BP Geopark</option>
                                            <option value='Pengelola Geowisata'>Pengelola Geowisata</option>
                                        </select>
                                    </div>
                                    {dataUser.role === 'Pengelola Geowisata' ? (
                                        <div className='grid grid-cols-4 gap-2 mt-4'>
                                            <label htmlFor='geotourism_id'>Geowisata :</label>
                                            <select
                                                name='geotourism_id'
                                                id='geotourism_id'
                                                onChange={handleChangeCreate}
                                                tabIndex={5}
                                                className='text-sm col-span-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500'>
                                                <option value=''>Pilih Geowisata</option>
                                                {geotourism &&
                                                    geotourism.map((item: any, key: any) => (
                                                        <option key={key} value={item.id}>
                                                            {item.nama_geowisata}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <label htmlFor='status'>Status :</label>
                                        <select
                                            name='status'
                                            tabIndex={6}
                                            required
                                            onChange={handleChangeCreate}
                                            className='text-sm col-span-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500'>
                                            <option value=''>Pilih Status</option>
                                            <option value='Aktif'>Aktif</option>
                                            <option value='Tidak Aktif'>Tidak Aktif</option>
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
                                    <button type='button' onClick={closeModal} className='px-8 py-2 mt-2 text-white bg-orange-500 rounded-md'>
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
                                <i className='fas fa-exclamation-triangle text-orange-500 text-4xl mb-2'></i>
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
        </AdminLayout>
    );
}
