'use client'
import { useEffect, useRef, useState, FormEvent } from 'react';
import axios from 'axios';
import 'datatables.net-dt';
import $ from 'jquery';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale';
import { format } from 'date-fns';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { canvasPreview } from '@/app/components/CanvasPreview';
import FormatLongDate from '@/app/components/FormatLongDate';
import { UrlApi } from '@/app/components/apiUrl';
import InputLabel from '@/app/components/InputLabel';
import TextInput from '@/app/components/TextInput';
import { BaseUrl } from '@/app/components/baseUrl';

registerLocale('id', id);

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

export default function Kegiatan() {
    //fetching Contact
    const [kegiatan, setKegiatan] = useState();
    const [loading, setLoading]: any = useState(false);

    const getData = () => {
        axios
            .get(`${UrlApi}/kegiatan`)
            .then((response: any) => {
                setKegiatan(response.data);

            })
            .catch((error) => {
                console.error('Error fetching kegiatan data:', error);
            });
    };

    useEffect(() => {
        getData();
    }, [])

    const [dataKegiatan, setDataKegiatan]: any = useState({
        kategori: '',
        nama_kegiatan: '',
        photo: '',
        biaya: '',
        lokasi: '',
        tanggal: '',
        jam: '',
        batas_pendaftaran: '',
        map: '',
        link_pendaftaran: '',
        status: '',
    });

    const handleOnChange = (e: any) => {
        setDataKegiatan({
            ...dataKegiatan,
            [e.target.name]: e.target.value,
        });
    };

    //photo
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop]: any = useState({
        width: 5,
        height: 3,
        aspect: 5 / 3,
    });
    const [completedCrop, setCompletedCrop]: any = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect]: any = useState(5 / 3);

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

    //tanggal Kegiatan
    const [startDate, setStartDate] = useState(null);

    const handleDateChange = (date: any) => {
        const formattedDate = format(date, 'yyyy/MM/dd');
        handleChangeCreate({ target: { name: 'tanggal', value: formattedDate } });
        setStartDate(date); // Tetap gunakan objek `Date` untuk UI
    };
    //Batas Pendaftaran
    const [endDate, setEndDate] = useState(null);

    const handleEndDateChange = (date: any) => {
        const formattedDate = format(date, 'yyyy/MM/dd');
        handleChangeCreate({ target: { name: 'batas_pendaftaran', value: formattedDate } });
        setEndDate(date); // Tetap gunakan objek `Date` untuk UI
    };

    //tanggal Kegiatan edit
    const handleDateChangeEdit = (date: any) => {
        const formattedDate = format(date, 'yyyy/MM/dd');
        handleOnChange({ target: { name: 'tanggal', value: formattedDate } });
    };

    //Batas Pendaftaran
    const handleEndDateChangeEdit = (date: any) => {
        const formattedDate = format(date, 'yyyy/MM/dd');
        handleOnChange({ target: { name: 'batas_pendaftaran', value: formattedDate } });
    };

    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<img src=${BaseUrl + data.photo} class="max-w-20 mx-auto p-0" />`;
            },
        },
        { data: 'nama_kegiatan' },
        { data: 'kategori' },

        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p class="text-right">Rp${data.biaya.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>`;
            },
        },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p>${data.lokasi}</p><p>${FormatLongDate(data.tanggal)} - ${data.jam.slice(0, 5)}</p>`;
            },
        },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<p>${FormatLongDate(data.batas_pendaftaran)}</p>`;
            },
        },

        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return data.map ? `<a href="${data.map}" target="_blank" class="text-blue-600 underline">Link Map</a>` : '';
            },
        },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return data.link_pendaftaran ? `<a href="${data.link_pendaftaran}" target="_blank" class="text-blue-600 underline">Link Pendaftaran</a>` : '';
            },
        },

        { data: 'status' },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return '<div class="flex flex-col justify-center"><button class="edit-btn text-white rounded-md ml-4 hover:bg-green-700 bg-green-600 px-4 mt-2 py-1">Edit</button><button class="delete-btn text-white rounded-md ml-4 hover:bg-red-700 bg-accent px-4 mt-2 py-1">Hapus</button></div>';
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
        try {
            await axios.delete(`${UrlApi}/adminpanel/kegiatan/${deleteData.id}`, { withCredentials: true });
            Swal.fire({
                icon: 'success',
                text: 'Kegiatan berhasil dihapus',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/kegiatan';
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data kegiatan',
            });
        }
    };

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: kegiatan,
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
            setDataKegiatan({
                id: editData.id,
                nama_kegiatan: editData.nama_kegiatan,
                kategori: editData.kategori,
                biaya: editData.biaya,
                lokasi: editData.lokasi,
                tanggal: editData.tanggal,
                jam: editData.jam,
                batas_pendaftaran: editData.batas_pendaftaran,
                map: editData.map,
                link_pendaftaran: editData.link_pendaftaran,
                status: editData.status,
            });
            $('#nama').text(editData.nama_kegiatan);
            $('#kategori').text(editData.kategori);
            $('#editModal').removeClass('hidden');
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
    }, [kegiatan]);

    //submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Handle photo upload
            if (previewCanvasRef.current) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('photo', croppedBlob);
            }

            // Append all other form data
            formData.append('nama_kegiatan', dataKegiatan.nama_kegiatan);
            formData.append('kategori', dataKegiatan.kategori);
            formData.append('biaya', dataKegiatan.biaya);
            formData.append('lokasi', dataKegiatan.lokasi);
            formData.append('tanggal', dataKegiatan.tanggal);
            formData.append('jam', dataKegiatan.jam);
            formData.append('batas_pendaftaran', dataKegiatan.batas_pendaftaran);
            formData.append('map', dataKegiatan.map);
            formData.append('link_pendaftaran', dataKegiatan.link_pendaftaran);
            formData.append('status', dataKegiatan.status);
            await axios.put(`${UrlApi}/adminpanel/kegiatan/${dataKegiatan.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            Swal.fire({
                icon: 'success',
                text: 'Kegiatan berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/kegiatan';
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim data',
            });
        }
    };

    //tambah data
    const [data, setData]: any = useState({
        kategori: '',
        nama_kegiatan: '',
        photo: '',
        biaya: '',
        lokasi: '',
        tanggal: '',
        jam: '',
        batas_pendaftaran: '',
        map: '',
        link_pendaftaran: '',
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

            // Handle photo upload
            if (previewCanvasRef.current) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('photo', croppedBlob);
            }

            formData.append('nama_kegiatan', data.nama_kegiatan);
            formData.append('kategori', data.kategori);
            formData.append('biaya', data.biaya);
            formData.append('lokasi', data.lokasi);

            // Format tanggal dengan dash (-) bukan slash (/)
            const formattedTanggal = data.tanggal.replace(/\//g, '-');
            formData.append('tanggal', formattedTanggal);

            formData.append('jam', data.jam);

            // Format batas_pendaftaran dengan dash (-) juga
            const formattedBatasPendaftaran = data.batas_pendaftaran.replace(/\//g, '-');
            formData.append('batas_pendaftaran', formattedBatasPendaftaran);

            formData.append('map', data.map);
            formData.append('link_pendaftaran', data.link_pendaftaran);
            formData.append('status', data.status);

            await axios.post(`${UrlApi}/adminpanel/kegiatan`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            Swal.fire({
                icon: 'success',
                text: 'Kegiatan berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/kegiatan';
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim data',
            });
        }
    };
    return (
        <>
            <div className='py-4'>
                <div className='text-gray-9000 flex flex-row justify-between'>
                    <div className='flex flex-row'>
                        <i className='text-accent fa fa-calendar-check text-5xl pr-5'></i>
                        <p className='text-2xl py-2 font-semibold text-accent'>KEGIATAN</p>
                    </div>
                    <div className='flex flex-row'>
                        <button className='text-center bg-green-700 hover:bg-green-800 px-2 rounded-lg text-white' onClick={createModal}>
                            Tambah Kegiatan
                        </button>
                    </div>
                </div>
            </div>
            <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-gray-900 dark:text-gray-50'>Loading...</div>}</div>
            <div className='relative p-0 overflow-hidden rounded-md'>
                <div className='px-0 mx-auto mt-2 bg-white rounded-md shadow-lg dark:bg-default lg:px-4'>
                    <div className='px-4 mx-auto overflow-auto text-xs 1xl:block 1xl:w-full 2xl:text-base'>
                        <table ref={tableRef} className='table text-xs dataTable cell-border table-bordered'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Photo</th>
                                    <th>Nama Kegiatan</th>
                                    <th>Kategori</th>
                                    <th>Biaya</th>
                                    <th>Lokasi</th>
                                    <th>Batas Pendaftaran</th>
                                    <th>Map</th>
                                    <th>Link Pendaftaran</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>

            {/* edit Modal */}
            {dataKegiatan ?
                (<div id='editModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-svh md:h-full' >
                    <div className='relative w-full h-full max-w-3xl mx-auto md:h-auto overflow-x-hidden overflow-y-auto'>
                        <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-dark dark:border dark:border-white'>
                            <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white '>
                                    <span className='mr-1 text-accent'>Edit Kegiatan</span>
                                </div>
                                <button
                                    type='button'
                                    onClick={closeEditModal}
                                    className='close-btn text-accent hover:text-accent hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                    publikasi-modal-hide='editModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className='px-4 py-2 text-dark dark:text-white'>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='photo'>Undangan/Brosur/Foto:</InputLabel>
                                        <input className='col-span-3 bg-white dark:bg-gray-700 border-2 text-sm w-full rounded-md' type='file' accept='image/*' onChange={onSelectFile} />
                                    </div>
                                    <p className='text-xs text-accent'>*) abaikan jika tidak ada perubahan</p>
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
                                                        height: completedCrop.height,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='nama_kegiatan'>Nama Kegiatan:</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='nama_kegiatan'
                                            type='text'
                                            name='nama_kegiatan'
                                            required
                                            tabIndex={1}
                                            defaultValue={dataKegiatan.nama_kegiatan}
                                            autoComplete='nama_kegiatan'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <label htmlFor='kategori' className='block font-medium text-sm text-gray-700 dark:text-gray-200'>Kategori:</label>
                                        <select
                                            className='border-gray-300 col-span-3 bg-white focus:border-accent text-sm focus:ring-accent rounded-md shadow-sm dark:bg-gray-700'
                                            name='kategori'
                                            value={dataKegiatan.kategori}
                                            onChange={handleOnChange}>
                                            <option value=''>Pilih Salah Satu</option>
                                            <option value='Seleksi PDP'>Seleksi PDP</option>
                                            <option value='Sejarah Pancasila'>Sejarah Pancasila</option>
                                            <option value='Olahraga'>Olahraga</option>
                                            <option value='Seni'>Seni</option>
                                        </select>
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='Biaya'>Biaya:</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='biaya'
                                            type='number'
                                            name='biaya'
                                            value={dataKegiatan.biaya}
                                            required
                                            tabIndex={3}
                                            autoComplete='biaya'
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='lokasi'>Lokasi Kegiatan:</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='lokasi'
                                            type='text'
                                            name='lokasi'
                                            required
                                            defaultValue={dataKegiatan.lokasi}
                                            tabIndex={4}
                                            autoComplete='lokasi'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='tanggal'>Tanggal Kegiatan (tgl/bln/thn):</InputLabel>
                                        <DatePicker
                                            wrapperClassName='datepicker'
                                            selected={dataKegiatan.tanggal}
                                            onChange={handleDateChangeEdit}
                                            dateFormat='dd/MM/yyyy'
                                            locale='id'
                                            tabIndex={5}
                                            className='border-gray-300 col-span-3 bg-white focus:border-accent text-sm focus:ring-accent rounded-md shadow-sm dark:bg-gray-700'
                                            name='tanggal'
                                            autoComplete='tanggal'
                                            required
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='Jam'>Jam:</InputLabel>
                                        <TextInput
                                            className='text-sm'
                                            id='jam'
                                            type='time'
                                            name='jam'
                                            required
                                            defaultValue={dataKegiatan.jam}
                                            tabIndex={4}
                                            autoComplete='jam'
                                            pattern="[^'$<>\x22]+"
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='Batas Pendaftaran'>Batas Pendaftaran (tgl/bln/thn):</InputLabel>
                                        <DatePicker
                                            wrapperClassName='datepicker'
                                            selected={dataKegiatan.batas_pendaftaran}
                                            onChange={handleEndDateChangeEdit}
                                            dateFormat='dd/MM/yyyy'
                                            locale='id'
                                            tabIndex={5}
                                            className='border-gray-300 col-span-3 bg-white focus:border-accent text-sm focus:ring-accent rounded-md shadow-sm dark:bg-gray-700'
                                            name='batas_pendaftaran'
                                            autoComplete='batas_pendaftaran'
                                            required
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='map'>Google Map</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='map'
                                            type='text'
                                            name='map'
                                            tabIndex={6}
                                            autoComplete='map'
                                            defaultValue={dataKegiatan.map}
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='Link Pendaftaran'>Link Pendaftaran</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='link_pendaftaran'
                                            type='text'
                                            name='link_pendaftaran'
                                            tabIndex={7}
                                            defaultValue={dataKegiatan.link_pendaftaran}
                                            autoComplete='link_pendaftaran'
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 gap-2 mt-4'>
                                        <InputLabel htmlFor='status'>Status</InputLabel>
                                        <TextInput
                                            className='text-sm col-span-3'
                                            id='status'
                                            type='text'
                                            name='status'
                                            tabIndex={8}
                                            defaultValue={dataKegiatan.status}
                                            autoComplete='status'
                                            title='Tidak diperbolehkan karakter khusus'
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                </div>

                                <div className='border-t-2 mt-4'></div>
                                <div className='flex justify-between mt-4 px-8 pb-8'>
                                    <button type='button' onClick={closeEditModal} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                        Tutup
                                    </button>

                                    <button type='submit' tabIndex={29} className={`px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md`}>
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>)
                : ""}
            {/* create Modal */}
            < div id='createModal' className='fixed top-0 left-0 right-0 z-50 hidden p-4 md:inset-0 h-svh md:h-full overflow-y-auto' >
                <div className='relative w-full h-full max-w-3xl mx-auto md:h-auto overflow-x-hidden '>
                    <div className='relative bg-gray-200 rounded-lg shadow-lg dark:bg-dark dark:border dark:border-white'>
                        <div className='flex items-start justify-between p-4 border-b-2 border-white rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white '>
                                <span className='mr-1 text-accent'>Tambah Kegiatan</span>
                            </div>
                            <button
                                type='button'
                                onClick={closeEditModal}
                                className='close-btn text-accent hover:text-accent hover:scale-125 rounded-lg p-1.5 text-lg ml-auto inline-flex items-center dark:hover:text-white'
                                publikasi-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            <div className='px-4 py-2 text-dark dark:text-white'>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='photo'>Undangan/Brosur/Foto:</InputLabel>
                                    <input className='col-span-3 bg-white dark:bg-gray-700 border-2 text-sm w-full rounded-md' type='file' accept='image/*' onChange={onSelectFile} />
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
                                                    height: completedCrop.height,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='nama_kegiatan'>Nama Kegiatan:</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='nama_kegiatan'
                                        type='text'
                                        name='nama_kegiatan'
                                        required
                                        tabIndex={1}
                                        autoComplete='nama_kegiatan'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='kategori'>Kategori:</InputLabel>
                                    <select
                                        name='kategori'
                                        id='kategori'
                                        className='col-span-3 dark:bg-gray-700 border-gray-300 bg-white focus:border-accent focus:ring-accent rounded-md shadow-sm dark:text-gray-200 max-w-[540px]'
                                        onChange={handleChangeCreate}>
                                        <option value=''>Pilih Salah Satu</option>
                                        <option value='Seleksi PDP'>Seleksi PDP</option>
                                        <option value='Sejarah Pancasila'>Sejarah Pancasila</option>
                                        <option value='Olahraga'>Olahraga</option>
                                        <option value='Seni'>Seni</option>
                                    </select>
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='Biaya'>Biaya:</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='biaya'
                                        type='number'
                                        name='biaya'
                                        required
                                        tabIndex={3}
                                        autoComplete='biaya'
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='lokasi'>Lokasi Kegiatan:</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='lokasi'
                                        type='text'
                                        name='lokasi'
                                        required
                                        tabIndex={4}
                                        autoComplete='lokasi'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='tanggal'>Tanggal Kegiatan (tgl/bln/thn):</InputLabel>
                                    <DatePicker
                                        wrapperClassName='datepicker'
                                        selected={startDate}
                                        onChange={handleDateChange}
                                        dateFormat='dd/MM/yyyy'
                                        locale='id'
                                        tabIndex={5}
                                        className='border-gray-300 col-span-3 bg-white focus:border-accent text-sm focus:ring-accent rounded-md shadow-sm dark:bg-gray-700'
                                        name='tanggal'
                                        autoComplete='tanggal'
                                        required
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='Jam'>Jam:</InputLabel>
                                    <TextInput
                                        className='text-sm'
                                        id='jam'
                                        type='time'
                                        name='jam'
                                        required
                                        tabIndex={4}
                                        autoComplete='jam'
                                        pattern="[^'$<>\x22]+"
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='Batas Pendaftaran'>Batas Pendaftaran (tgl/bln/thn):</InputLabel>
                                    <DatePicker
                                        wrapperClassName='datepicker'
                                        selected={endDate}
                                        onChange={handleEndDateChange}
                                        dateFormat='dd/MM/yyyy'
                                        locale='id'
                                        tabIndex={5}
                                        className='border-gray-300 bg-white col-span-3 focus:border-accent text-sm focus:ring-accent rounded-md shadow-sm dark:bg-gray-700'
                                        name='batas_pendaftaran'
                                        autoComplete='batas_pendaftaran'
                                        required
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='map'>Google Map</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='map'
                                        type='text'
                                        name='map'
                                        tabIndex={6}
                                        autoComplete='map'
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='Link Pendaftaran'>Link Pendaftaran</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='link_pendaftaran'
                                        type='text'
                                        name='link_pendaftaran'
                                        tabIndex={7}
                                        autoComplete='link_pendaftaran'
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 mt-4'>
                                    <InputLabel htmlFor='status'>Status</InputLabel>
                                    <TextInput
                                        className='text-sm col-span-3'
                                        id='status'
                                        type='text'
                                        name='status'
                                        tabIndex={8}
                                        autoComplete='status'
                                        title='Tidak diperbolehkan karakter khusus'
                                        onChange={handleChangeCreate}
                                    />
                                </div>
                            </div>
                            <div className='border-t-2 mt-4 border-white'></div>
                            <div className='flex justify-between px-4 pb-2'>
                                <button type='button' onClick={closeEditModal} className='px-8 py-2 mt-2 text-white bg-accent rounded-md'>
                                    Tutup
                                </button>

                                <button type='submit' tabIndex={3} className={`px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md`}>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div >

            {/* delete Modal */}
            < div
                id='deleteModal'
                className='justify-center fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full' >
                <div className='fixed z-30 w-full justify-center max-w-[500px] mx-auto md:top-12 lg:top-40 top-14'>
                    <div className='flex flex-col p-1 lg:p-4 dark:border-gray-600'></div>
                    <div className='w-full mx-auto bg-gray-100 border-2 border-red-200 rounded-md shadow-md lg:col-span-3 lg:px-3 dark:bg-default shadow-red-200'>
                        <div className='flex flex-col px-4 pt-2 rounded-t dark:border-gray-600 border-b'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-accent'>Hapus Data</span>
                                <button
                                    type='button'
                                    onClick={closeDeleteModal}
                                    className='close-btn text-accent hover:text-red-700 hover:scale-125 transition-all duration-100 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-accent'
                                    publikasi-modal-hide='deleteModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                        </div>
                        {/* <div className='flex flex-row text-center'> */}
                        <p className='dark:text-white mx-4 mt-4'>
                            Anda yakin ingin menghapus Kegiatan <span id='deskripsiDelete' className='sm:pl-0 dark:text-white'></span>
                            <span className='dark:text-white'>?</span>
                        </p>
                        {/* </div> */}
                        <div className='mt-2 border-b dark:border-gray-600'></div>
                        <div className='px-4 pb-2'>
                            <form onSubmit={deleteSubmit} encType='multipart/form-data'>
                                <div className='flex flex-row justify-between my-2'>
                                    <button type='button' onClick={closeDeleteModal} className='bg-yellow-500 rounded-md text-dark px-3 py-1'>
                                        Batal
                                    </button>

                                    <button type='submit' className='text-white rounded-md bg-accent px-3 py-1'>
                                        Hapus
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
