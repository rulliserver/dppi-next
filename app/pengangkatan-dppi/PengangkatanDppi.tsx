'use client'

import { useState, useEffect, useRef } from "react";
import { UrlApi } from "../components/apiUrl";
import axios from "axios";
import Swal from 'sweetalert2';

export default function PengangkatanDppiKabupaten() {
    const [currentStep, setCurrentStep] = useState(1);
    const [kabupaten, setKabupaten] = useState<any[]>([]);
    const [filteredKabupaten, setFilteredKabupaten] = useState<any[]>([]);
    const [selectedKabupaten, setSelectedKabupaten] = useState<string>("");
    const [searchKabupaten, setSearchKabupaten] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Form data states
    const [picData, setPicData] = useState({
        nama: "",
        jabatan: "",
        nip: "",
        noTelp: "",
        email: ""
    });

    const [strukturData, setStrukturData] = useState({
        // Ketua (2 orang)
        ketua_1: "",
        ketua_2: "",

        // Wakil Ketua (2 orang)
        wakil_ketua_1: "",
        wakil_ketua_2: "",

        // Sekretaris (2 orang)
        sekretaris_1: "",
        sekretaris_2: "",

        // Kepala Bidang (masing-masing 2 orang)
        kepala_bidang_dukungan_1: "",
        kepala_bidang_dukungan_2: "",
        kepala_bidang_kompetensi_1: "",
        kepala_bidang_kompetensi_2: "",
        kepala_bidang_aktualisasi_1: "",
        kepala_bidang_aktualisasi_2: "",
        kepala_bidang_kominfo_1: "",
        kepala_bidang_kominfo_2: "",
    });

    // Dokumen states
    const [dokumen, setDokumen] = useState({
        suratSekda: null as File | null,
        daftarRiwayatHidup: null as File | null,
        portofolio: null as File | null,
        kartuKeluarga: null as File | null,
        sertifikatPDP: null as File | null,
        sertifikatDiktatPIP: null as File | null,
    });

    const [agree, setAgree] = useState(false);
    const [selectedKabupatenId, setSelectedKabupatenId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [strukturErrors, setStrukturErrors] = useState<Record<string, string>>({});
    const [picErrors, setPicErrors] = useState<Record<string, string>>({});

    // Fetch kabupaten data
    useEffect(() => {
        getKabupaten();
    }, []);

    // Filter kabupaten based on search
    useEffect(() => {
        if (searchKabupaten) {
            const filtered = kabupaten.filter(kab =>
                kab.nama_kabupaten.toLowerCase().includes(searchKabupaten.toLowerCase())
            );
            setFilteredKabupaten(filtered);
        } else {
            setFilteredKabupaten(kabupaten);
        }
    }, [searchKabupaten, kabupaten]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getKabupaten = () => {
        axios
            .get(`${UrlApi}/kabupaten`)
            .then((response: any) => {
                setKabupaten(response.data);
                setFilteredKabupaten(response.data);
            })
            .catch((error) => {
                console.error('Error fetching kabupaten:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal memuat data kabupaten',
                });
            });
    };

    // Helper functions
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone: string): boolean => {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    };
    const isValidNip = (nip: string): boolean => {
        const digitsOnly = nip.replace(/\D/g, '');
        return digitsOnly.length == 18;
    };

    // Validasi PIC data
    const validatePicData = (): { isValid: boolean; errors: Record<string, string> } => {
        const errors: Record<string, string> = {};

        if (!picData.nama.trim()) errors.nama = 'Nama PIC wajib diisi';
        if (!picData.jabatan.trim()) errors.jabatan = 'Jabatan wajib diisi';
        if (!picData.nip.trim()) errors.nip = 'NIP wajib diisi';
        if (!picData.noTelp.trim()) errors.noTelp = 'No Telepon wajib diisi';
        if (!picData.email.trim()) errors.email = 'Email wajib diisi';

        if (picData.email.trim() && !isValidEmail(picData.email)) {
            errors.email = 'Format email tidak valid';
        }

        if (picData.nip.trim() && !isValidNip(picData.nip)) {
            errors.nip = 'Format NIP tidak valid (harus 18 digit)';
        }

        if (picData.noTelp.trim() && !isValidPhone(picData.noTelp)) {
            errors.noTelp = 'Format nomor telepon tidak valid (minimal 10 digit)';
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    // Validasi struktur data
    const validateStrukturData = (): { isValid: boolean; errors: Record<string, string> } => {
        const errors: Record<string, string> = {};
        const fieldLabels: Record<string, string> = {
            'ketua_1': 'Ketua 1',
            'ketua_2': 'Ketua 2',
            'wakil_ketua_1': 'Wakil Ketua 1',
            'wakil_ketua_2': 'Wakil Ketua 2',
            'sekretaris_1': 'Sekretaris 1',
            'sekretaris_2': 'Sekretaris 2',
            'kepala_bidang_dukungan_1': 'Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 1',
            'kepala_bidang_dukungan_2': 'Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 2',
            'kepala_bidang_kompetensi_1': 'Kepala Bidang Peningkatan Kompetensi 1',
            'kepala_bidang_kompetensi_2': 'Kepala Bidang Peningkatan Kompetensi 2',
            'kepala_bidang_aktualisasi_1': 'Kepala Bidang Aktualisasi Nilai-nilai Pancasila 1',
            'kepala_bidang_aktualisasi_2': 'Kepala Bidang Aktualisasi Nilai-nilai Pancasila 2',
            'kepala_bidang_kominfo_1': 'Kepala Bidang Komunikasi, Teknologi dan Informasi 1',
            'kepala_bidang_kominfo_2': 'Kepala Bidang Komunikasi, Teknologi dan Informasi 2',
        };

        Object.keys(strukturData).forEach(field => {
            if (!strukturData[field as keyof typeof strukturData].trim()) {
                errors[field] = `${fieldLabels[field] || field} wajib diisi`;
            }
        });

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    // Real-time validation
    const checkStrukturField = (fieldName: string, value: string) => {
        const newErrors = { ...strukturErrors };

        if (!value.trim()) {
            const fieldLabels: Record<string, string> = {
                'ketua_1': 'Ketua 1',
                'ketua_2': 'Ketua 2',
                'wakil_ketua_1': 'Wakil Ketua 1',
                'wakil_ketua_2': 'Wakil Ketua 2',
                'sekretaris_1': 'Sekretaris 1',
                'sekretaris_2': 'Sekretaris 2',
                'kepala_bidang_dukungan_1': 'Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 1',
                'kepala_bidang_dukungan_2': 'Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 2',
                'kepala_bidang_kompetensi_1': 'Kepala Bidang Peningkatan Kompetensi 1',
                'kepala_bidang_kompetensi_2': 'Kepala Bidang Peningkatan Kompetensi 2',
                'kepala_bidang_aktualisasi_1': 'Kepala Bidang Aktualisasi Nilai-nilai Pancasila 1',
                'kepala_bidang_aktualisasi_2': 'Kepala Bidang Aktualisasi Nilai-nilai Pancasila 2',
                'kepala_bidang_kominfo_1': 'Kepala Bidang Komunikasi, Teknologi dan Informasi 1',
                'kepala_bidang_kominfo_2': 'Kepala Bidang Komunikasi, Teknologi dan Informasi 2',
            };
            newErrors[fieldName] = `${fieldLabels[fieldName] || fieldName} wajib diisi`;
        } else {
            delete newErrors[fieldName];
        }

        setStrukturErrors(newErrors);
    };

    const checkPicField = (fieldName: string, value: string) => {
        const newErrors = { ...picErrors };

        if (!value.trim()) {
            const fieldLabels: Record<string, string> = {
                'nama': 'Nama PIC',
                'jabatan': 'Jabatan',
                'nip': 'NIP',
                'noTelp': 'No Telepon',
                'email': 'Email',
            };
            newErrors[fieldName] = `${fieldLabels[fieldName] || fieldName} wajib diisi`;
        } else if (fieldName === 'email' && value.trim() && !isValidEmail(value)) {
            newErrors[fieldName] = 'Format email tidak valid';
        } else if (fieldName === 'noTelp' && value.trim() && !isValidPhone(value)) {
            newErrors[fieldName] = 'Format nomor telepon tidak valid (minimal 10 digit)';
        } else {
            delete newErrors[fieldName];
        }

        setPicErrors(newErrors);
    };

    const handleNext = () => {
        // Validasi Step 1
        if (currentStep === 1) {
            if (!selectedKabupaten) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Pilih Kabupaten',
                    text: 'Harap pilih kabupaten terlebih dahulu',
                    confirmButtonText: 'Baik',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }
        }

        // Validasi Step 2
        if (currentStep === 2) {
            const validation = validatePicData();
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join('<br>');
                Swal.fire({
                    icon: 'warning',
                    title: 'Data PIC Belum Lengkap',
                    html: `Harap lengkapi data berikut:<br><br>${errorMessages}`,
                    confirmButtonText: 'Baik, Saya akan melengkapi',
                    confirmButtonColor: '#3085d6',
                });
                setPicErrors(validation.errors);
                return;
            }
        }

        // Validasi Step 3
        if (currentStep === 3) {
            const validation = validateStrukturData();
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join('<br>');
                Swal.fire({
                    icon: 'warning',
                    title: 'Data Calon Peserta Belum Lengkap',
                    html: `Harap lengkapi data berikut:<br><br>${errorMessages}`,
                    confirmButtonText: 'Baik, Saya akan melengkapi',
                    confirmButtonColor: '#3085d6',
                });
                setStrukturErrors(validation.errors);
                return;
            }
        }

        // Validasi Step 4
        if (currentStep === 4) {
            const requiredDocuments = ['suratSekda', 'daftarRiwayatHidup', 'portofolio', 'kartuKeluarga'];
            const missingDocuments = requiredDocuments.filter(doc => !dokumen[doc as keyof typeof dokumen]);

            if (missingDocuments.length > 0) {
                const docLabels: Record<string, string> = {
                    'suratSekda': 'Surat Sekretaris Daerah',
                    'daftarRiwayatHidup': 'Daftar Riwayat Hidup',
                    'portofolio': 'Portofolio',
                    'kartuKeluarga': 'Kartu Keluarga',
                };

                const missingLabels = missingDocuments.map(doc => docLabels[doc] || doc);

                Swal.fire({
                    icon: 'warning',
                    title: 'Dokumen Belum Lengkap',
                    html: `Dokumen wajib berikut belum diunggah:<br><br>${missingLabels.join('<br>')}`,
                    confirmButtonText: 'Baik, Saya akan mengunggah',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }
        }

        // Lanjut ke step berikutnya
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!agree) {
            Swal.fire({
                icon: 'warning',
                title: 'Persetujuan Diperlukan',
                text: 'Anda harus menyetujui persyaratan terlebih dahulu!',
                confirmButtonText: 'Baik',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // Validasi akhir sebelum submit
        if (!selectedKabupaten || !selectedKabupatenId) {
            Swal.fire({
                icon: 'warning',
                title: 'Kabupaten Belum Dipilih',
                text: 'Harap pilih kabupaten terlebih dahulu!',
                confirmButtonText: 'Baik',
                confirmButtonColor: '#3085d6',
            });
            setCurrentStep(1);
            return;
        }

        const picValidation = validatePicData();
        if (!picValidation.isValid) {
            Swal.fire({
                icon: 'warning',
                title: 'Data PIC Belum Lengkap',
                html: `Harap lengkapi data PIC terlebih dahulu!`,
                confirmButtonText: 'Baik',
                confirmButtonColor: '#3085d6',
            });
            setCurrentStep(2);
            return;
        }

        const strukturValidation = validateStrukturData();
        if (!strukturValidation.isValid) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Calon Peserta Belum Lengkap',
                html: `Harap lengkapi data calon peserta terlebih dahulu!`,
                confirmButtonText: 'Baik',
                confirmButtonColor: '#3085d6',
            });
            setCurrentStep(3);
            return;
        }

        // Validasi dokumen
        const requiredDocuments = ['suratSekda', 'daftarRiwayatHidup', 'portofolio', 'kartuKeluarga'];
        const missingDocuments = requiredDocuments.filter(doc => !dokumen[doc as keyof typeof dokumen]);

        if (missingDocuments.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Dokumen Belum Lengkap',
                text: 'Harap unggah semua dokumen wajib terlebih dahulu!',
                confirmButtonText: 'Baik',
                confirmButtonColor: '#3085d6',
            });
            setCurrentStep(4);
            return;
        }

        // Konfirmasi submit
        const result = await Swal.fire({
            title: 'Kirim Pendaftaran?',
            html: `
                <div class="text-left">
                    <p>Apakah Anda yakin ingin mengirim pendaftaran?</p>
                    <ul class="list-disc pl-5 mt-2">
                        <li>Kabupaten/Kota: <strong>${selectedKabupaten}</strong></li>
                        <li>PIC: <strong>${picData.nama}</strong></li>
                        <li>Jumlah dokumen: <strong>${Object.values(dokumen).filter(d => d).length}</strong></li>
                    </ul>
                    <p class="mt-3 text-sm text-gray-600">Data tidak dapat diubah setelah dikirim.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim Sekarang',
            cancelButtonText: 'Periksa Kembali',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Show loading
            Swal.fire({
                title: 'Mengirim Data...',
                html: 'Sedang memproses pendaftaran, harap tunggu.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 1. Buat data pendaftaran dasar
            const pendaftaranData = {
                id_kabupaten: selectedKabupatenId,
                nama_kabupaten: selectedKabupaten,
                nama_pic: picData.nama,
                jabatan_pic: picData.jabatan,
                nip_pic: picData.nip,
                no_telp_pic: picData.noTelp,
                email_pic: picData.email,
                ketua_1: strukturData.ketua_1,
                ketua_2: strukturData.ketua_2,
                wakil_ketua_1: strukturData.wakil_ketua_1,
                wakil_ketua_2: strukturData.wakil_ketua_2,
                sekretaris_1: strukturData.sekretaris_1,
                sekretaris_2: strukturData.sekretaris_2,
                kepala_bidang_dukungan_1: strukturData.kepala_bidang_dukungan_1,
                kepala_bidang_dukungan_2: strukturData.kepala_bidang_dukungan_2,
                kepala_bidang_kompetensi_1: strukturData.kepala_bidang_kompetensi_1,
                kepala_bidang_kompetensi_2: strukturData.kepala_bidang_kompetensi_2,
                kepala_bidang_aktualisasi_1: strukturData.kepala_bidang_aktualisasi_1,
                kepala_bidang_aktualisasi_2: strukturData.kepala_bidang_aktualisasi_2,
                kepala_bidang_kominfo_1: strukturData.kepala_bidang_kominfo_1,
                kepala_bidang_kominfo_2: strukturData.kepala_bidang_kominfo_2,
            };

            // 2. Kirim data pendaftaran ke backend
            const response = await axios.post(`${UrlApi}/pendaftaran-dppi`, pendaftaranData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.id) {
                const pendaftaranId = response.data.id;

                // 3. Upload dokumen satu per satu
                const uploadPromises = Object.entries(dokumen)
                    .filter(([_, file]) => file !== null)
                    .map(async ([key, file]) => {
                        try {
                            const base64Content = await convertFileToBase64(file!);

                            const fieldMapping: Record<string, string> = {
                                suratSekda: 'surat_sekda',
                                daftarRiwayatHidup: 'daftar_riwayat_hidup',
                                portofolio: 'portofolio',
                                kartuKeluarga: 'kartu_keluarga',
                                sertifikatPDP: 'sertifikat_pdp',
                                sertifikatDiktatPIP: 'sertifikat_diktat_pip'
                            };

                            const backendFieldName = fieldMapping[key] || key;

                            const uploadData = {
                                field_name: backendFieldName,
                                file_name: file!.name,
                                base64_content: base64Content
                            };

                            return await axios.post(
                                `${UrlApi}/pendaftaran-dppi/${pendaftaranId}/upload/${backendFieldName}`,
                                uploadData,
                                {
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                        } catch (uploadError) {
                            console.error(`Error uploading ${key}:`, uploadError);
                            return null;
                        }
                    });

                // Tunggu semua upload selesai
                const uploadResults: any = await uploadDocumentsSequentially(pendaftaranId);
                const successfulUploads = uploadResults.filter((result: any) => result !== null);

                // Success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Submit Dokumen Berhasil!',
                    html: `
        <div class="text-left">
            <p><strong>DPPI Pusat</strong></p>
            <p>Berikut ini adalah Bukti Submit Dokumen Pengangkatan DPPI (Kabupaten)</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Kabupaten: <strong>${selectedKabupaten}</strong></li>
                <li>Nama PIC: <strong>${picData.nama}</strong></li>
                <li>ID Registrasi: <strong>${pendaftaranId}</strong></li>
                <li>Tanggal Submit: <strong>${new Date().toLocaleDateString('id-ID')}</strong></li>
            </ul>
            <p class="mt-3"><strong>Nama Calon Peserta:</strong></p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Ketua: <strong>${strukturData.ketua_1} ; ${strukturData.ketua_2}</strong></li>
                <li>Wakil Ketua: <strong>${strukturData.wakil_ketua_1} ; ${strukturData.wakil_ketua_2}</strong></li>
                <li>Sekretaris: <strong>${strukturData.sekretaris_1} ; ${strukturData.sekretaris_2}</strong></li>
                <li>Kepala Divisi Dukungan Pembentukan Paskibraka dan Purnapaskibraka Duta Pancasila: <strong>${strukturData.kepala_bidang_dukungan_1} ; ${strukturData.kepala_bidang_dukungan_2}</strong></li>
                <li>Kepala Divisi Peningkatan Kompetensi: <strong>${strukturData.kepala_bidang_kompetensi_1} ; ${strukturData.kepala_bidang_kompetensi_2}</strong></li>
                <li>Kepala Divisi Aktualisasi Nilai-Nilai Pancasila: <strong>${strukturData.kepala_bidang_aktualisasi_1} ; ${strukturData.kepala_bidang_aktualisasi_2}</strong></li>
                <li>Kepala Divisi Komunikasi, Teknologi dan Informasi: <strong>${strukturData.kepala_bidang_kominfo_1} ; ${strukturData.kepala_bidang_kominfo_2}</strong></li>
            </ul>
            <p class="mt-3 text-sm">✅ Mohon untuk simpan/screenshot/foto/print halaman ini, bukti submit juga telah dikirimkan ke email Anda.</p>
        </div>
    `,
                    confirmButtonText: 'Selesai',
                    confirmButtonColor: '#3085d6',
                    width: '800px',
                });

                // Reset form
                resetForm();

            } else {
                throw new Error("Invalid response from server");
            }

        } catch (error: any) {
            console.error("Error submitting form:", error);

            let errorMessage = "Gagal mengirim pendaftaran. Silakan coba lagi.";

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = "Data tidak valid. Harap periksa kembali.";
                } else if (error.response.status === 413) {
                    errorMessage = "File yang dikirimkan terlalu besar.";
                } else if (error.response.status === 409) {
                    errorMessage = "Pendaftaran untuk kabupaten ini sudah ada.";
                } else if (error.response.status === 500) {
                    errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
                }

                if (error.response.data && error.response.data.error) {
                    errorMessage += `\nDetail: ${error.response.data.error}`;
                }
            } else if (error.request) {
                errorMessage = "Tidak ada respon dari server. Periksa koneksi internet Anda.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim',
                text: errorMessage,
                confirmButtonText: 'Baik',
                confirmButtonColor: '#d33',
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function untuk convert file ke base64
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Validasi ukuran file sebelum proses
            if (file.size > 100 * 1024 * 1024) {
                reject(new Error("File terlalu besar (max 100MB)"));
                return;
            }

            const reader = new FileReader();

            // Tambahkan timeout
            const timeout = setTimeout(() => {
                reader.abort();
                reject(new Error("Timeout membaca file"));
            }, 30000); // 30 detik timeout

            reader.onload = () => {
                clearTimeout(timeout);
                try {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(base64String);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };

            reader.onabort = () => {
                clearTimeout(timeout);
                reject(new Error("Membaca file dibatalkan"));
            };

            reader.readAsDataURL(file);
        });
    };

    const uploadDocumentsSequentially = async (pendaftaranId: number) => {
        const documents = Object.entries(dokumen)
            .filter(([_, file]) => file !== null)
            .map(([key, file]) => ({ key, file: file! }));

        const uploadResults = [];

        for (const { key, file } of documents) {
            try {
                // Tambahkan delay antar upload
                await new Promise(resolve => setTimeout(resolve, 1000));

                const base64Content = await convertFileToBase64(file);

                const fieldMapping: Record<string, string> = {
                    suratSekda: 'surat_sekda',
                    daftarRiwayatHidup: 'daftar_riwayat_hidup',
                    portofolio: 'portofolio',
                    kartuKeluarga: 'kartu_keluarga',
                    sertifikatPDP: 'sertifikat_pdp',
                    sertifikatDiktatPIP: 'sertifikat_diktat_pip'
                };

                const backendFieldName = fieldMapping[key] || key;

                const uploadData = {
                    field_name: backendFieldName,
                    file_name: file.name,
                    base64_content: base64Content
                };

                const result = await axios.post(
                    `${UrlApi}/pendaftaran-dppi/${pendaftaranId}/upload/${backendFieldName}`,
                    uploadData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 300000 // 5 menit timeout
                    }
                );

                uploadResults.push(result);
                console.log(`File ${key} uploaded successfully`);

            } catch (uploadError: any) {
                console.error(`Error uploading ${key}:`, uploadError);

                // Tampilkan error spesifik
                let errorMessage = `Gagal mengupload ${key}`;
                if (uploadError.response?.data?.error) {
                    errorMessage += `: ${uploadError.response.data.error}`;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Upload Gagal',
                    text: errorMessage,
                    confirmButtonText: 'Baik',
                    confirmButtonColor: '#d33',
                });

                return null; // Stop jika ada error
            }
        }

        return uploadResults;
    };
    // Reset form setelah submit berhasil
    const resetForm = () => {
        setSelectedKabupaten("");
        setSelectedKabupatenId(null);
        setSearchKabupaten("");
        setPicData({
            nama: "",
            jabatan: "",
            nip: "",
            noTelp: "",
            email: ""
        });
        setStrukturData({
            ketua_1: "",
            ketua_2: "",
            wakil_ketua_1: "",
            wakil_ketua_2: "",
            sekretaris_1: "",
            sekretaris_2: "",
            kepala_bidang_dukungan_1: "",
            kepala_bidang_dukungan_2: "",
            kepala_bidang_kompetensi_1: "",
            kepala_bidang_kompetensi_2: "",
            kepala_bidang_aktualisasi_1: "",
            kepala_bidang_aktualisasi_2: "",
            kepala_bidang_kominfo_1: "",
            kepala_bidang_kominfo_2: "",
        });
        setDokumen({
            suratSekda: null,
            daftarRiwayatHidup: null,
            portofolio: null,
            kartuKeluarga: null,
            sertifikatPDP: null,
            sertifikatDiktatPIP: null,
        });
        setAgree(false);
        setCurrentStep(1);
        setStrukturErrors({});
        setPicErrors({});
    };

    const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPicData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validasi real-time
        checkPicField(name, value);
    };

    const handleStrukturChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStrukturData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validasi real-time
        checkStrukturField(name, value);
    };

    const handleFileChange = (fieldName: keyof typeof dokumen) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.includes('pdf')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Format File Tidak Valid',
                    text: 'Hanya file PDF yang diperbolehkan!',
                    confirmButtonText: 'Baik',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            // Check file size (10MB)
            if (file.size > 100 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Ukuran File Terlalu Besar',
                    text: 'Ukuran file tidak boleh lebih dari 100MB!',
                    confirmButtonText: 'Baik',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            setDokumen(prev => ({
                ...prev,
                [fieldName]: file
            }));
        }
    };

    const removeFile = (fieldName: keyof typeof dokumen) => {
        Swal.fire({
            title: 'Hapus File?',
            text: 'Apakah Anda yakin ingin menghapus file ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                setDokumen(prev => ({
                    ...prev,
                    [fieldName]: null
                }));

                Swal.fire({
                    icon: 'success',
                    title: 'File Dihapus',
                    text: 'File berhasil dihapus',
                    confirmButtonText: 'Baik',
                    confirmButtonColor: '#3085d6',
                });
            }
        });
    };

    const calculateProgress = () => {
        return (currentStep / 5) * 100;
    };

    const handleKabupatenSelect = (kab: any) => {
        setSelectedKabupaten(kab.nama_kabupaten);
        setSelectedKabupatenId(kab.id);
        setSearchKabupaten(kab.nama_kabupaten);
        setShowDropdown(false);
    };

    const clearKabupaten = () => {
        setSelectedKabupaten("");
        setSearchKabupaten("");
        setSelectedKabupatenId(null);
    };

    return (
        <div>
            <div className='mb-8 border-t-4 border-b-4 bg-primary border-secondary md:header'>
                <div className='mx-auto max-w-318.75 px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50 text-center'>
                            <span className="text-lg font-semibold">Form Kelengkapan Dokumen Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Kabupaten/Kota TA {new Date().getFullYear()}</span>
                        </div>
                    </ul>
                </div>
            </div>

            <div className='px-2 max-w-318.75 mb-8 mx-auto'>
                {/* Progress Indicator */}
                <p className="md:text-lg lg:text-xl mb-4 font-medium">
                    {currentStep === 1 && "Pilih Kabupaten – Step 1 of 5"}
                    {currentStep === 2 && "Data PIC – Step 2 of 5"}
                    {currentStep === 3 && "Nama Calon Peserta – Step 3 of 5"}
                    {currentStep === 4 && "Unggah Dokumen – Step 4 of 5"}
                    {currentStep === 5 && "Tinjau Ulang – Step 5 of 5"}
                </p>

                <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full bg-red-600 transition-all duration-500 ease-out"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>

                {/* Step 1: Pilih Kabupaten */}
                {currentStep === 1 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Kabupaten/Kota *
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Pilih Kabupaten/Kota"
                                        value={searchKabupaten}
                                        onChange={(e) => {
                                            setSearchKabupaten(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                    />
                                    {searchKabupaten && (
                                        <button
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 text-lg"
                                            onClick={clearKabupaten}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredKabupaten.length > 0 ? (
                                            filteredKabupaten.map((kab) => (
                                                <div
                                                    key={kab.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                                    onClick={() => handleKabupatenSelect(kab)}
                                                >
                                                    {kab.nama_kabupaten}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500">
                                                Tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedKabupaten && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Terpilih: <span className="font-semibold">{selectedKabupaten}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={handleNext}
                                disabled={!selectedKabupaten}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Data PIC */}
                {currentStep === 2 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Nama PIC *
                                </label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={picData.nama}
                                    onChange={handlePicChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${picErrors.nama
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                />
                                {picErrors.nama && (
                                    <p className="mt-1 text-sm text-red-600">{picErrors.nama}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Jabatan *
                                </label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={picData.jabatan}
                                    onChange={handlePicChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${picErrors.jabatan
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                />
                                {picErrors.jabatan && (
                                    <p className="mt-1 text-sm text-red-600">{picErrors.jabatan}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    NIP *
                                </label>
                                <input
                                    type="text"
                                    name="nip"
                                    minLength={18}
                                    maxLength={18}
                                    value={picData.nip}
                                    onChange={handlePicChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${picErrors.nip
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                />
                                {picErrors.nip && (
                                    <p className="mt-1 text-sm text-red-600">{picErrors.nip}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    No Telp (Whatsapp) *
                                </label>
                                <input
                                    type="tel"
                                    name="noTelp"
                                    value={picData.noTelp}
                                    onChange={handlePicChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${picErrors.noTelp
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                />
                                {picErrors.noTelp && (
                                    <p className="mt-1 text-sm text-red-600">{picErrors.noTelp}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={picData.email}
                                    onChange={handlePicChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${picErrors.email
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                />
                                {picErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{picErrors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                onClick={handleBack}
                            >
                                Kembali
                            </button>
                            <button
                                className={`px-6 py-2 text-white rounded-md ${Object.keys(picErrors).length > 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                onClick={handleNext}
                                disabled={Object.keys(picErrors).length > 0}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Struktur Organisasi */}
                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-6">Nama Calon Peserta</h3>
                        <div className="space-y-6">
                            {/* Ketua */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">Ketua</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Ketua 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="ketua_1"
                                            value={strukturData.ketua_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.ketua_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.ketua_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.ketua_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Ketua 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="ketua_2"
                                            value={strukturData.ketua_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.ketua_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.ketua_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.ketua_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Wakil Ketua */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">Wakil Ketua</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Wakil Ketua 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="wakil_ketua_1"
                                            value={strukturData.wakil_ketua_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.wakil_ketua_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.wakil_ketua_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.wakil_ketua_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Wakil Ketua 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="wakil_ketua_2"
                                            value={strukturData.wakil_ketua_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.wakil_ketua_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.wakil_ketua_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.wakil_ketua_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sekretaris */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">Sekretaris</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Sekretaris 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="sekretaris_1"
                                            value={strukturData.sekretaris_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.sekretaris_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.sekretaris_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.sekretaris_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Sekretaris 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="sekretaris_2"
                                            value={strukturData.sekretaris_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.sekretaris_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.sekretaris_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.sekretaris_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Bidang Dukungan */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">
                                    Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_dukungan_1"
                                            value={strukturData.kepala_bidang_dukungan_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_dukungan_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_dukungan_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_dukungan_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_dukungan_2"
                                            value={strukturData.kepala_bidang_dukungan_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_dukungan_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_dukungan_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_dukungan_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Bidang Kompetensi */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">
                                    Kepala Bidang Peningkatan Kompetensi
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Peningkatan Kompetensi 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_kompetensi_1"
                                            value={strukturData.kepala_bidang_kompetensi_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_kompetensi_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_kompetensi_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_kompetensi_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Peningkatan Kompetensi 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_kompetensi_2"
                                            value={strukturData.kepala_bidang_kompetensi_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_kompetensi_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_kompetensi_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_kompetensi_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Bidang Aktualisasi */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">
                                    Kepala Bidang Aktualisasi Nilai-nilai Pancasila
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Aktualisasi Nilai-nilai Pancasila 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_aktualisasi_1"
                                            value={strukturData.kepala_bidang_aktualisasi_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_aktualisasi_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_aktualisasi_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_aktualisasi_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Aktualisasi Nilai-nilai Pancasila 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_aktualisasi_2"
                                            value={strukturData.kepala_bidang_aktualisasi_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_aktualisasi_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_aktualisasi_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_aktualisasi_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Bidang Kominfo */}
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-800 mb-4">
                                    Kepala Bidang Komunikasi, Teknologi dan Informasi
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Komunikasi, Teknologi dan Informasi 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_kominfo_1"
                                            value={strukturData.kepala_bidang_kominfo_1}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_kominfo_1
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_kominfo_1 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_kominfo_1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Bidang Komunikasi, Teknologi dan Informasi 2 *
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_bidang_kominfo_2"
                                            value={strukturData.kepala_bidang_kominfo_2}
                                            onChange={handleStrukturChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${strukturErrors.kepala_bidang_kominfo_2
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-red-500'
                                                }`}
                                        />
                                        {strukturErrors.kepala_bidang_kominfo_2 && (
                                            <p className="mt-1 text-sm text-red-600">{strukturErrors.kepala_bidang_kominfo_2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                onClick={handleBack}
                            >
                                Kembali
                            </button>
                            <button
                                className={`px-6 py-2 text-white rounded-md ${Object.keys(strukturErrors).length > 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                onClick={handleNext}
                                disabled={Object.keys(strukturErrors).length > 0}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Upload Dokumen */}
                {currentStep === 4 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">Format File</h4>
                            <p className="text-sm text-blue-700 mb-2">
                                File yang diunggah harus berformat PDF. Pastikan file yang akan diupload memiliki ekstensi .pdf, karena format lain tidak akan diterima.
                            </p>
                            <h4 className="font-semibold text-blue-800 mb-2">Ukuran File</h4>
                            <p className="text-sm text-blue-700">
                                Ukuran file yang diunggah tidak boleh melebihi 10MB. Jika file Anda lebih besar dari batas ini, silakan lakukan kompresi atau pengurangan ukuran file agar sesuai dengan ketentuan.
                            </p>
                        </div>


                        <div className="space-y-6">
                            {/* Surat Sekretaris Daerah */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Surat Sekretaris Daerah Kabupaten/Kota kepada Kepala BPIP melalui Deputi Diktat *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="suratSekda"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('suratSekda')}
                                        required
                                    />
                                    <label htmlFor="suratSekda" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.suratSekda && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.suratSekda.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('suratSekda')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Daftar Riwayat Hidup */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Daftar Riwayat Hidup *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="daftarRiwayatHidup"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('daftarRiwayatHidup')}
                                        required
                                    />
                                    <label htmlFor="daftarRiwayatHidup" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.daftarRiwayatHidup && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.daftarRiwayatHidup.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('daftarRiwayatHidup')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Portofolio */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Portofolio *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="portofolio"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('portofolio')}
                                        required
                                    />
                                    <label htmlFor="portofolio" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.portofolio && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.portofolio.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('portofolio')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Kartu Keluarga */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Fotokopi Kartu Keluarga *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="kartuKeluarga"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('kartuKeluarga')}
                                        required
                                    />
                                    <label htmlFor="kartuKeluarga" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.kartuKeluarga && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.kartuKeluarga.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('kartuKeluarga')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sertifikat PDP */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Fotokopi Sertifikat sebagai PDP
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="sertifikatPDP"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('sertifikatPDP')}
                                    />
                                    <label htmlFor="sertifikatPDP" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.sertifikatPDP && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.sertifikatPDP.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('sertifikatPDP')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sertifikat Diktat PIP */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Fotokopi piagam/surat keterangan telah mengikuti diktat PIP
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="sertifikatDiktatPIP"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('sertifikatDiktatPIP')}
                                    />
                                    <label htmlFor="sertifikatDiktatPIP" className="cursor-pointer">
                                        <div className="text-gray-600 mb-2">
                                            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Click or drag a file to this area to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
                                    </label>
                                </div>
                                {dokumen.sertifikatDiktatPIP && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-700">{dokumen.sertifikatDiktatPIP.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile('sertifikatDiktatPIP')}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            × Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                onClick={handleBack}
                            >
                                Kembali
                            </button>
                            <button
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={handleNext}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Tinjau Ulang */}
                {currentStep === 5 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Tinjau Ulang Data Anda</h3>

                            <div className="space-y-4 mb-6">
                                <div className="border-b pb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Kabupaten/Kota</h4>
                                    <p className="text-gray-600">{selectedKabupaten}</p>
                                </div>

                                <div className="border-b pb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Data PIC</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-600">Nama:</span> {picData.nama}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jabatan:</span> {picData.jabatan}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">NIP:</span> {picData.nip}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">No Telp:</span> {picData.noTelp}
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-gray-600">Email:</span> {picData.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-b pb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Struktur Organisasi</h4>
                                    <div className="space-y-3">
                                        <div><span className="text-gray-600">Ketua 1:</span> {strukturData.ketua_1}</div>
                                        <div><span className="text-gray-600">Ketua 2:</span> {strukturData.ketua_2}</div>
                                        <div><span className="text-gray-600">Wakil Ketua 1:</span> {strukturData.wakil_ketua_1}</div>
                                        <div><span className="text-gray-600">Wakil Ketua 2:</span> {strukturData.wakil_ketua_2}</div>
                                        <div><span className="text-gray-600">Sekretaris 1:</span> {strukturData.sekretaris_1}</div>
                                        <div><span className="text-gray-600">Sekretaris 2:</span> {strukturData.sekretaris_2}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila
                                            1:</span> {strukturData.kepala_bidang_dukungan_1}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Kepala Bidang Dukungan Pembentukan Paskibraka dan Duta Pancasila
                                            2:</span> {strukturData.kepala_bidang_dukungan_2}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Peningkatan Kompetensi 1:</span> {strukturData.kepala_bidang_kompetensi_1}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Peningkatan Kompetensi 2:</span> {strukturData.kepala_bidang_kompetensi_2}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Aktualisasi Nilai-nilai Pancasila 1:</span> {strukturData.kepala_bidang_aktualisasi_1}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Aktualisasi Nilai-nilai Pancasila 2:</span> {strukturData.kepala_bidang_aktualisasi_2}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Komunikasi, Teknologi dan Informasi 1:</span> {strukturData.kepala_bidang_kominfo_1}</div>
                                        <div><span className="text-gray-600">Kepala Bidang Komunikasi, Teknologi dan Informasi 2:</span> {strukturData.kepala_bidang_kominfo_2}</div>

                                    </div>
                                </div>

                                <div className="border-b pb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Dokumen yang Diunggah</h4>
                                    <ul className="list-disc pl-5 text-gray-600">
                                        {dokumen.suratSekda && <li>Surat Sekretaris Daerah: {dokumen.suratSekda.name}</li>}
                                        {dokumen.daftarRiwayatHidup && <li>Daftar Riwayat Hidup: {dokumen.daftarRiwayatHidup.name}</li>}
                                        {dokumen.portofolio && <li>Portofolio: {dokumen.portofolio.name}</li>}
                                        {dokumen.kartuKeluarga && <li>Kartu Keluarga: {dokumen.kartuKeluarga.name}</li>}
                                        {dokumen.sertifikatPDP && <li>Sertifikat PDP: {dokumen.sertifikatPDP.name}</li>}
                                        {dokumen.sertifikatDiktatPIP && <li>Sertifikat Diktat PIP: {dokumen.sertifikatDiktatPIP.name}</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Persetujuan */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id="agree"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                        className="mt-1 mr-3 h-5 w-5 text-red-600"
                                    />
                                    <label htmlFor="agree" className="text-gray-700">
                                        <span className="font-medium">Setuju *</span>
                                        <p className="mt-2 text-sm">
                                            Dengan ini Saya menyatakan dengan sesungguhnya bahwa semua data yang Saya input serta lampiran-lampirannya ini adalah benar dan kesatuan yang tidak dapat dipisahkan.
                                            Apabila dikemudian hari diketemukan dan/atau dibuktikan adanya penipuan/pemalsuan/kesalahan data yang disebabkan oleh pengisian data yang tidak sesuai atas data yang Saya lampirkan, maka Saya bersedia dikenakan sanksi sesuai ketentuan peraturan perundang-undangan yang berlaku.
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                onClick={handleBack}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </button>
                            <button
                                className={`px-6 py-2 rounded-md flex items-center justify-center ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                onClick={handleSubmit}
                                disabled={!agree || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}