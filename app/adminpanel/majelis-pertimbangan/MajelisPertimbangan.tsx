'use client';
import { useEffect, useRef, useState, FormEvent } from 'react';
import axios from 'axios';
import InputLabel from '@/app/components/InputLabel';
import TextInput from '@/app/components/TextInput';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { canvasPreview } from '@/app/components/CanvasPreview';
import { canvasPreview2 } from '@/app/components/CanvasPreview2';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { useDebounceEffect2 } from '@/app/components/useDebounceEffect2';
import { UrlApi } from '@/app/components/apiUrl';
import { BaseUrl } from '@/app/components/baseUrl';
import Image from 'next/image';


type MajelisPertimbangan = {
    id: number;
    id_pdp?: number;
    nama_lengkap: string;
    photo?: string | null;
    jabatan?: string | null;
};


function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

export default function MajelisPertimbangan() {
    // list state
    const [items, setItems] = useState<MajelisPertimbangan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


    // edit form
    const [dataMajelisPertimbangan, setDataMajelisPertimbangan] = useState<{ id: number | ''; nama_lengkap: string; jabatan: string; id_pdp: any }>({
        id: '',
        nama_lengkap: '',
        jabatan: '',
        id_pdp: '',
    });

    // create form
    const [dataCreate, setDataCreate] = useState<{ nama_lengkap: string; jabatan: string; id_pdp: any }>({
        nama_lengkap: '',
        jabatan: '',
        id_pdp: '',
    });

    // crop (create)
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop]: any = useState({ width: 2.8, height: 5, aspect: 2.8 / 5 });
    const [completedCrop, setCompletedCrop]: any = useState();
    const scale = 1;
    const rotate = 0;
    const aspect = 2.8 / 5;

    // crop (edit)
    const [imgEditSrc, setImgEditSrc] = useState('');
    const previewCanvasEditRef = useRef<HTMLCanvasElement | null>(null);
    const imgRefEdit = useRef<HTMLImageElement | null>(null);
    const [cropEdit, setCropEdit]: any = useState({ width: 2.8, height: 5, aspect: 2.8 / 5 });
    const [completedCropEdit, setCompletedCropEdit]: any = useState();
    const scale2 = 1;
    const rotate2 = 0;
    const aspect2 = 2.8 / 5;

    // delete
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');

    // --------- crop handlers ---------
    function onSelectFile(e: any) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc((reader.result as string) || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    function onImageLoad(e: any) {
        if (aspect) {
            const { width, height } = e.currentTarget as HTMLImageElement;
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

    function onSelectFileEdit(e: any) {
        if (e.target.files && e.target.files.length > 0) {
            setCropEdit(undefined);
            const reader2 = new FileReader();
            reader2.addEventListener('load', () => setImgEditSrc((reader2.result as string) || ''));
            reader2.readAsDataURL(e.target.files[0]);
        }
    }
    function onImageLoadEdit(e: any) {
        if (aspect2) {
            const { width, height } = e.currentTarget as HTMLImageElement;
            setCropEdit(centerAspectCrop(width, height, aspect2));
        }
    }
    useDebounceEffect2(
        async () => {
            if (completedCropEdit?.width && completedCropEdit?.height && imgRefEdit.current && previewCanvasEditRef.current) {
                canvasPreview2(imgRefEdit.current, previewCanvasEditRef.current, completedCropEdit, scale2, rotate2);
            }
        },
        100,
        [completedCropEdit, scale2, rotate2]
    );
    // --------- fetchers ---------
    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${UrlApi}/adminpanel/majelis-pertimbangan`,
                { withCredentials: true, headers: { Accept: 'application/json' } }
            );
                  setItems(res.data || []);

        } catch (err: any) {
            console.error(err);
            Swal.fire({ icon: 'error', text: err.response?.data || 'Gagal memuat data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // --------- handlers ---------
    const openCreate = () => document.getElementById('createModal')?.classList.remove('hidden');
    const closeCreate = () => document.getElementById('createModal')?.classList.add('hidden');
    const openEdit = (row: MajelisPertimbangan) => {
        setDataMajelisPertimbangan({ id: row.id, nama_lengkap: row.nama_lengkap ?? '', jabatan: row.jabatan ?? '', id_pdp: row.id_pdp ?? '' });
        document.getElementById('editModal')?.classList.remove('hidden');
    };
    const closeEdit = () => document.getElementById('editModal')?.classList.add('hidden');

    const openDelete = (row: MajelisPertimbangan) => {
        setDeleteId(row.id);
        setDeleteName(row.nama_lengkap);
        document.getElementById('deleteModal')?.classList.remove('hidden');
        document.getElementById('deleteModal')?.classList.add('flex');
    };
    const closeDelete = () => {
        document.getElementById('deleteModal')?.classList.add('hidden');
        document.getElementById('deleteModal')?.classList.remove('flex');
    };

    const handleChangeCreate = (e: any) => setDataCreate((s) => ({ ...s, [e.target.name]: e.target.value }));
    const handleOnChange = (e: any) => setDataMajelisPertimbangan((s) => ({ ...s, [e.target.name]: e.target.value }));



    // delete → DELETE /majelis-pertimbangan/{id}
    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        if (!deleteId) return;
        try {
            await axios.delete(`${UrlApi}/adminpanel/majelis-pertimbangan/${deleteId}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            Swal.fire({ icon: 'success', text: 'MajelisPertimbangan berhasil dihapus', confirmButtonColor: '#2563eb' });
            closeDelete();
            fetchList();
        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal menghapus data' });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('nama_lengkap', dataMajelisPertimbangan.nama_lengkap);
        form.append('jabatan', 'Majelis Pertimbangan DPPI');
        form.append('id_pdp', dataMajelisPertimbangan.id_pdp);
        if (previewCanvasEditRef.current) {
            await new Promise<void>((resolve) => {
                previewCanvasEditRef.current!.toBlob(async (blob) => {
                    if (blob) form.append('photo', blob, `MajelisPertimbangan_${Date.now()}.webp`);
                    resolve();
                }, 'image/webp', 0.92);
            });
        }

        await axios.put(`${UrlApi}/adminpanel/majelis-pertimbangan/${dataMajelisPertimbangan.id}`, form, {
            withCredentials: true,
            headers: { Accept: 'application/json' },
        });
        Swal.fire({
            icon: 'success',
            text: 'MajelisPertimbangan berhasil disimpan',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/adminpanel/majelis-pertimbangan'
            }
        });

    };


    // create → POST /majelis-pertimbangan
    const handleSubmitCreate = async (e: FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('nama_lengkap', dataCreate.nama_lengkap);
        form.append('jabatan', 'Majelis Pertimbangan DPPI');
        form.append('id_pdp', dataCreate.id_pdp);
        if (previewCanvasRef.current) {
            await new Promise<void>((resolve) => {
                previewCanvasRef.current!.toBlob(async (blob) => {
                    if (blob) form.append('photo', blob, `MajelisPertimbangan_${Date.now()}.webp`);
                    resolve();
                }, 'image/webp', 0.92);
            });
        }

        await axios.post(`${UrlApi}/adminpanel/majelis-pertimbangan`, form, {
            withCredentials: true,
            headers: { Accept: 'application/json' }, 
        });
        Swal.fire({
            icon: 'success',
            text: 'Majelis Pertimbangan DPPI berhasil disimpan',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/adminpanel/majelis-pertimbangan'
            }
        });


    };

    return (
        <>
            {/* Header dan Search */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6'>
                <div className='flex items-center mb-4 lg:mb-0'>
                    <i className='text-accent fa fa-user-tie text-5xl pr-5'></i>
                    <p className='text-accent mt-1 mx-2 font-bold lg:text-2xl dark:text-white'>Majelis Pertimbangan DPPI</p>
                </div>
                <button className='text-center bg-teal-700 hover:bg-teal-800 px-3 py-1 rounded-lg text-white' onClick={openCreate}>
                    Tambah Data
                </button>

            </div>
        


            {loading && <div className='px-0 mx-auto mt-6 lg:px-4 text-slate-900 dark:text-slate-50'>Loading...</div>}

            <div className='relative p-0 overflow-hidden rounded-md w-full'>
                <div className='px-0 mx-auto mt-2 bg-white rounded-md shadow-lg dark:bg-default'>
                    <div className='mx-auto overflow-x-auto text-xs 2xl:text-base'>
                        <table className='min-w-full text-left text-sm'>
                            <thead>
                                <tr className='text-center'>
                                    <th className='border py-2 px-2'>#</th>
                                    <th className='border py-2 px-2'>Photo</th>
                                    <th className='border py-2 px-2'>Nama Lengkap</th>
                                    <th className='border py-2 px-2'>ID PDP</th>
                                    <th className='border py-2 px-2'>Jabatan</th>
                                    <th className='border py-2 px-2'>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && !loading && (
                                    <tr className=''>
                                        <td colSpan={5} className='py-4 text-center text-gray-500'>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}

                                {items.map((row, idx) => (
                                    <tr key={row.id} className='border-b'>
                                        <td className='py-2 px-2 border'>{idx + 1}</td>
                                        <td className='py-2 px-2 border'>
                                            <Image
                                                src={row.photo ? `${BaseUrl + row.photo}` : '/assets/images/placeholder-user.png'}
                                                width={100}
                                                height={150}
                                                className='mx-auto'
                                                alt={row.nama_lengkap}
                                            />
                                        </td>
                                        <td className='py-2 px-2 border'>{row.nama_lengkap}</td>
                                        <td className='py-2 px-2 border'>{row.id_pdp}</td>
                                        <td className='py-2 px-2 border'>{row.jabatan || '-'}</td>
                                        <td className='py-2 px-2 border'>
                                            <div className='flex gap-2 justify-center'>
                                                <button
                                                    className='text-white rounded-md hover:bg-green-700 bg-green-600 px-4 py-1'
                                                    onClick={() => openEdit(row)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className='text-white rounded-md hover:bg-red-700 bg-accent px-4 py-1'
                                                    onClick={() => openDelete(row)}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>


                    </div>
                </div>
            </div>

            {/* create Modal */}
            <div id='createModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white/50 min-h-svh'>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-175 mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Tambah MajelisPertimbangan Pusat</span>
                            </div>
                            <button type='button' onClick={closeCreate} className='text-accent hover:scale-125 rounded-lg p-1.5 text-lg'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='photo'>Foto Diri:</InputLabel>
                                    <input className='border-2 text-sm w-full rounded-md bg-white dark:bg-black dark:text-white' type='file' accept='image/*' onChange={onSelectFile} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 my-2 mx-36'>
                                    {Boolean(imgSrc) && (
                                        <ReactCrop crop={crop} onChange={(_, c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                            <img
                                                ref={imgRef}
                                                alt="Crop me"
                                                src={imgSrc}
                                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                    )}
                                    <div>
                                        {Boolean(completedCrop) && (
                                            <canvas
                                                ref={previewCanvasRef}
                                                style={{ border: '1px solid black', objectFit: 'contain', width: completedCrop.width, height: completedCrop.height }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_lengkap'>Nama Lengkap:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='nama_lengkap'
                                        type='text'
                                        name='nama_lengkap'
                                        required
                                        tabIndex={1}
                                        autoComplete='nama_lengkap'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                        value={dataCreate.nama_lengkap}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='id_pdp'>Id PDP:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='id_pdp'
                                        type='text'
                                        name='id_pdp'
                                        required
                                        tabIndex={2}
                                        pattern="^[0-9]+$"
                                        title="Hanya angka"
                                        autoComplete='id_pdp'
                                        onChange={handleChangeCreate}
                                        value={dataCreate.id_pdp}
                                    />
                                </div>


                            </div>
                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeCreate} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>
                                <button type='submit' tabIndex={3} className='px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* edit Modal */}
            <div id='editModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white/50 min-h-svh'>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-175 mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative mx-auto bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Edit MajelisPertimbangan Pusat</span>
                            </div>
                            <button type='button' onClick={closeEdit} className='text-accent hover:scale-125 rounded-lg p-1.5 text-lg'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='photo'>Foto Diri:</InputLabel>
                                    <input className='border-2 text-sm w-full rounded-md bg-white dark:bg-black dark:text-white' type='file' accept='image/*' onChange={onSelectFileEdit} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 my-2 mx-10 sm:mx-36'>
                                    {Boolean(imgEditSrc) && (
                                        <ReactCrop crop={cropEdit} onChange={(_, c) => setCropEdit(c)} onComplete={(c) => setCompletedCropEdit(c)} aspect={aspect2}>
                                            <img
                                                ref={imgRefEdit}
                                                alt="Crop me"
                                                src={imgEditSrc}
                                                style={{ transform: `scale(${scale2}) rotate(${rotate2}deg)` }}
                                                onLoad={onImageLoadEdit}
                                            />
                                        </ReactCrop>
                                    )}
                                    <div>
                                        {Boolean(completedCropEdit) && (
                                            <canvas
                                                ref={previewCanvasEditRef}
                                                style={{ border: '1px solid black', objectFit: 'contain', width: completedCropEdit.width, height: completedCropEdit.height }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_lengkap'>Nama Lengkap:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='nama_lengkap'
                                        type='text'
                                        name='nama_lengkap'
                                        required
                                        defaultValue={dataMajelisPertimbangan.nama_lengkap}
                                        tabIndex={1}
                                        autoComplete='nama_lengkap'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleOnChange}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='id_pdp'>Id PDP:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='id_pdp'
                                        type='text'
                                        name='id_pdp'
                                        required
                                        tabIndex={2}
                                        pattern="^[0-9]+$"
                                        title="Hanya angka"
                                        autoComplete='id_pdp'
                                        onChange={handleOnChange}
                                        value={dataMajelisPertimbangan.id_pdp}
                                    />
                                </div>
                            </div>
                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeEdit} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>
                                <button type='submit' tabIndex={3} className='px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* delete Modal */}
            <div id='deleteModal' className='justify-center fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='fixed z-30 w-full justify-center max-w-125 mx-auto md:top-12 lg:top-40 top-14'>
                    <div className='w-full mx-auto bg-gray-100 border-2 border-red-200 rounded-md shadow-md dark:bg-default'>
                        <div className='flex flex-col px-4 py-2 rounded-t border-b dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-accent'>Hapus Data</span>
                                <button type='button' onClick={closeDelete} className='text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                        </div>
                        <div className='mt-4 px-4'>
                            <span className='dark:text-white'>Anda yakin ingin menghapus </span>
                            <span className='dark:text-white font-semibold'>{deleteName}</span>
                            <span className='dark:text-white'>?</span>
                        </div>
                        <div className='mt-2 border-b dark:border-gray-600'></div>
                        <div className='px-4 mb-4'>
                            <form onSubmit={deleteSubmit}>
                                <div className='flex flex-row justify-between'>
                                    <button type='button' onClick={closeDelete} className='py-1 px-4 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Batal
                                    </button>
                                    <button type='submit' className='px-4 py-1 mt-2 text-white rounded-md bg-accent'>
                                        Hapus
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
