'use client';
import { FormEvent, useRef, useState, useEffect, useMemo } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import Swal from 'sweetalert2';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
import { useDebounceEffect } from '@/app/Components/useDebounceEffect';
import { canvasPreview } from '@/app/Components/CanvasPreview';
import { UrlApi } from '@/app/Components/apiUrl';
import Link from 'next/link';
import InputLabel from '@/app/Components/InputLabel';
import TextInput from '@/app/Components/TextInput';
import { useUser } from '@/app/Components/UserContext';
import { useParams, useRouter } from 'next/navigation';


interface HobiOption {
    value: string;
    label: string;
}
function centerAspectCrop(mediaWidth: any, mediaHeight: any, aspect: any) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

const animatedComponents = makeAnimated();

export default function PdpEdit() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading]: any = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<any>({
        nik: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tgl_lahir: '',
        jk: '',
        email: '',
        telepon: '',
        alamat: '',
        pendidikan_terakhir: '',
        jurusan: '',
        nama_instansi_pendidikan: '',
        id_hobi: [],
        posisi: '',
        tingkat_kepengurusan: '',
        jabatan: '',
        tingkat_penugasan: '',
        id_provinsi_domisili: '',
        id_kabupaten_domisili: '',
        id_provinsi: '',
        id_kabupaten: '',
        thn_tugas: 0,
        id_minat: 0,
        detail_minat: '',
        id_minat_2: 0,
        detail_minat_2: '',
        id_bakat: 0,
        detail_bakat: '',
        keterangan: '',
        agreement: '',
        status: 'Belum Diverifikasi',
        no_piagam: '',
    });

    const [kabupaten, setKabupaten] = useState<any[]>([]);
    const [minat, setMinat] = useState<any[]>([]);
    const [bakat, setBakat] = useState<any[]>([]);
    const [detailBakat, setDetailBakat] = useState<any[]>([]);
    const [detailMinat, setDetailMinat] = useState<any[]>([]);
    const [provinsi, setProvinsi] = useState<any[]>([]);
    const [hobi, setHobi] = useState<HobiOption[]>([]);
    const [jabatan, setJabatan] = useState<any[]>([]);
    const [jabatanProvinsi, setJabatanProvinsi] = useState<any[]>([]);
    const [jabatanKabupaten, setJabatanKabupaten] = useState<any[]>([]);
    const [selectedProvinsiDomisili, setSelectedProvinsiDomisili] = useState<string>('');
    const filteredKabupatenDomisili = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsiDomisili ? selectedProvinsiDomisili : data.id_provinsi_domisili));

    const fetchPdp = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${UrlApi}/userpanel/pdp/${id}`, {
                withCredentials: true
            });
            setData(response.data);


        } catch (err) {
            console.error(err);
        }
        setLoading(false)
    };
    useEffect(() => {
        fetchPdp();
    }, [id]);
    const handleProvinsiChangeDoimisili = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_provinsi_domisili: value,
            id_kabupaten_domisili: '', // Reset kabupaten saat provinsi berubah
        }));
        setSelectedProvinsiDomisili(value);
    };

    //penugasan
    const handleTingkatPenugasan = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            tingkat_penugasan: value,
            id_provinsi: '', // Reset provinsi saat penugasan berubah
            id_kabupaten: '', // Reset kabupaten saat provinsi berubah
        }));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, index) => currentYear - index);

    //provinsi dan kabupaten penugasan
    const [selectedProvinsi, setSelectedProvinsi] = useState<string>('');
    const filteredKabupaten = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsi ? selectedProvinsi : data.id_provinsi));

    const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_provinsi: value,
            id_kabupaten: '', // Reset kabupaten saat provinsi berubah
        }));
        setSelectedProvinsi(value);
    };

    const [selectedFilePiagam, setSelectedFilePiagam] = useState<any>(null);

    //photo
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<any>({
        width: 2,
        height: 3,
        aspect: 2 / 3,
    });
    const [completedCrop, setCompletedCrop] = useState<any>();
    const scale = 1;
    const rotate = 0;
    const aspect = 2 / 3;

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
            const { width, height } = e.currentTarget;
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

    const handleOnChange = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleOnSelect = (selectedOptions: any) => {
        setData((prevData: any) => ({
            ...prevData,
            id_hobi: selectedOptions.map((option: any) => option.value),
        }));
    };

    //posisi
    const handleChangePosisi = (event: any) => {
        const value = event.target.value;
        setData((prev: any) => ({
            ...prev,
            posisi: value,
            tingkat_kepengurusan: '',
        }));
    };

    const handleChangeKepengurusan = (event: any) => {
        const value = event.target.value;
        setData((prev: any) => ({
            ...prev,
            tingkat_kepengurusan: value,
        }));
    };

    //minat
    const [selectedMinat, setSelectedMinat] = useState<string>('');
    const filteredDetailFirstMinat = detailMinat && detailMinat.filter((detMinat: any) => detMinat.id_minat === Number(selectedMinat ? selectedMinat : data.id_minat));

    const handleFirstMinatChange = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_minat: value,
            detail_minat: '', // Reset detail_minat saat minat berubah
        }));
        setSelectedMinat(value);
    };

    const filteredSecondMinat = minat.filter((minatKedua: any) => minatKedua.id !== Number(selectedMinat ? selectedMinat : data.id_minat2));
    const [selectedMinatKedua, setSelectedMinatKedua] = useState<string>('');

    const handleSecondMinatChange = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_minat_2: value,
            detail_minat_2: '', // Reset detail_minat saat minat berubah
        }));
        setSelectedMinatKedua(value);
    };

    const filteredDetailSecondMinat = detailMinat.filter((detMinat2: any) => detMinat2.id_minat === Number(selectedMinatKedua));
    const [minatKedua, setMinatKedua] = useState(false);

    const handleClickTambahMinat = () => {
        setMinatKedua(true);
    };

    const hanleClikHapusMinatKedua = () => {
        setMinatKedua(false);
        setData((prev: any) => ({
            ...prev,
            id_minat_2: '',
            detail_minat_2: '',
        }));
    };

    //bakat
    const [selectedBakat, setSelectedBakat] = useState<string>('');
    const filteredDetailBakat = detailBakat.filter((detBakat: any) => detBakat.id_bakat === Number(selectedBakat ? selectedBakat : data.id_bakat));

    const handleFirstBakatChange = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_bakat: value,
            detail_bakat: '',
        }));
        setSelectedBakat(value);
    };


    const handleFilePiagamChange = (e: any) => {
        setSelectedFilePiagam(e);
    };


    //submit 
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage('');
        try {
            const formData = new FormData();
            const cleanHobi = Array.isArray(data.id_hobi)
                ? data.id_hobi
                : typeof data.id_hobi === 'string'
                    ? JSON.parse(data.id_hobi) // Parse jika masih string JSON
                    : [];
            // Handle photo upload
            if (previewCanvasRef.current) {
                const canvas = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('photo', croppedBlob, 'photo.png');
            }

            // Handle piagam file upload
            if (selectedFilePiagam && selectedFilePiagam.target.files[0]) {
                formData.append('file_piagam', selectedFilePiagam.target.files[0]);
            }

            const payloadData: any = {
                // Data pribadi
                nik: data.nik || '',
                nama_lengkap: data.nama_lengkap || '',
                jk: data.jk || '',
                tempat_lahir: data.tempat_lahir || '',
                tgl_lahir: data.tgl_lahir || '',
                alamat: data.alamat || '',

                // Pendidikan
                pendidikan_terakhir: data.pendidikan_terakhir || '',
                jurusan: data.jurusan || '',
                nama_instansi_pendidikan: data.nama_instansi_pendidikan || '',

                // Kontak
                email: data.email || '',
                telepon: data.telepon || '',

                // Penugasan
                no_simental: data.no_simental || '',
                no_piagam: data.no_piagam || '',
                posisi: data.posisi || '',
                tingkat_kepengurusan: data.tingkat_kepengurusan || '',
                jabatan: data.jabatan || '',
                tingkat_penugasan: data.tingkat_penugasan || '',
                thn_tugas: data.thn_tugas ? parseInt(String(data.thn_tugas), 10) : null,
                status: data.status || '',

                // Domisili
                id_kabupaten_domisili: data.id_kabupaten_domisili ? parseInt(data.id_kabupaten_domisili) : null,
                id_provinsi_domisili: data.id_provinsi_domisili ? parseInt(data.id_provinsi_domisili) : null,

                // Penugasan wilayah
                id_kabupaten: data.id_kabupaten ? parseInt(data.id_kabupaten) : null,
                id_provinsi: data.id_provinsi ? parseInt(data.id_provinsi) : null,

                id_hobi: cleanHobi,
                // Minat, bakat
                id_bakat: data.id_bakat ? parseInt(data.id_bakat) : null,
                detail_bakat: data.detail_bakat || '',
                id_minat: data.id_minat ? parseInt(data.id_minat) : null,
                detail_minat: data.detail_minat || '',
                id_minat_2: data.id_minat_2 ? parseInt(data.id_minat_2) : null,
                detail_minat_2: data.detail_minat_2 || '',
                keterangan: data.keterangan || '',
            };

            formData.append('payload', JSON.stringify(payloadData));

            await axios.put(`${UrlApi}/userpanel/pdp/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            Swal.fire({
                icon: 'success',
                text: 'Data Anda berhasil diperbaharui',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.back()
                }
            });
        } catch (error: any) {
            console.error('Error detail:', error);
            const errorData = error.response?.data;

            let msg = 'Terjadi kesalahan saat mengirim data';
            if (typeof errorData === 'string') {
                msg = errorData;
            } else if (errorData?.message) {
                msg = errorData.message;
            } else if (errorData?.errors) {
                const first = Object.entries(errorData.errors)[0] as [string, any] | undefined;
                if (first) msg = `${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : String(first[1])}`;
            } else if (errorData && typeof errorData === 'object') {
                const first = Object.entries(errorData)[0] as [string, any] | undefined;
                if (first) msg = `${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : String(first[1])}`;
            }

            Swal.fire({
                icon: 'error',
                text: msg,
            });
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch initial data
    //provinsi
    const getProvinsi = () => {
        axios
            .get(`${UrlApi}/provinsi`)

            .then((response: any) => {
                setProvinsi(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    //kabupaten
    const getKabupaten = () => {
        axios
            .get(`${UrlApi}/kabupaten`)

            .then((response: any) => {
                setKabupaten(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    const getJabatan = () => {
        axios
            .get(`${UrlApi}/jabatan`)
            .then((response: any) => {
                setJabatanKabupaten(response.data.jabatan_kabupaten);
                setJabatanProvinsi(response.data.jabatan_provinsi);
                setJabatan(response.data.jabatan_pusat);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });

    }
    const getHobi = () => {
        axios
            .get(`${UrlApi}/hobi`)
            .then((response: any) => {

                if (Array.isArray(response.data)) {
                    const hobiData: HobiOption[] = response.data.map((item: any) => ({
                        value: item.kategori_hobi,
                        label: item.kategori_hobi,
                    }));
                    setHobi(hobiData);
                } else {
                    console.error('Expected array but got:', response.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    }
    const getMinat = () => {
        axios
            .get(`${UrlApi}/minat`)

            .then((response: any) => {
                setMinat(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    const getDetailMinat = () => {
        axios
            .get(`${UrlApi}/detail-minat`)

            .then((response: any) => {
                setDetailMinat(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    const getBakat = () => {
        axios
            .get(`${UrlApi}/bakat`)

            .then((response: any) => {
                setBakat(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    const getDetailBakat = () => {
        axios
            .get(`${UrlApi}/detail-bakat`)

            .then((response: any) => {
                setDetailBakat(response.data);

            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };
    useEffect(() => {
        getProvinsi();
        getKabupaten();
        getJabatan();
        getHobi()
        getMinat()
        getDetailMinat()
        getBakat()
        getDetailBakat()
    }, []);



    return (
        <div className='bg-gray-50 pb-28 dark:bg-gray-700'>
            {data ?
                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900 dark:text-gray-900 p-8 rounded-lg overflow-hidden'>
                        <div className='pr-2 md:border-r'>
                            <div className='border-t-2 md:border-t-0 mt-4 md:mt-0'>
                                <p className='font-semibold'>DATA DIRI</p>
                            </div>

                            <div className='grid gap-2'>
                                <InputLabel htmlFor='nik'>NIK:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='nik'
                                    type='text'
                                    name='nik'
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete='nik'
                                    pattern='[0-9]+'
                                    minLength={16}
                                    maxLength={16}
                                    title='16 Karakter Angka'
                                    value={data.nik}
                                    onChange={handleOnChange}
                                    placeholder='Nomor Induk Kependudukan'
                                />
                            </div>


                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='photo'>Foto Diri:</InputLabel>
                                <input
                                    className='border-2 text-sm w-full rounded-md'
                                    type='file'
                                    accept='image/*'
                                    onChange={onSelectFile}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4 my-2'>
                                {Boolean(imgSrc) && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspect}
                                    >
                                        <img
                                            ref={imgRef}
                                            alt='Crop me'
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
                                            style={{
                                                border: '1px solid black',
                                                objectFit: 'contain',
                                                width: completedCrop.width,
                                                height: completedCrop.height,
                                            }}
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
                                    tabIndex={2}
                                    autoComplete='nama_lengkap'
                                    value={data.nama_lengkap}
                                    onChange={handleOnChange}
                                    placeholder='Nama Lengkap; berikut dengan title (jika ada)'
                                />
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='jk'>Jenis Kelamin:</InputLabel>
                                <select
                                    name='jk'
                                    id='jk'
                                    tabIndex={3}
                                    required
                                    value={data.jk}
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm '
                                    onChange={handleOnChange}
                                >
                                    <option value=''>--Pilih Salah Satu--</option>
                                    <option value='Laki-Laki'>Laki-Laki</option>
                                    <option value='Perempuan'>Perempuan</option>
                                </select>
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='tempat_lahir'>Kota Kelahiran:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='tempat_lahir'
                                    type='text'
                                    name='tempat_lahir'
                                    required
                                    tabIndex={4}
                                    autoComplete='tempat_lahir'
                                    value={data.tempat_lahir}
                                    onChange={handleOnChange}
                                    placeholder='Kota Kelahiran'
                                />
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='tgl_lahir'>Tanggal Lahir:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='tgl_lahir'
                                    type='date'
                                    name='tgl_lahir'
                                    required
                                    tabIndex={5}
                                    autoComplete='tgl_lahir'
                                    value={data.tgl_lahir}
                                    onChange={handleOnChange}
                                    placeholder='Tanggal Lahir'
                                />
                            </div>

                            <div className='border-t-2 my-4'>
                                <p className='font-semibold'>DOMISILI</p>
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_provinsi_domisili'>Provinsi:</InputLabel>
                                <select
                                    name='id_provinsi_domisili'
                                    id='id_provinsi_domisili'
                                    onChange={handleProvinsiChangeDoimisili}
                                    tabIndex={6}
                                    value={data.id_provinsi_domisili}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'
                                >
                                    <option value=''>--Pilih Provinsi--</option>
                                    {provinsi && provinsi.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_provinsi}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_kabupaten_domisili'>Kabupaten:</InputLabel>
                                <select
                                    name='id_kabupaten_domisili'
                                    id='id_kabupaten_domisili'
                                    tabIndex={7}
                                    disabled={!selectedProvinsiDomisili}
                                    onChange={handleOnChange}
                                    value={data.id_kabupaten_domisili}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'
                                >
                                    <option value=''>--Pilih kabupaten--</option>
                                    {filteredKabupatenDomisili.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_kabupaten}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <TextInput
                                className='text-sm'
                                id='alamat'
                                type='text'
                                name='alamat'
                                required
                                tabIndex={8}
                                autoComplete='alamat'
                                value={data.alamat || ''}
                                onChange={handleOnChange}
                                placeholder='Alamat (nama jalan, no. rumah, RT/RW, Desa, Kecamatan)'
                            />

                            <div className='border-t-2 my-4'>
                                <p className='font-semibold'>PENDIDIKAN</p>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='pendidikan_terakhir'>Pendidikan Terakhir:</InputLabel>
                                <select
                                    name='pendidikan_terakhir'
                                    id='pendidikan_terakhir'
                                    tabIndex={9}
                                    value={data.pendidikan_terakhir}
                                    onChange={handleOnChange}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Tingkat Pendidikan--</option>
                                    <option value='SMA'>SMA/Sederajat</option>
                                    <option value='D3'>D3</option>
                                    <option value='S1'>S1</option>
                                    <option value='S2'>S2</option>
                                    <option value='S3'>S3</option>
                                </select>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='jurusan'>Jurusan:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='jurusan'
                                    type='text'
                                    name='jurusan'
                                    required
                                    tabIndex={10}
                                    autoComplete='jurusan'
                                    defaultValue={data.jurusan}
                                    onChange={handleOnChange}
                                    placeholder='Jurusan'
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
                                    tabIndex={11}
                                    autoComplete='nama_instansi_pendidikan'
                                    defaultValue={data.nama_instansi_pendidikan}
                                    onChange={handleOnChange}
                                    placeholder='Nama Instansi Pendidikan'
                                />
                            </div>
                            <div className='border-t-2 md:border-t-2 mt-4'>
                                <p className='font-semibold'>KONTAK</p>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='email'>Email:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='email'
                                    type='email'
                                    name='email'
                                    required
                                    tabIndex={26}
                                    autoComplete='email'
                                    value={data.email}
                                    onChange={handleOnChange}
                                    placeholder='Alamat Email'
                                />
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='email'>Telepon/Whatsapp:</InputLabel>
                                <TextInput
                                    id='telepon'
                                    type='number'
                                    tabIndex={27}
                                    step={0}
                                    name='telepon'
                                    defaultValue={data.telepon}
                                    className='block w-full mt-1 text-sm'
                                    autoComplete='telepon'
                                    onChange={handleOnChange}
                                    required
                                />
                            </div>

                        </div>

                        <div className='md:pl-2 pl-0'>
                            <div className='border-t-2 md:border-t-0 mt-4 md:mt-0'>
                                <p className='font-semibold'>PENUGASAN</p>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='tingkat_penugasan'>Status Kepengurusan di DPPI:</InputLabel>
                                <div className='flex flex-row gap-12'>
                                    <label>
                                        <input
                                            type='radio'
                                            className='mr-2 checked:bg-accent hover:ring-accent focus:ring-accent  ring-accent text-accent '
                                            name='posisi'
                                            value='Anggota'
                                            checked={data.posisi === 'Anggota'}
                                            onChange={handleChangePosisi}
                                        />
                                        <span className='text-sm'>Anggota</span>
                                    </label>
                                    <label>
                                        <input
                                            type='radio'
                                            className='mr-2 checked:bg-accent hover:ring-accent focus:ring-accent  ring-accent text-accent '
                                            name='posisi'
                                            value='Pelaksana'
                                            checked={data.posisi === 'Pelaksana'}
                                            onChange={handleChangePosisi}
                                        />
                                        <span className='text-sm'>Pelaksana</span>
                                    </label>
                                </div>
                            </div>
                            {data.posisi === 'Pelaksana' ? (
                                <div className='grid gap-2 my-6'>
                                    <InputLabel htmlFor='tingkat_kepengurusan'>Tingkat Kepengurusan:</InputLabel>
                                    <div className='flex flex-col 2xl:flex-row 2xl:gap-6'>
                                        <label>
                                            <input
                                                type='radio'
                                                className='mr-2 checked:bg-accent hover:ring-accent focus:ring-accent  ring-accent text-accent '
                                                name='tingkat_kepengurusan'
                                                value='Pelaksana Tingkat Kabupaten/Kota'
                                                checked={data.tingkat_kepengurusan === 'Pelaksana Tingkat Kabupaten/Kota'}
                                                onChange={handleChangeKepengurusan}
                                            />
                                            <span className='text-sm'>Pelaksana Tk. Kabupaten/Kota</span>
                                        </label>
                                        <label>
                                            <input
                                                type='radio'
                                                className='mr-2 checked:bg-accent hover:ring-accent focus:ring-accent  ring-accent text-accent '
                                                name='tingkat_kepengurusan'
                                                value='Pelaksana Tingkat Provinsi'
                                                checked={data.tingkat_kepengurusan === 'Pelaksana Tingkat Provinsi'}
                                                onChange={handleChangeKepengurusan}
                                            />
                                            <span className='text-sm'>Pelaksana Tk. Provinsi</span>
                                        </label>
                                        <label>
                                            <input
                                                type='radio'
                                                className='mr-2 checked:bg-accent hover:ring-accent focus:ring-accent  ring-accent text-accent '
                                                name='tingkat_kepengurusan'
                                                value='Pelaksana Tingkat Pusat'
                                                checked={data.tingkat_kepengurusan === 'Pelaksana Tingkat Pusat'}
                                                onChange={handleChangeKepengurusan}
                                            />
                                            <span className='text-sm'>Pelaksana Tk. Pusat</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                            {data.tingkat_kepengurusan === 'Pelaksana Tingkat Kabupaten/Kota' ? (
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='jabatan'>Jabatan:</InputLabel>
                                    <select
                                        name='jabatan'
                                        id='jabatan'
                                        onChange={handleOnChange}
                                        value={data.jabatan}
                                        tabIndex={12}
                                        required
                                        className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                        <option value=''>--Pilih Pilih Jabatan--</option>
                                        {jabatanKabupaten.map((item: any) => (
                                            <option key={item.id} value={item.nama_jabatan}>
                                                {item.nama_jabatan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : data.tingkat_kepengurusan === 'Pelaksana Tingkat Provinsi' ? (
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='jabatan'>Jabatan:</InputLabel>
                                    <select
                                        name='jabatan'
                                        id='jabatan'
                                        onChange={handleOnChange}
                                        value={data.jabatan}
                                        tabIndex={12}
                                        required
                                        className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                        <option value=''>--Pilih Pilih Jabatan--</option>
                                        {jabatanProvinsi.map((item: any) => (
                                            <option key={item.id} value={item.nama_jabatan}>
                                                {item.nama_jabatan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : data.tingkat_kepengurusan === 'Pelaksana Tingkat Pusat' ? (
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='jabatan'>Jabatan:</InputLabel>
                                    <select
                                        name='jabatan'
                                        id='jabatan'
                                        onChange={handleOnChange}
                                        value={data.jabatan}
                                        tabIndex={12}
                                        required
                                        className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                        <option value=''>--Pilih Pilih Jabatan--</option>
                                        {jabatan.map((item: any) => (
                                            <option key={item.id} value={item.nama_jabatan}>
                                                {item.nama_jabatan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                ''
                            )}
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='tingkat_penugasan'>Tingkat Penugasan:</InputLabel>
                                <select
                                    name='tingkat_penugasan'
                                    id='tingkat_penugasan'
                                    onChange={handleTingkatPenugasan}
                                    value={data.tingkat_penugasan}
                                    tabIndex={12}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Tingkat Penugasan--</option>
                                    <option value='Paskibraka Tingkat Kabupaten/Kota'>Paskibraka Tingkat Kabupaten/Kota</option>
                                    <option value='Paskibraka Tingkat Provinsi'>Paskibraka Tingkat Provinsi</option>
                                    <option value='Paskibraka Tingkat Pusat'>Paskibraka Tingkat Pusat</option>
                                </select>
                            </div>
                            {data.tingkat_penugasan !== '' ? (
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='id_provinsi'>Provinsi:</InputLabel>
                                    <select
                                        name='id_provinsi'
                                        id='id_provinsi'
                                        onChange={handleProvinsiChange}
                                        value={data.id_provinsi}
                                        tabIndex={13}
                                        required
                                        className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                        <option value=''>--Pilih Provinsi--</option>
                                        {provinsi && provinsi.map((item: any) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama_provinsi}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                ''
                            )}
                            {data.tingkat_penugasan == 'Paskibraka Tingkat Kabupaten/Kota' ? (
                                <div className='grid gap-2 mt-4'>
                                    <InputLabel htmlFor='id_kabupaten'>Kabupaten:</InputLabel>
                                    <select
                                        name='id_kabupaten'
                                        id='id_kabupaten'
                                        tabIndex={14}
                                        disabled={!selectedProvinsi}
                                        onChange={handleOnChange}
                                        value={data.id_kabupaten}
                                        required
                                        className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                        <option value=''>--Pilih kabupaten--</option>
                                        {filteredKabupaten.map((item: any) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama_kabupaten}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                ''
                            )}
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='thn_tugas'>Tahun Penugasan:</InputLabel>
                                <select
                                    name='thn_tugas'
                                    id='thn_tugas'
                                    onChange={handleOnChange}
                                    tabIndex={15}
                                    value={data.thn_tugas}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Tahun Penugasan--</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='no_piagam'>Nomor Piagam:</InputLabel>
                                <TextInput
                                    id='no_piagam'
                                    type='text'
                                    name='no_piagam'
                                    className='bg-gray-300 px-2 py-2 text-sm text-gray-700'
                                    autoComplete='no_piagam'
                                    value={data.no_piagam}
                                    onChange={handleOnChange}
                                />
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='Piagam'>File Piagam Purnapaskibraka Duta Pancasila:</InputLabel>
                                <input
                                    className='text-sm border-2 w-full rounded-md'
                                    tabIndex={16}
                                    type='file'
                                    accept='image/jpeg, image/jpg, image/png, application/pdf'
                                    onChange={handleFilePiagamChange}
                                />
                            </div>

                            <div className='border-t-2 md:border-t-2 mt-4'>
                                <p className='font-semibold'>HOBI, MINAT, DAN BAKAT</p>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_hobi'>Pilih Hobi (1 atau lebih):</InputLabel>

                                <Select
                                    instanceId="select-hobi"
                                    isMulti
                                    options={hobi}
                                    value={hobi.filter(option =>
                                        data.id_hobi && data.id_hobi.includes(option.value)
                                    )}
                                    onChange={handleOnSelect}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Pilih hobi..."
                                />
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_minat'>Kategori Minat:</InputLabel>
                                <select
                                    name='id_minat'
                                    id='id_minat'
                                    onChange={handleFirstMinatChange}
                                    value={data.id_minat}
                                    tabIndex={18}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Minat--</option>
                                    {minat && minat.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.kategori_minat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='detail_minat'>Detail Minat:</InputLabel>
                                <select
                                    name='detail_minat'
                                    id='detail_minat'
                                    onChange={handleOnChange}
                                    value={data.detail_minat}
                                    tabIndex={19}
                                    required
                                    className='border-gray-300 focus:border-red-500 w-full text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Detail Minat--</option>
                                    {filteredDetailFirstMinat.map((item: any) => (
                                        <option key={item.id} value={item.detail_minat}>
                                            {item.detail_minat}
                                        </option>
                                    ))}
                                </select>
                                {data.id_minat_2 || minatKedua ? (
                                    ''
                                ) : (
                                    <button
                                        type='button'
                                        className={`bg-green-700 text-white font-semibold py-1 text-sm px-2 rounded-lg mx-1`}
                                        onClick={handleClickTambahMinat}
                                        disabled={!data.detail_minat}
                                        tabIndex={20}>
                                        Tambah Minat
                                    </button>
                                )}
                            </div>
                            {data.id_minat_2 || minatKedua ? (
                                <>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='id_minat_2'>Kategori Minat:</InputLabel>
                                        <select
                                            name='id_minat_2'
                                            id='id_minat_2'
                                            onChange={handleSecondMinatChange}
                                            value={data.id_minat_2}
                                            tabIndex={20}
                                            className='border-gray-300 focus:border-red-500 w-fulltext-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                            <option value=''>--Pilih Minat--</option>
                                            {filteredSecondMinat.map((item: any) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.kategori_minat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='grid gap-2 mt-4'>
                                        <InputLabel htmlFor='detail_minat_2'>Detail Minat:</InputLabel>
                                        <select
                                            name='detail_minat_2'
                                            id='detail_minat_2'
                                            onChange={handleOnChange}
                                            value={data.detail_minat_2}
                                            tabIndex={21}
                                            className='border-gray-300 focus:border-red-500 text-sm w-full focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                            <option value=''>--Pilih Minat--</option>
                                            {filteredDetailSecondMinat.map((item: any) => (
                                                <option key={item.id} value={item.detail_minat}>
                                                    {item.detail_minat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                            <button
                                type='button'
                                className={data.detail_minat_2 ? `bg-red-700 mt-2 text-white font-semibold py-1 text-sm px-2 rounded-lg mx-1` : `hidden`}
                                onClick={hanleClikHapusMinatKedua}
                                tabIndex={22}
                                disabled={!data.detail_minat_2}>
                                Hapus Minat
                            </button>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_bakat'>Kategori Bakat:</InputLabel>
                                <select
                                    name='id_bakat'
                                    id='id_bakat'
                                    onChange={handleFirstBakatChange}
                                    value={data.id_bakat}
                                    tabIndex={23}
                                    required
                                    className='border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Bakat--</option>
                                    {bakat.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.kategori_bakat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='detail_bakat'>Detail Bakat:</InputLabel>
                                <select
                                    name='detail_bakat'
                                    id='detail_bakat'
                                    onChange={handleOnChange}
                                    value={data.detail_bakat}
                                    tabIndex={24}
                                    required
                                    className='border-gray-300 focus:border-red-500 w-full text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400'>
                                    <option value=''>--Pilih Detail Bakat--</option>
                                    {filteredDetailBakat.map((item: any) => (
                                        <option key={item.id} value={item.detail_bakat}>
                                            {item.detail_bakat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='keterangan'>Kekurangan/Kelebihan (optional):</InputLabel>
                                <textarea
                                    id='keterangan'
                                    name='keterangan'
                                    rows={2}
                                    tabIndex={25}
                                    value={data.keterangan ? data.keterangan : ''}
                                    autoComplete='keterangan'
                                    className='border-gray-300 focus:border-red-500 text-sm p-2 focus:ring-red-500 rounded-md shadow-sm ring-gray-400'
                                    onChange={handleOnChange}
                                    placeholder='Kekurangan/Kelebihan yang dimiliki'
                                />
                            </div>

                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-end mt-4'>
                                <button type='submit' tabIndex={29} className={`bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg mx-1`}>
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                : <>{loading}</>
            }
        </div>
    );
}
