'use client';
import { useState, FormEvent, useEffect } from 'react';
import Swal from 'sweetalert2';
import { UrlApi } from '@/app/Components/apiUrl';
import FormatLongDate from '@/app/Components/FormatLongDate';
import Link from 'next/link';
import Pagination from '@/app/Components/Pagination';
import InputLabel from '@/app/Components/InputLabel';
import { BaseUrl } from '@/app/Components/baseUrl';
import Image from 'next/image';
import axios from 'axios';
import { useUser } from '@/app/Components/UserContext';

// Interface untuk data PDP - SESUAI DENGAN BACKEND
interface PdpData {
    id: number;
    no_simental: string | null;
    no_piagam: string | null;
    nama_lengkap: string;
    jk: string | null;
    tempat_lahir: string | null;
    tgl_lahir: string | null;
    alamat: string | null;
    id_kabupaten_domisili: number | null;
    id_provinsi_domisili: number | null;
    kabupaten_domisili: string | null;
    provinsi_domisili: string | null;
    email: string | null;
    telepon: string | null;
    posisi: string | null;
    tingkat_penugasan: string | null;
    id_kabupaten: number | null;
    id_provinsi: number | null;
    kabupaten: string | null;
    provinsi: string | null;
    thn_tugas: number | null;
    status: string | null;
    photo: string | null;
}

// Interface response dari backend - SESUAI DENGAN BACKEND
interface PaginationResponse {
    data: PdpData[];
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    last_page: number;
    from: number;
    to: number;
    query: string;
}

function PdpBelumDiverifikasi() {
    const { user } = useUser()
    const [pdp, setPdp] = useState<PaginationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [dataStatus, setDataStatus] = useState<{
        id?: number,
        status?: string,
        keterangan?: string
    }>({});
    const [modalUpdateStatus, setModalUpdateStatus] = useState(false);
    const [showRejectionReason, setShowRejectionReason] = useState(false);

    // ambil data
    const getPdp = async (page: number = 1, query: string = '') => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (query) {
            params.append('q', query);
        }

        try {
            if (user?.role === "Administrator" || user?.role === "Superadmin") {
                const response = await axios.get(`${UrlApi}/adminpanel/pdp-belum-diverifikasi?${params.toString()}`, {
                    withCredentials: true
                });
                setPdp(response.data);
            } else {
                const response = await axios.get(`${UrlApi}/kesbangpol/pdp-belum-diverifikasi?${params.toString()}`, {
                    withCredentials: true
                });
                setPdp(response.data);
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDataStatus({
            ...dataStatus,
            [name]: value,
        });

        // Jika status dipilih menjadi "Ditolak", tampilkan form alasan
        if (name === 'status' && value === 'Ditolak') {
            setShowRejectionReason(true);
        } else if (name === 'status') {
            setShowRejectionReason(false);
        }
    };

    const clickModalStatus = (item: PdpData) => {
        setModalUpdateStatus(true);
        setDataStatus({
            id: item.id,
            status: item.status || '',
            keterangan: ''
        });
        setShowRejectionReason(false);
    };

    const submitUpdateStatus = async (e: FormEvent) => {
        e.preventDefault();

        if (!dataStatus.id) {
            Swal.fire({
                icon: 'error',
                text: 'ID PDP tidak valid',
            });
            return;
        }

        // Validasi untuk status Ditolak
        if (dataStatus.status === 'Ditolak' && (!dataStatus.keterangan || dataStatus.keterangan.trim() === '')) {
            Swal.fire({
                icon: 'error',
                text: 'Alasan penolakan wajib diisi',
            });
            return;
        }

        // Konfirmasi khusus untuk status Ditolak
        let confirmationMessage = '';
        let confirmButtonColor = '#2563eb';

        if (dataStatus.status === 'Verified') {
            confirmationMessage = 'Anda yakin ingin mengubah status menjadi "Verified"?';
            confirmButtonColor = '#28a745';
        } else if (dataStatus.status === 'Ditolak') {
            confirmationMessage =
                'PERHATIAN: Data PDP akan dihapus permanen dari sistem!\n\n' +
                'Alasan: ' + dataStatus.keterangan + '\n\n' +
                '\n\n. User dapat mendaftar ulang dengan email yang sama setelah data dihapus.\n' +
                'Lanjutkan penolakan?';
            confirmButtonColor = '#dc3545';
        } else {
            confirmationMessage = `Anda yakin ingin mengubah status menjadi "${dataStatus.status}"?`;
        }

        Swal.fire({
            icon: dataStatus.status === 'Ditolak' ? 'warning' : 'question',
            title: dataStatus.status === 'Ditolak' ? 'Konfirmasi Penolakan' : 'Konfirmasi Status',
            text: confirmationMessage,
            showDenyButton: true,
            denyButtonText: 'Batal',
            confirmButtonText: dataStatus.status === 'Ditolak' ? 'Ya, Tolak & Hapus' : 'Ya',
            confirmButtonColor: confirmButtonColor,
            customClass: {
                actions: 'my-actions',
                denyButton: 'order-1 right-gap',
                confirmButton: 'order-3',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {

                Swal.fire({
                    title: 'Mohon menunggu',
                    text: dataStatus.status === 'Verified' ? 'Sedang mengirim email...' : 'Sedang memproses...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                try {
                    const formData = new FormData();
                    formData.append('status', dataStatus.status || '');

                    // Tambahkan keterangan jika status Ditolak
                    if (dataStatus.status === 'Ditolak' && dataStatus.keterangan) {
                        formData.append('keterangan', dataStatus.keterangan);
                    }

                    const response = await fetch(`${UrlApi}/adminpanel/pdp-update-status/${dataStatus.id}`, {
                        method: 'PUT',
                        body: formData,
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    let successMessage = result.message || 'Status berhasil diupdate!';

                    if (dataStatus.status === 'Verified') {
                        successMessage += ' Password telah dikirim ke alamat email yang didaftarkan';
                    } else if (dataStatus.status === 'Ditolak') {
                        successMessage += ' Alasan penolakan telah dikirim via email';
                    }

                    Swal.fire({
                        icon: 'success',
                        text: successMessage,
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2563eb',
                    }).then(() => {
                        setModalUpdateStatus(false);
                        setShowRejectionReason(false);
                        setDataStatus({});
                        getPdp(currentPage, searchQuery);
                    });
                } catch (error: any) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        text: error.message || 'Terjadi kesalahan saat mengirim data',
                    });
                }
            }

        });
    };


    const handlePageChange = (url: string, page: number) => {
        console.log('Navigating to page:', page, 'URL:', url);
        setCurrentPage(page);

        getPdp(page, searchQuery);
    };
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        getPdp(1, searchQuery);
    };

    useEffect(() => {
        getPdp();
    }, []);

    const generateLinks = () => {
        if (!pdp) return [];

        const links = [];

        // Previous page link
        links.push({
            url: pdp.current_page > 1 ? `?page=${pdp.current_page - 1}&q=${searchQuery}` : null,
            label: '<<',
            active: false
        });

        // Page number links
        for (let i = 1; i <= pdp.last_page; i++) {
            links.push({
                url: `?page=${i}&q=${searchQuery}`,
                label: i.toString(),
                active: i === pdp.current_page
            });
        }

        // Next page link
        links.push({
            url: pdp.current_page < pdp.last_page ? `?page=${pdp.current_page + 1}&q=${searchQuery}` : null,
            label: '>>',
            active: false
        });

        return links;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Memuat data...</div>
            </div>
        );
    }

    return (
        <div className='dark:bg-slate-900 min-h-screen p-4'>
            {/* Header dan Search */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6'>
                <div className='flex items-center mb-4 lg:mb-0'>
                    <i className='fas fa-server text-accent text-3xl'></i>
                    <p className='text-accent mt-1 mx-2 font-bold lg:text-2xl dark:text-white'>DATA PDP BELUM DIVERIFIKASI</p>
                </div>
                <Link href='/adminpanel/pdp/create' className='px-4 py-2 text-sm font-semibold text-white rounded-md bg-accent hover:bg-red-800'>
                    <i className='fas fa-plus-circle mr-2'></i> Tambah PDP
                </Link>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className='mb-6'>
                <div className='relative'>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Cari berdasarkan Nomor Piagam, Nama, NIK, Tingkat Penugasan, Provinsi, Kabupaten, atau Tahun Tugas'
                        className='block w-full py-4 h-12 text-sm text-gray-900 border border-gray-300 rounded-3xl bg-gray-50 focus:ring-accent focus:border-accent px-4'
                    />
                    <button
                        type='submit'
                        className='text-white absolute right-1.5 bottom-1.5 bg-accent hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2'>
                        Cari
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse text-sm'>
                        <thead className='bg-gray-100 dark:bg-gray-700'>
                            <tr>
                                <th className='border p-2'>#</th>
                                <th className='border p-2'>Foto</th>
                                <th className='border p-2'>ID PDP</th>
                                <th className='border p-2'>No Simental</th>
                                <th className='border p-2'>No Piagam</th>
                                <th className='border p-2'>Nama Lengkap</th>
                                <th className='border p-2'>Jenis Kelamin</th>
                                <th className='border p-2'>Kelahiran</th>
                                <th className='border p-2'>Alamat Domisili</th>
                                <th className='border p-2'>Email</th>
                                <th className='border p-2'>Telepon</th>
                                <th className='border p-2'>Posisi</th>
                                <th className='border p-2'>Penugasan</th>
                                <th className='border p-2'>Tahun</th>
                                <th className='border p-2'>Status</th>
                                <th className='border p-2'>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pdp && pdp.data.length > 0 ? (
                                pdp.data.map((item, index) => (
                                    <tr key={item.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                                        <td className='border p-2 text-center'>{pdp.from + index}</td>
                                        <td className='border text-center'>
                                            {item.photo ? (
                                                <Image
                                                    src={`${BaseUrl + item.photo.replace("/uploads", "uploads")}`}
                                                    alt={item.nama_lengkap}
                                                    width={80}
                                                    height={120}
                                                    className='max-w-20 mx-auto p-0'
                                                />
                                            ) : (
                                                <img
                                                    src={`/assets/images/logo-dppi.png`}
                                                    alt="Default"
                                                    className='max-w-20 mx-auto p-0'
                                                />
                                            )}
                                        </td>
                                        <td className='border p-2 text-center'>{item.id}</td>
                                        <td className='border p-2'>{item.no_simental || '-'}</td>
                                        <td className='border p-2'>{item.no_piagam || '-'}</td>
                                        <td className='border p-2 font-medium'>{item.nama_lengkap}</td>
                                        <td className='border p-2 text-center'>{item.jk || '-'}</td>
                                        <td className='border p-2'>
                                            {item.tempat_lahir || ''}{item.tempat_lahir && item.tgl_lahir ? ', ' : ''}
                                            {item.tgl_lahir && item.tgl_lahir !== '0000-00-00' ? FormatLongDate(item.tgl_lahir) : ''}
                                        </td>
                                        <td className='border p-2 text-sm'>
                                            <div className='space-y-1'>
                                                <div>{item.alamat}</div>
                                                {item.kabupaten_domisili && (
                                                    <div>{item.kabupaten_domisili}</div>
                                                )}
                                                {item.provinsi_domisili && (
                                                    <div>Prov. {item.provinsi_domisili}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='border p-2'>{item.email || '-'}</td>
                                        <td className='border p-2'>{item.telepon || '-'}</td>
                                        <td className='border p-2 text-center'>{item.posisi || '-'}</td>
                                        <td className='border p-2 text-sm'>
                                            <div className='space-y-1'>
                                                <div>{item.tingkat_penugasan || '-'}</div>
                                                {item.kabupaten && (
                                                    <div>{item.kabupaten}</div>
                                                )}
                                                {item.provinsi && (
                                                    <div>Prov. {item.provinsi}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='border p-2 text-center'>{item.thn_tugas || '-'}</td>
                                        <td className='border p-2 text-center'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className='border p-2'>
                                            <div className='flex flex-col gap-1'>
                                                <a
                                                    href={`/adminpanel/pdp/${item.id}`}
                                                    className='bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-center text-xs'
                                                >
                                                    Lihat
                                                </a>
                                                {item.status !== 'Verified' && (
                                                    <button
                                                        className='bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs'
                                                        onClick={() => clickModalStatus(item)}
                                                    >
                                                        Update Status
                                                    </button>
                                                )}
                                                <a
                                                    href={`/adminpanel/pdp/${item.id}/edit`}
                                                    className='bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-black text-center text-xs'
                                                >
                                                    Edit
                                                </a>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={16} className='border p-4 text-center text-gray-500'>
                                        PDP Tidak ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pdp && pdp.last_page > 1 && (
                    <div className="p-4 border-t">
                        <Pagination
                            links={generateLinks()}
                            onPageChange={handlePageChange}

                        />
                        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {pdp.from} - {pdp.to} dari {pdp.total_items} PDP
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Update Status */}
            {modalUpdateStatus && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20'>
                    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full'>
                        <div className='flex items-center justify-between p-4 border-b'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                Update Status PDP
                            </h3>
                            <button
                                onClick={() => {
                                    setModalUpdateStatus(false);
                                    setShowRejectionReason(false);
                                    setDataStatus({});
                                }}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            >
                                <i className='fas fa-times text-xl'></i>
                            </button>
                        </div>

                        <form onSubmit={submitUpdateStatus}>
                            <div className='p-4 space-y-4'>
                                <div>
                                    <InputLabel htmlFor='status'>Status:</InputLabel>
                                    <select
                                        name='status'
                                        id='status'
                                        value={dataStatus.status || ''}
                                        onChange={handleOnChange}
                                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                                        required
                                    >
                                        <option value=''>-- Pilih Status --</option>
                                        <option value='Belum Diverifikasi'>Belum Diverifikasi</option>
                                        <option value='Ditolak'>Ditolak</option>
                                        <option value='Verified'>Verified</option>
                                    </select>
                                </div>

                                {/* Form Alasan Penolakan */}
                                {showRejectionReason && (
                                    <div>
                                        <InputLabel htmlFor='keterangan'>
                                            Alasan Penolakan <span className="text-red-500">*</span>:
                                        </InputLabel>
                                        <textarea
                                            name='keterangan'
                                            id='keterangan'
                                            value={dataStatus.keterangan || ''}
                                            onChange={handleOnChange}
                                            rows={4}
                                            placeholder='Masukkan alasan penolakan yang jelas dan informatif...'
                                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white'
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Alasan ini akan dikirimkan via email ke PDP.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-between p-4 border-t'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setModalUpdateStatus(false);
                                        setShowRejectionReason(false);
                                        setDataStatus({});
                                    }}
                                    className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                >
                                    Batal
                                </button>
                                <button
                                    type='submit'
                                    className={`px-4 py-2 text-white rounded-md ${dataStatus.status === 'Ditolak'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : dataStatus.status === 'Verified'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default PdpBelumDiverifikasi;