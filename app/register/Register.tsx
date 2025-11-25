'use client';
import { FormEvent, useRef, useState, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import Swal from 'sweetalert2';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
import { useDebounceEffect } from '../Components/useDebounceEffect';
import { canvasPreview } from '../Components/CanvasPreview';
import { UrlApi } from '../Components/apiUrl';
import Link from 'next/link';
import InputLabel from '../Components/InputLabel';
import TextInput from '../Components/TextInput';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';



interface Pdp {
    id: number;
    no_piagam: string;
    photo: string;
    nik: number;
    nama_lengkap: string;
    tempat_lahir: string;
    tgl_lahir: Date;
    jk: string;
    id_provinsi_domisili: any;
    id_kabupaten_domisili: any;
    id_provinsi: any;
    id_kabupaten: 0;
    tingkat_penugasan: string;
    thn_tugas: Date;
    pendidikan_terakhir: string;
    jurusan: string;
    nama_instansi_pendidikan: string;
    id_hobi: string;
    provinsi: any;
    kabupaten: any;
    hobi: any;
    minat: any;
    detailMinat: any;
    bakat: any;
    detailBakat: any;
    jabatan: any;
    jabatanProvinsi: any;
    jabatanKabupaten: any;
}
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

function RegisterForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();
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
        thn_tugas: '',
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
    const filteredKabupatenDomisili = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsiDomisili));

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
    console.log(data);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, index) => currentYear - index);

    //provinsi dan kabupaten penugasan
    const [selectedProvinsi, setSelectedProvinsi] = useState<string>('');
    const filteredKabupaten = kabupaten.filter((kabupaten: any) => kabupaten.id_provinsi === Number(selectedProvinsi));

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
    const filteredDetailFirstMinat = detailMinat && detailMinat.filter((detMinat: any) => detMinat.id_minat === Number(selectedMinat));

    const handleFirstMinatChange = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_minat: value,
            detail_minat: '', // Reset detail_minat saat minat berubah
        }));
        setSelectedMinat(value);
    };

    const filteredSecondMinat = minat.filter((minatKedua: any) => minatKedua.id !== Number(selectedMinat));
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
    const filteredDetailBakat = detailBakat.filter((detBakat: any) => detBakat.id_bakat === Number(selectedBakat));

    const handleFirstBakatChange = (e: any) => {
        const value = e.target.value;
        setData((prev: any) => ({
            ...prev,
            id_bakat: value,
            detail_bakat: '',
        }));
        setSelectedBakat(value);
    };

    const handleOnChangeRadio = (e: any) => {
        const { name, value, type, checked } = e.target;
        setData({
            ...data,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFilePiagamChange = (e: any) => {
        setSelectedFilePiagam(e);
    };

    //submit 
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        // ✅ Tampilkan SweetAlert loading
        let loadingAlert: any;
        try {
            loadingAlert = Swal.fire({
                title: 'Mohon Menunggu...',
                html: 'Data beserta file sedang diupload<br/>Proses ini mungkin membutuhkan beberapa saat',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            if (!executeRecaptcha) {
                setErrorMessage('reCAPTCHA belum siap. Muat ulang halaman, ya.');
                setIsSubmitting(false);
                Swal.close(); // ✅ Tutup loading alert
                return;
            }

            // ✅ Dapatkan token reCAPTCHA
            const token = await executeRecaptcha('register');

            if (!token) {
                setErrorMessage('Gagal mendapatkan token reCAPTCHA');
                setIsSubmitting(false);
                Swal.close(); // ✅ Tutup loading alert
                return;
            }

            const formData = new FormData();
            const finalData = {
                ...data,
                // Konversi field integer yang kosong menjadi null
                id_kabupaten: data.id_kabupaten === '' ? null : data.id_kabupaten,
                id_provinsi: data.id_provinsi === '' ? null : data.id_provinsi,
                id_provinsi_domisili: data.id_provinsi_domisili === '' ? null : data.id_provinsi_domisili,
                id_kabupaten_domisili: data.id_kabupaten_domisili === '' ? null : data.id_kabupaten_domisili,
                id_minat: data.id_minat === 0 ? null : data.id_minat,
                id_minat_2: data.id_minat_2 === 0 ? null : data.id_minat_2,
                id_bakat: data.id_bakat === 0 ? null : data.id_bakat,
            };

            if (finalData.no_piagam === '') {
                finalData.no_piagam = null;
            }

            // ✅ Update loading message untuk proses foto
            await loadingAlert.update({
                html: 'Sedang memproses foto...',
            });

            // Handle photo upload
            if (previewCanvasRef.current) {
                const canvas = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('avatar', croppedBlob);
            }

            // ✅ Update loading message untuk proses file piagam
            await loadingAlert.update({
                html: 'Sedang memproses file piagam...',
            });

            // Handle piagam file upload
            if (selectedFilePiagam && selectedFilePiagam.target.files[0]) {
                formData.append('file_piagam', selectedFilePiagam.target.files[0]);
            }

            // ✅ Update loading message untuk proses data
            await loadingAlert.update({
                html: 'Sedang mengirim data...',
            });

            // Append all other form data
            Object.keys(finalData).forEach(key => {
                if (finalData[key] !== null && finalData[key] !== undefined) {
                    if (Array.isArray(finalData[key])) {
                        formData.append(key, JSON.stringify(finalData[key]));
                    } else {
                        formData.append(key, finalData[key].toString());
                    }
                }
            });

            formData.append('recaptchaToken', token);

            await axios.post(`${UrlApi}/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // ✅ Tambah timeout 60 detik
            });

            // ✅ Tutup loading alert sebelum tampilkan success
            Swal.close();

            Swal.fire({
                icon: 'success',
                text: 'Data Anda berhasil dikirim, Kami akan mengirimkan tautan email Anda secara berkala untuk informasi selanjutnya',
                showConfirmButton: true,
                confirmButtonText: 'Kembali ke Beranda',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/';
                }
            });
        } catch (error: any) {
            console.error(error);

            // ✅ Pastikan loading alert ditutup saat error
            if (loadingAlert) {
                Swal.close();
            }

            const data = error.response?.data;

            let msg = 'Terjadi kesalahan saat mengirim data';
            if (typeof data === 'string') {
                msg = data;
            } else if (data?.message) {
                msg = data.message;
            } else if (data?.errors) {
                const first = Object.entries(data.errors)[0] as [string, any] | undefined;
                if (first) msg = `${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : String(first[1])}`;
            } else if (data && typeof data === 'object') {
                const first = Object.entries(data)[0] as [string, any] | undefined;
                if (first) msg = `${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : String(first[1])}`;
            }

            // ✅ Tambahkan pesan khusus untuk timeout
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                msg = 'Koneksi timeout. Silakan coba lagi atau periksa koneksi internet Anda.';
            }
            if (typeof data === 'string' && data.includes('<html')) {
                msg = 'Gagal upload: ukuran file terlalu besar.';
            }

            Swal.fire({
                icon: 'error',
                text: msg,
            });
            setErrorMessage(msg);
            setIsSubmitting(false);
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
            <div className='max-w-7xl min-h-svh mx-auto'>
                <div className='w-full max-w-sm flex flex-col mx-auto'>
                    <div className='flex flex-col gap-1 my-2'>
                        <Link href='/' className='flex flex-col items-center gap-2 font-medium'>
                            <div className='mb-1 flex h-auto w-full items-center justify-center rounded-md'>
                                <img src='/assets/images/simental-perkasa.png' alt='Logo Simental Perkasa DPPI BPIP RI' />
                            </div>
                        </Link>
                        <h1 className='text-accent text-sm italic'>
                            {typeof errorMessage === 'string' ? errorMessage : ''}
                        </h1>

                        <h1 className='font-medium text-center'>Silahkan lengkapi data diri Anda</h1>
                    </div>
                </div>

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
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='alamat'>Alamat:</InputLabel>
                                <TextInput
                                    className='text-sm'
                                    id='alamat'
                                    type='text'
                                    name='alamat'
                                    required
                                    tabIndex={8}
                                    autoComplete='alamat'
                                    defaultValue={data.alamat}
                                    onChange={handleOnChange}
                                    placeholder='Alamat (nama jalan, no. rumah, RT/RW, Desa, Kecamatan)'
                                />
                            </div>

                            <div className='border-t-2 my-4'>
                                <p className='font-semibold'>PENDIDIKAN</p>
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='pendidikan_terakhir'>Pendidikan Terakhir:</InputLabel>
                                <select
                                    name='pendidikan_terakhir'
                                    id='pendidikan_terakhir'
                                    tabIndex={9}
                                    defaultValue={data.pendidikan_terakhir}
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
                                        defaultValue={data.jabatan}
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
                                        defaultValue={data.jabatan}
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
                                        defaultValue={data.jabatan}
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
                                    defaultValue={data.tingkat_penugasan}
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
                                    defaultValue={data.thn_tugas}
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
                                <InputLabel htmlFor='no_piagam'>Nomor Piagam / SK:</InputLabel>
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
                                <InputLabel htmlFor='Piagam'>File Piagam / SK Purnapaskibraka Duta Pancasila:</InputLabel>
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

                                {hobi &&
                                    <Select
                                        instanceId="select-hobi"
                                        inputId="hobi-select"
                                        name="id_hobi"
                                        closeMenuOnSelect
                                        tabIndex={17}
                                        components={animatedComponents}
                                        isMulti
                                        options={hobi}
                                        onChange={handleOnSelect}
                                        className="border-gray-300 focus:border-red-500 text-sm focus:ring-red-500 rounded-md shadow-sm ring-gray-400"
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                }
                            </div>
                            <div className='grid gap-2 mt-4'>
                                <InputLabel htmlFor='id_minat'>Kategori Minat:</InputLabel>
                                <select
                                    name='id_minat'
                                    id='id_minat'
                                    onChange={handleFirstMinatChange}
                                    defaultValue={data.id_minat}
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
                                    defaultValue={data.detail_minat}
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
                                            defaultValue={data.id_minat_2}
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
                                            defaultValue={data.detail_minat_2}
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

                            <div className='flex items-start mt-4'>
                                <input
                                    type='checkbox'
                                    className='shrink-0 mt-1.5 dark:bg-white border-gray-200 rounded-sm text-accent focus:ring-red-500 checked:border-red-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:checked:bg-red-500 dark:checked:border-red-500 dark:focus:ring-offset-gray-800'
                                    id='agreement'
                                    defaultChecked={data.agreement}
                                    name='agreement'
                                    tabIndex={28}
                                    onChange={handleOnChangeRadio}
                                />
                                <label htmlFor='agreement' className='ms-2 text-sm dark:text-gray-200'>
                                    Dengan saya mencentang kotak di samping kiri, saya menyatakan menyepakati dan menandatangani Kode Etik Anggota DPPI. <br />
                                    Catatan: Kode etik tercantum pada menu regulasi{' '}
                                    <a className='text-blue-600 underline' href={`${UrlApi}/regulasi/view/1748545839_1677050023_KODE_ETIK_ANGGOTA_DPPI.pdf`} target='_blank'>
                                        di laman ini
                                    </a>
                                </label>
                            </div>
                            <div className='border-t-2 mt-4'></div>
                            <div className='flex justify-end mt-4'>
                                <button type='submit' tabIndex={29} className={`bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg mx-1`}>
                                    DAFTAR
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default function Register() {
    return (
        <div>
            <GoogleReCaptchaProvider reCaptchaKey='6LeemygqAAAAAJP7iYrptxnFS1gAmP9iwjx_Lydx'>
                <RegisterForm />
            </GoogleReCaptchaProvider>
        </div>
    );
}