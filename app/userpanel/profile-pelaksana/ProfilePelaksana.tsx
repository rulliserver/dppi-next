//app/userpanel/profile-pelaksana/ProfilePelaksana.tsx
'use client';
import { useEffect, useRef, useState, FormEvent, useMemo } from 'react';
import axios from 'axios';
import InputLabel from '@/app/Components/InputLabel';
import TextInput from '@/app/Components/TextInput';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { canvasPreview } from '@/app/Components/CanvasPreview';
import { canvasPreview2 } from '@/app/Components/CanvasPreview2';
import { useDebounceEffect } from '@/app/Components/useDebounceEffect';
import { useDebounceEffect2 } from '@/app/Components/useDebounceEffect2';
import { UrlApi } from '@/app/Components/apiUrl';
import Pagination from '@/app/Components/Pagination';
import { BaseUrl } from '@/app/Components/baseUrl';
import Image from 'next/image';
import { useUser } from '@/app/Components/UserContext';

type Pelaksana = {
    id: number;
    id_pdp?: number;
    id_provinsi?: number;
    id_kabupaten?: number;
    nama_lengkap: string;
    photo?: string | null;
    jabatan?: string | null;
    nama_kabupaten?: string | null;
    nama_provinsi?: string | null;
    tingkat_kepengurusan?: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type ListResp = {
    links: PaginationLink[];
    data: Pelaksana[];
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    from: number;
    to: number;
    query: string;
};

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

export default function ProfilePelaksana() {
    // list state
    const { user } = useUser();

    const [items, setItems] = useState<Pelaksana[]>([]);
    const [data, setData] = useState<any>();
    const [kabupaten, setKabupaten]: any = useState([]);
    const [provinsi, setProvinsi]: any = useState([]);
    const [links, setLinks] = useState<PaginationLink[]>([]);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [q, setQ] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [jabatan, setJabatan] = useState<{ nama_jabatan: string }[]>([]);
    const [tingkatKepengurusan, setTingkatKepengurusan] = useState('');
    // Tentukan tingkat kepengurusan berdasarkan user
    const { showProvinsiField, showKabupatenField } = useMemo(() => {
        const showProvinsi = tingkatKepengurusan === 'Pelaksana Tingkat Kabupaten/Kota' ||
            tingkatKepengurusan === 'Pelaksana Tingkat Provinsi';
        const showKabupaten = tingkatKepengurusan === 'Pelaksana Tingkat Kabupaten/Kota';

        return { showProvinsiField: showProvinsi, showKabupatenField: showKabupaten };
    }, [tingkatKepengurusan]);

    const fetchPdp = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${UrlApi}/userpanel/pdp/${user?.id_pdp}`, {
                withCredentials: true
            });
            setData(response.data);
            setTingkatKepengurusan(response.data.tingkat_kepengurusan)

        } catch (err) {
            console.error(err);
        }
        setLoading(false)
    };
    useEffect(() => {

        if (user) {
            fetchPdp()
        }
    }, [user]);

    // Untuk dataCreate - sesuaikan dengan tingkat kepengurusan
    const [dataCreate, setDataCreate]: any = useState({
        nama_lengkap: '',
        jabatan: '',
        id_pdp: '',
        id_provinsi: user?.id_provinsi || '',
        id_kabupaten: user?.id_kabupaten || '',
    });

    // Untuk dataPelaksana
    const [dataPelaksana, setDataPelaksana]: any = useState({
        id: '',
        nama_lengkap: '',
        jabatan: '',
        id_pdp: '',
        id_provinsi: '',
        id_kabupaten: '',
    });

    const filteredKabupaten = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(dataCreate.id_provinsi));
    const filteredKabupatenEdit = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(dataPelaksana.id_provinsi));

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
            const res = await axios.get<Pelaksana[]>(
                `${UrlApi}/userpanel/get-pelaksana`,
                { withCredentials: true }
            );
            setItems(res.data);
        } catch (err: any) {
            console.error(err);
            Swal.fire({ icon: 'error', text: err.response?.data || 'Gagal memuat data' });
        } finally {
            setLoading(false);
        }
    };

    const fetchJabatan = async () => {
        if (data?.tingkat_kepengurusan === 'Pelaksana Tingkat Kabupaten/Kota') {

            try {
                const res = await axios.get<{ nama_jabatan: string }[]>(`${UrlApi}/adminpanel/jabatan-kabupaten`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setJabatan(res.data || []);
            } catch (e) {
                console.error(e);
                setJabatan([]);
            }
        } else if (data?.tingkat_kepengurusan === 'Pelaksana Tingkat Provinsi') {
            try {
                const res = await axios.get<{ nama_jabatan: string }[]>(`${UrlApi}/adminpanel/jabatan-provinsi`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setJabatan(res.data || []);
            } catch (e) {
                console.error(e);
                setJabatan([]);
            }
        } else {
            try {
                const res = await axios.get<{ nama_jabatan: string }[]>(`${UrlApi}/adminpanel/jabatan`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setJabatan(res.data || []);
            } catch (e) {
                console.error(e);
                setJabatan([]);
            }
        }
    };

    const fetchKabupaten = async () => {
        try {
            const res = await axios.get(`${UrlApi}/kabupaten`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setKabupaten(res.data || []);
        } catch (e) {
            console.error(e);
            setKabupaten([]);
        }
    };

    const fetchProvinsi = async () => {
        try {
            const res = await axios.get(`${UrlApi}/provinsi`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setProvinsi(res.data || []);
        } catch (e) {
            console.error(e);
            setProvinsi([]);
        }
    };

    // Initial fetch - FIXED
    useEffect(() => {
        fetchList();
        fetchJabatan();
        fetchKabupaten();
        fetchProvinsi();
    }, [data]); // ✅ Empty dependency array - hanya dijalankan sekali

    // Fetch ketika page atau perPage berubah - FIXED
    useEffect(() => {
        fetchList();
    }, [page, perPage]); // ✅ Hanya depend on page dan perPage

    // --------- handlers ---------
    const openCreate = () => {
        // Set default values berdasarkan user
        setDataCreate({
            nama_lengkap: '',
            jabatan: '',
            id_pdp: '',
            id_provinsi: user?.id_provinsi || '',
            id_kabupaten: user?.id_kabupaten || '',
        });
        document.getElementById('createModal')?.classList.remove('hidden');
    };


    const closeCreate = () => {
        document.getElementById('createModal')?.classList.add('hidden');
        setImgSrc('');
        setCrop({ width: 2.8, height: 5, aspect: 2.8 / 5 });
        setCompletedCrop(undefined);
    };

    const openEdit = (row: Pelaksana) => {
        setDataPelaksana({
            id: row.id,
            nama_lengkap: row.nama_lengkap ?? '',
            jabatan: row.jabatan ?? '',
            id_pdp: row.id_pdp ?? '',
            id_kabupaten: row.id_kabupaten ?? '',
            id_provinsi: row.id_provinsi ?? ''
        });
        document.getElementById('editModal')?.classList.remove('hidden');
    };

    const closeEdit = () => {
        document.getElementById('editModal')?.classList.add('hidden');
        setImgEditSrc('');
        setCropEdit({ width: 2.8, height: 5, aspect: 2.8 / 5 });
        setCompletedCropEdit(undefined);
    };

    const openDelete = (row: Pelaksana) => {
        setDeleteId(row.id);
        setDeleteName(row.nama_lengkap);
        document.getElementById('deleteModal')?.classList.remove('hidden');
        document.getElementById('deleteModal')?.classList.add('flex');
    };

    const closeDelete = () => {
        document.getElementById('deleteModal')?.classList.add('hidden');
        document.getElementById('deleteModal')?.classList.remove('flex');
    };

    const handleChangeCreate = (e: any) => setDataCreate((s: any) => ({ ...s, [e.target.name]: e.target.value }));
    const handleOnChange = (e: any) => setDataPelaksana((s: any) => ({ ...s, [e.target.name]: e.target.value }));

    // search
    const onSearch = async (e: FormEvent) => {
        e.preventDefault();
        setPage(1);
        await fetchList();
    };

    // delete → DELETE /pelaksana/{id}
    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        if (!deleteId) return;
        if (data.tingkat_kepengurusan === "Pelaksana Tingkat Kabupaten/Kota") {

            try {
                await axios.delete(`${UrlApi}/adminpanel/pelaksana-kabupaten/${deleteId}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                Swal.fire({ icon: 'success', text: 'Pelaksana berhasil dihapus', confirmButtonColor: '#2563eb' });
                closeDelete();
                fetchList();
            } catch (error: any) {
                console.error(error);
                Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal menghapus data' });
            }
        } else if (data.tingkat_kepengurusan === "Pelaksana Tingkat Provinsi") {
            try {
                await axios.delete(`${UrlApi}/adminpanel/pelaksana-provinsi/${deleteId}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                Swal.fire({ icon: 'success', text: 'Pelaksana berhasil dihapus', confirmButtonColor: '#2563eb' });
                closeDelete();
                fetchList();
            } catch (error: any) {
                console.error(error);
                Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal menghapus data' });
            }
        }
    };

    // edit → PUT /pelaksana/{id}
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append('nama_lengkap', dataPelaksana.nama_lengkap);
            form.append('jabatan', dataPelaksana.jabatan);
            form.append('id_pdp', dataPelaksana.id_pdp);

            // Hanya tambahkan wilayah jika relevan
            if (tingkatKepengurusan === 'Pelaksana Tingkat Kabupaten/Kota') {
                form.append('id_kabupaten', dataPelaksana.id_kabupaten);
                form.append('id_provinsi', dataPelaksana.id_provinsi);
            } else if (tingkatKepengurusan === 'Pelaksana Tingkat Provinsi') {
                form.append('id_provinsi', dataPelaksana.id_provinsi);
            }

            if (previewCanvasEditRef.current) {
                await new Promise<void>((resolve) => {
                    previewCanvasEditRef.current!.toBlob(async (blob) => {
                        if (blob) form.append('photo', blob, `pelaksana_${Date.now()}.webp`);
                        resolve();
                    }, 'image/webp', 0.92);
                });
            }

            await axios.put(`${UrlApi}/userpanel/pelaksana/${dataPelaksana.id}`, form, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });

            Swal.fire({
                icon: 'success',
                text: 'Pelaksana berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    closeEdit();
                    fetchList();
                }
            });

        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal mengupdate data' });
        }
    };

    // create → POST /pelaksana
    const handleSubmitCreate = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append('nama_lengkap', dataCreate.nama_lengkap);
            form.append('jabatan', dataCreate.jabatan);
            form.append('id_pdp', dataCreate.id_pdp);


            // Hanya tambahkan wilayah jika relevan
            if (data.tingkat_kepengurusan === 'Pelaksana Tingkat Kabupaten/Kota') {
                form.append('id_kabupaten', dataCreate.id_kabupaten);
                form.append('id_provinsi', dataCreate.id_provinsi);
            } else if (data.tingkat_kepengurusan === 'Pelaksana Tingkat Provinsi') {
                form.append('id_provinsi', dataCreate.id_provinsi);
            }

            if (previewCanvasRef.current) {
                await new Promise<void>((resolve) => {
                    previewCanvasRef.current!.toBlob(async (blob) => {
                        if (blob) form.append('photo', blob, `pelaksana_${Date.now()}.webp`);
                        resolve();
                    }, 'image/webp', 0.92);
                });
            }

            await axios.post(`${UrlApi}/userpanel/pelaksana`, form, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });

            Swal.fire({
                icon: 'success',
                text: 'Pelaksana berhasil dibuat',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    closeCreate();
                    fetchList();
                }
            });

        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', text: error.response?.data || 'Gagal membuat data' });
        }
    };

    // pagination handler
    const onPageChange = (_url: string, p: number) => setPage(p);


    return (
        <div className='w-full'>
            <div className='py-4'>
                <div className='text-gray-9000 flex flex-col md:flex-row gap-4 justify-between'>
                    <div className='flex flex-row'>
                        <i className='text-accent fa fa-user-tie text-5xl pr-5'></i>
                        <p className='text-2xl py-2 font-semibold text-accent'>PELAKSANA {tingkatKepengurusan.replace('Pelaksana Tingkat ', '').toUpperCase()}</p>
                    </div>
                    <div className='flex flex-col md:flex-row gap-2'>
                        <button className='text-center bg-green-700 hover:bg-green-800 px-2 rounded-lg text-white' onClick={openCreate}>
                            Tambah Data Pelaksana
                        </button>
                    </div>
                </div>
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
                                    {showProvinsiField && <th className='border py-2 px-2'>Provinsi</th>}
                                    {showKabupatenField && <th className='border py-2 px-2'>Kabupaten/Kota</th>}
                                    <th className='border py-2 px-2'>Jabatan</th>
                                    <th className='border py-2 px-2'>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={8} className='py-4 text-center text-gray-500'>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}

                                {items.map((row: Pelaksana, idx: number) => (
                                    <tr key={row.id} className='border-b'>
                                        <td className='py-2 px-2 border'>{(page - 1) * perPage + idx + 1}</td>
                                        <td className='py-2 px-2 border'>
                                            <Image
                                                src={row.photo ? `${BaseUrl + row.photo}` : '/assets/images/logo-dppi.png'}
                                                width={100}
                                                height={150}
                                                className='mx-auto rounded-md'
                                                alt={row.nama_lengkap}
                                                onError={(e: any) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/images/logo-dppi.png"
                                                }}
                                            />
                                        </td>
                                        <td className='py-2 px-2 border'>{row.nama_lengkap}</td>
                                        <td className='py-2 px-2 border text-center'>{row.id_pdp}</td>
                                        {showProvinsiField && <td className='py-2 px-2 border'>{row.nama_provinsi || '-'}</td>}
                                        {showKabupatenField && <td className='py-2 px-2 border'>{row.nama_kabupaten || '-'}</td>}
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

                        {/* Pagination */}
                        <div className='px-0 py-6'>
                            {links && links.length > 0 && <Pagination links={links} onPageChange={onPageChange} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* create Modal */}
            <div id='createModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white/50 min-h-svh'>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Tambah Pelaksana {tingkatKepengurusan.replace('Pelaksana Tingkat ', '')}</span>
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
                                        tabIndex={2}
                                        pattern="^[0-9]+$"
                                        title="Hanya angka"
                                        autoComplete='id_pdp'
                                        onChange={handleChangeCreate}
                                        value={dataCreate.id_pdp}

                                    />
                                </div>

                                {showProvinsiField && (
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='id_provinsi'>Provinsi:</InputLabel>
                                        <select
                                            name='id_provinsi'
                                            id='id_provinsi'
                                            className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                            tabIndex={3}
                                            onChange={handleChangeCreate}
                                            value={dataCreate.id_provinsi}
                                            required={showProvinsiField}
                                        >
                                            <option value=''>Pilih Salah Satu</option>
                                            {provinsi.map((item: any) => (
                                                <option value={item.id} key={item.id}>
                                                    {item.nama_provinsi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {showKabupatenField && (
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='id_kabupaten'>Kabupaten:</InputLabel>
                                        <select
                                            name='id_kabupaten'
                                            id='id_kabupaten'
                                            className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                            tabIndex={4}
                                            onChange={handleChangeCreate}
                                            value={dataCreate.id_kabupaten}
                                            required={showKabupatenField}
                                        >
                                            <option value=''>Pilih Salah Satu</option>
                                            {filteredKabupaten.map((item: any) => (
                                                <option value={item.id} key={item.id}>
                                                    {item.nama_kabupaten}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_jabatan'>Jabatan:</InputLabel>
                                    <select
                                        name='jabatan'
                                        id='jabatan'
                                        className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                        tabIndex={5}
                                        onChange={handleChangeCreate}
                                        value={dataCreate.jabatan}
                                        required
                                    >
                                        <option value=''>Pilih Salah Satu</option>
                                        {jabatan.map((item) => (
                                            <option value={item.nama_jabatan} key={item.nama_jabatan}>
                                                {item.nama_jabatan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeCreate} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>
                                <button type='submit' className='px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* edit Modal */}
            <div id='editModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 xl:inset-0 backdrop-blur-sm bg-white/50 min-h-svh'>
                <div className='md:absolute left-0 right-0 relative w-full h-full max-w-xl xl:max-h-[700px] mx-auto xl:top-20 top-4 xl:h-auto overflow-x-hidden overflow-y-auto'>
                    <div className='relative mx-auto bg-gray-200 rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Edit Pelaksana {tingkatKepengurusan.replace('Pelaksana Tingkat ', '')}</span>
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
                                        tabIndex={1}
                                        autoComplete='nama_lengkap'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleOnChange}
                                        value={dataPelaksana.nama_lengkap}
                                    />
                                </div>
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='id_pdp'>Id PDP:</InputLabel>
                                    <TextInput
                                        className='text-sm bg-gray-400'
                                        id='id_pdp'
                                        type='text'
                                        name='id_pdp'
                                        readOnly
                                        disabled
                                        tabIndex={2}
                                        pattern="^[0-9]+$"
                                        title="Hanya angka"
                                        autoComplete='id_pdp'
                                        onChange={handleOnChange}
                                        value={dataPelaksana.id_pdp}
                                    />
                                </div>

                                {showProvinsiField && (
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='id_provinsi'>Provinsi:</InputLabel>
                                        <select
                                            name='id_provinsi'
                                            id='id_provinsi'
                                            className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                            tabIndex={3}
                                            onChange={handleOnChange}
                                            value={dataPelaksana.id_provinsi}
                                        >
                                            <option value=''>Pilih Salah Satu</option>
                                            {provinsi.map((item: any) => (
                                                <option value={item.id} key={item.id}>
                                                    {item.nama_provinsi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {showKabupatenField && (
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='id_kabupaten'>Kabupaten:</InputLabel>
                                        <select
                                            name='id_kabupaten'
                                            id='id_kabupaten'
                                            className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                            tabIndex={4}
                                            onChange={handleOnChange}
                                            value={dataPelaksana.id_kabupaten}
                                        >
                                            <option value=''>Pilih Salah Satu</option>
                                            {filteredKabupatenEdit.map((item: any) => (
                                                <option value={item.id} key={item.id}>
                                                    {item.nama_kabupaten}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_jabatan'>Jabatan:</InputLabel>
                                    <select
                                        name='jabatan'
                                        id='jabatan'
                                        className='border-gray-300 bg-white focus:border-accent focus:ring-accent dark:bg-black rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                        tabIndex={5}
                                        value={dataPelaksana.jabatan}
                                        onChange={handleOnChange}
                                    >
                                        <option value=''>Pilih Salah Satu</option>
                                        {jabatan.map((item) => (
                                            <option value={item.nama_jabatan} key={item.nama_jabatan}>
                                                {item.nama_jabatan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-between mt-4 px-8 pb-8'>
                                <button type='button' onClick={closeEdit} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>
                                <button type='submit' className='px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* delete Modal */}
            <div id='deleteModal' className='justify-center fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='fixed z-30 w-full justify-center max-w-[500px] mx-auto md:top-12 lg:top-40 top-14'>
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
        </div>
    );
}