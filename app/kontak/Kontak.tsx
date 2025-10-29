'use client';
import { FormEventHandler, useState, ChangeEvent } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Button } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UrlApi } from '../Components/apiUrl';

interface FormData {
    nama: string;
    telepon: string;
    email: string;
    jenis_pesan: string;
    pesan: string;
    recaptcha_token?: string;
}

function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        nama: '',
        telepon: '',
        email: '',
        jenis_pesan: '',
        pesan: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validasi tipe file - Izinkan gambar dan PDF
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf'
            ];

            const maxSize = 10 * 1024 * 1024; // 10MB

            // Validasi tipe file
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    text: 'Hanya file gambar (JPEG, PNG, GIF, WebP) dan PDF yang diizinkan',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2563eb',
                });
                e.target.value = ''; // Reset input file
                setSelectedFile(null);
                return;
            }

            // Validasi ukuran file
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    text: 'Ukuran file maksimal 10MB',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2563eb',
                });
                e.target.value = ''; // Reset input file
                setSelectedFile(null);
                return;
            }

            // Validasi tambahan untuk PDF - pastikan ekstensi sesuai
            if (file.type === 'application/pdf') {
                const fileName = file.name.toLowerCase();
                if (!fileName.endsWith('.pdf')) {
                    Swal.fire({
                        icon: 'error',
                        text: 'File PDF harus memiliki ekstensi .pdf',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2563eb',
                    });
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                }
            }

            // Validasi tambahan untuk gambar - pastikan ekstensi sesuai dengan tipe
            if (file.type.startsWith('image/')) {
                const fileName = file.name.toLowerCase();
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                const hasValidExtension = imageExtensions.some(ext => fileName.endsWith(ext));

                if (!hasValidExtension) {
                    Swal.fire({
                        icon: 'error',
                        text: 'Ekstensi file gambar tidak sesuai dengan tipe file',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2563eb',
                    });
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                }
            }

            // Jika semua validasi passed, set file
            setSelectedFile(file);

            // Tampilkan konfirmasi sukses
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            Swal.fire({
                icon: 'success',
                title: 'File Valid',
                text: `File "${file.name}" (${fileSizeMB} MB) berhasil dipilih dan siap diupload`,
                showConfirmButton: false,
                timer: 2000
            });

        } else {
            // Jika tidak ada file yang dipilih
            setSelectedFile(null);
        }
    };

    // Fungsi untuk menghapus file yang sudah dipilih
    const handleRemoveFile = () => {
        setSelectedFile(null);
        const fileInput = document.getElementById('evidance') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        Swal.fire({
            icon: 'info',
            text: 'File telah dihapus',
            showConfirmButton: false,
            timer: 1500
        });
    };

    // Fungsi untuk menampilkan preview file
    const getFilePreview = () => {
        if (!selectedFile) return null;

        const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

        if (selectedFile.type.startsWith('image/')) {
            return (
                <div className="mt-3 p-3 bg-white-800 rounded-md">
                    <p className="text-white text-sm font-semibold">Preview Gambar:</p>
                    <div className="flex items-center mt-2">
                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="max-w-24 max-h-24 object-cover rounded mr-3"
                        />
                        <div className="flex-1">
                            <p className="text-white text-xs truncate">{selectedFile.name}</p>
                            <p className="text-gray-300 text-xs">Ukuran: {fileSizeMB} MB</p>
                            <p className="text-gray-300 text-xs">Tipe: {selectedFile.type}</p>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="mt-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                            >
                                Hapus File
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (selectedFile.type === 'application/pdf') {
            return (
                <div className="mt-3 p-3 bg-red-800 rounded-md">
                    <p className="text-white text-sm font-semibold">File PDF:</p>
                    <div className="flex items-center mt-2">
                        <div className="bg-red-600 text-white p-3 rounded mr-3">
                            <span className="text-lg">📄</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm truncate">{selectedFile.name}</p>
                            <p className="text-gray-300 text-xs">Ukuran: {fileSizeMB} MB</p>
                            <p className="text-gray-300 text-xs">Tipe: PDF Document</p>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="mt-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                            >
                                Hapus File
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const submit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!executeRecaptcha) {
            console.log('Execute recaptcha not yet available');
            Swal.fire({
                icon: 'error',
                text: 'Silakan tunggu sebentar...',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Validasi untuk jenis pesan Pelaporan
            if (formData.jenis_pesan === 'Pelaporan' && !selectedFile) {
                Swal.fire({
                    icon: 'error',
                    text: 'Jenis Pesan Pelaporan wajib menyertakan bukti PDF',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2563eb',
                });
                setIsSubmitting(false);
                return;
            }

            const recaptchaToken = await executeRecaptcha('contact_form');

            const formDataToSend = new FormData();

            // Append form data
            formDataToSend.append('nama', formData.nama);
            formDataToSend.append('telepon', formData.telepon);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('jenis_pesan', formData.jenis_pesan);
            formDataToSend.append('pesan', formData.pesan);
            formDataToSend.append('recaptcha_token', recaptchaToken);

            // Append file jika ada
            if (selectedFile) {
                formDataToSend.append('evidance', selectedFile);
            }

            // Kirim data ke server
            const response = await axios.post(`${UrlApi}/pesan`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    text: 'Pesan berhasil dikirim!',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2563eb',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Reset form
                        setFormData({
                            nama: '',
                            telepon: '',
                            email: '',
                            jenis_pesan: '',
                            pesan: '',
                        });
                        setSelectedFile(null);
                        // Reset file input
                        const fileInput = document.getElementById('evidance') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                    }
                });
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);

            let errorMessage = 'Terjadi kesalahan saat mengirim pesan';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Swal.fire({
                icon: 'error',
                text: errorMessage,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit}>
            <p className='py-2 text-lg font-semibold text-center text-white'>KONTAK</p>

            <div className='grid grid-cols-1 my-2 ml-8 mr-8'>
                <input
                    className='bg-white w-full mx-2 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 p-2'
                    type='text'
                    id='nama'
                    name='nama'
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder='Nama Lengkap'
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className='grid grid-cols-1 my-2 ml-8 mr-8'>
                <input
                    className='bg-white w-full mx-2 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 p-2'
                    type='text'
                    id='telepon'
                    name='telepon'
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder='No. Telepon'
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className='grid grid-cols-1 my-2 ml-8 mr-8'>
                <input
                    className='bg-white w-full mx-2 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 p-2'
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Alamat Email'
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className='grid grid-cols-1 my-2 ml-10 mr-6'>
                <select
                    name='jenis_pesan'
                    id='jenis_pesan'
                    value={formData.jenis_pesan}
                    onChange={handleChange}
                    className='mx-2 border-gray-300 rounded-md bg-white shadow-sm focus:border-red-500 focus:ring-red-500 p-2'
                    disabled={isSubmitting}
                >
                    <option value=''>--Pilih Salah Satu--</option>
                    <option value='Pelaporan'>Pelaporan</option>
                    <option value='Pertanyaan'>Pertanyaan</option>
                    <option value='Konfirmasi'>Konfirmasi</option>
                    <option value='Permintaan'>Permintaan</option>
                    <option value='Informasi'>Informasi</option>
                </select>
            </div>

            {formData.jenis_pesan === 'Pelaporan' && (
                <div className='grid grid-cols-1 my-2 ml-8 mr-8'>
                    <label htmlFor='evidance' className='text-white mx-2 mb-2 block'>
                        Bukti (Gambar/PDF, maks. 10MB):
                    </label>
                    <input
                        className='w-full mx-2 border-gray-300 p-2 bg-white rounded-md shadow-sm focus:border-red-500 focus:ring-red-500'
                        type='file'
                        id='evidance'
                        name='evidance'
                        accept='.jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf'
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                    />
                    <p className="text-white text-xs mt-1 mx-2">
                        Format yang didukung: JPG, JPEG, PNG, GIF, WebP, PDF
                    </p>

                    {/* Tampilkan preview file */}
                    {getFilePreview()}
                </div>
            )}
            <div className='grid grid-cols-1 my-2 ml-8 mr-8'>
                <textarea
                    className='w-full h-48 md:h-20 lg:h-16 bg-white p-2 xl:h-48 mx-2 mb-2 border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500'
                    id='pesan'
                    name='pesan'
                    value={formData.pesan}
                    onChange={handleChange}
                    placeholder='Tinggalkan pesan anda di sini...'
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className='flex flex-row justify-end mt-4'>
                <Button
                    type='submit'
                    className='ms-4 mb-4 bg-white px-6 mx-6 py-2 rounded-lg disabled:opacity-50'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </Button>
            </div>
        </form>
    );
}

export default function Kontak() {
    return (
        <div>
            <GoogleReCaptchaProvider reCaptchaKey='6LeemygqAAAAAJP7iYrptxnFS1gAmP9iwjx_Lydx'>
                <div className='border-b-4 bg-primary border-secondary md:header'>
                    <div className='mx-auto max-w-[1275px] px-2'>
                        <ul className='flex'>
                            <div className='py-2 mx-auto text-slate-50'>
                                <span className='text-2xl font-bold'>KONTAK</span>
                            </div>
                        </ul>
                    </div>
                </div>

                <div className='block md:flex md:flex-row justify-center mx-auto max-w-[1275px] px-2'>
                    <div className='w-full my-10 bg-red-700 rounded-md'>
                        <ContactForm />
                    </div>
                    <div>
                        <div className='h-auto mx-2 my-10 overflow-hidden border-2 border-red-700 rounded-md'>
                            <iframe
                                src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15866.86365746208!2d106.825246!3d-6.1687825!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f54e65a00fe1%3A0xb5f498c61601e3d6!2sBPIP%20RI!5e0!3m2!1sid!2sid!4v1683789460368!5m2!1sid!2sid'
                                loading='lazy'
                                className='w-[400px] h-[400px] md:w-[500px] md:h-[400px] xl:w-[800px] xl:h-[600px]'
                                referrerPolicy='no-referrer-when-downgrade'
                                title='Peta Lokasi'
                            />
                        </div>
                    </div>
                </div>
            </GoogleReCaptchaProvider>
        </div>
    );
}