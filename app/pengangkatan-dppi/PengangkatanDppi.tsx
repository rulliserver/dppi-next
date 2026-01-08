'use client'

import { useState, useEffect, useRef } from "react";
import { UrlApi } from "../components/apiUrl";
import axios from "axios";

export default function PengangkatanDppi() {
    const [currentStep, setCurrentStep] = useState(1);
    const [provinsi, setProvinsi] = useState<any[]>([]);
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

        // Kepala Divisi (masing-masing 2 orang)
        kepala_divisi_dukungan_1: "",
        kepala_divisi_dukungan_2: "",
        kepala_divisi_kompetensi_1: "",
        kepala_divisi_kompetensi_2: "",
        kepala_divisi_aktualisasi_1: "",
        kepala_divisi_aktualisasi_2: "",
        kepala_divisi_kominfo_1: "",
        kepala_divisi_kominfo_2: "",
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
    // Tambah state ini bersama state lainnya
    const [selectedKabupatenId, setSelectedKabupatenId] = useState<number | null>(null);


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
            });
    };

    const handleNext = () => {
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
            alert("Anda harus menyetujui persyaratan terlebih dahulu!");
            return;
        }

        // Validasi required fields
        if (!selectedKabupaten || !selectedKabupatenId) {
            alert("Harap pilih Kabupaten/Kota terlebih dahulu!");
            return;
        }

        if (!picData.nama || !picData.jabatan || !picData.nip || !picData.noTelp || !picData.email) {
            alert("Harap lengkapi semua data PIC yang wajib diisi!");
            return;
        }

        // Validasi dokumen wajib
        const requiredDocuments = ['suratSekda', 'daftarRiwayatHidup', 'portofolio', 'kartuKeluarga'];
        const missingDocuments = requiredDocuments.filter(doc => !dokumen[doc as keyof typeof dokumen]);

        if (missingDocuments.length > 0) {
            alert(`Dokumen wajib berikut belum diunggah: ${missingDocuments.join(', ')}`);
            return;
        }

        try {
            setIsSubmitting(true);

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
                kepala_divisi_dukungan_1: strukturData.kepala_divisi_dukungan_1,
                kepala_divisi_dukungan_2: strukturData.kepala_divisi_dukungan_2,
                kepala_divisi_kompetensi_1: strukturData.kepala_divisi_kompetensi_1,
                kepala_divisi_kompetensi_2: strukturData.kepala_divisi_kompetensi_2,
                kepala_divisi_aktualisasi_1: strukturData.kepala_divisi_aktualisasi_1,
                kepala_divisi_aktualisasi_2: strukturData.kepala_divisi_aktualisasi_2,
                kepala_divisi_kominfo_1: strukturData.kepala_divisi_kominfo_1,
                kepala_divisi_kominfo_2: strukturData.kepala_divisi_kominfo_2,
            };

            console.log("Mengirim data pendaftaran:", pendaftaranData);

            // 2. Kirim data pendaftaran ke backend
            const response = await axios.post(`${UrlApi}/pendaftaran-dppi-provinsi`, pendaftaranData, {
                headers: {
                    'Content-Type': 'application/json',

                }
            });

            if (response.data && response.data.id) {
                const pendaftaranId = response.data.id;

                // 3. Upload dokumen satu per satu
                const uploadPromises = Object.entries(dokumen).map(async ([key, file]) => {
                    if (!file) return null;

                    try {
                        // Convert file to base64
                        const base64Content = await convertFileToBase64(file);

                        // Map field name dari frontend ke backend
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

                        console.log(`Uploading ${backendFieldName}...`);

                        return await axios.post(
                            `${UrlApi}/pendaftaran-dppi-provinsi/${pendaftaranId}/upload/${backendFieldName}`,
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
                const uploadResults = await Promise.all(uploadPromises);
                const successfulUploads = uploadResults.filter(result => result !== null);

                console.log(`${successfulUploads.length} dokumen berhasil diupload`);

                // 4. Beri feedback ke user
                alert(`✅ Pendaftaran berhasil disubmit!\nID Pendaftaran: ${pendaftaranId}\n${successfulUploads.length} dokumen berhasil diupload.`);

                // 5. Reset form atau redirect
                resetForm();

                // Atau redirect ke halaman sukses
                // window.location.href = `/success?id=${pendaftaranId}`;

            } else {
                throw new Error("Invalid response from server");
            }

        } catch (error: any) {
            console.error("Error submitting form:", error);

            let errorMessage = "Gagal mengirim pendaftaran. Silakan coba lagi.";

            if (error.response) {
                // Server responded with error status
                if (error.response.status === 400) {
                    errorMessage = "Data tidak valid. Harap periksa kembali.";
                } else if (error.response.status === 401) {
                    errorMessage = "Anda harus login terlebih dahulu.";
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

            alert(`❌ ${errorMessage}`);

        } finally {
            setIsSubmitting(false);

        }
    };

    // Helper function untuk convert file ke base64
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Hapus prefix "data:application/pdf;base64,"
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
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
            kepala_divisi_dukungan_1: "",
            kepala_divisi_dukungan_2: "",
            kepala_divisi_kompetensi_1: "",
            kepala_divisi_kompetensi_2: "",
            kepala_divisi_aktualisasi_1: "",
            kepala_divisi_aktualisasi_2: "",
            kepala_divisi_kominfo_1: "",
            kepala_divisi_kominfo_2: "",
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
    };

    // Tambahkan state untuk loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPicData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStrukturChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStrukturData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (fieldName: keyof typeof dokumen) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.includes('pdf')) {
                alert("Hanya file PDF yang diperbolehkan!");
                return;
            }

            // Check file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("Ukuran file tidak boleh lebih dari 10MB!");
                return;
            }

            setDokumen(prev => ({
                ...prev,
                [fieldName]: file
            }));
        }
    };

    const removeFile = (fieldName: keyof typeof dokumen) => {
        setDokumen(prev => ({
            ...prev,
            [fieldName]: null
        }));
    };

    const calculateProgress = () => {
        return (currentStep / 5) * 100;
    };

    const handleKabupatenSelect = (kab: any) => {
        setSelectedKabupaten(kab.nama_kabupaten);
        setSelectedKabupatenId(kab.id); // Simpan ID
        setSearchKabupaten(kab.nama_kabupaten);
        setShowDropdown(false);
    };

    const clearKabupaten = () => {
        setSelectedKabupaten("");
        setSearchKabupaten("");
    };

    return (
        <div>
            <div className='mb-8 border-t-4 border-b-4 bg-primary border-secondary md:header'>
                <div className='mx-auto max-w-318.75 px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50 text-center'>
                            <span className="text-lg font-semibold">Form Kelengkapan Dokumen Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Kabupaten/Kota 2026</span>
                        </div>
                    </ul>
                </div>
            </div>

            <div className='px-2 max-w-318.75 mb-8 mx-auto'>
                {/* Progress Indicator */}
                <p className="md:text-lg lg:text-xl mb-4 font-medium">
                    {currentStep === 1 && "Pilih Kota/Kabupaten – Step 1 of 5"}
                    {currentStep === 2 && "Data PIC – Step 2 of 5"}
                    {currentStep === 3 && "Nama Galon Peserta – Step 3 of 5"}
                    {currentStep === 4 && "Unggah Dokumen – Step 4 of 5"}
                    {currentStep === 5 && "Tinjau Ulang – Step 5 of 5"}
                </p>

                <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full bg-red-600 transition-all duration-500 ease-out"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>

                {/* Step 1: Pilih Kabupaten/Kota */}
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    NIP *
                                </label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={picData.nip}
                                    onChange={handlePicChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
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

                {currentStep === 3 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-6">Nama Calon Peserta</h3>
                        <div className="space-y-6">
                            {/* Ketua */}
                            <div className="border-b pb-4">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Ketua
                                        </label>
                                        <input
                                            type="text"
                                            name="ketua_1"
                                            value={strukturData.ketua_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Ketua
                                        </label>
                                        <input
                                            type="text"
                                            name="ketua_2"
                                            value={strukturData.ketua_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Wakil Ketua */}
                            <div className="border-b pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Wakil Ketua
                                        </label>
                                        <input
                                            type="text"
                                            name="wakil_ketua_1"
                                            value={strukturData.wakil_ketua_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Wakil Ketua
                                        </label>
                                        <input
                                            type="text"
                                            name="wakil_ketua_2"
                                            value={strukturData.wakil_ketua_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sekretaris */}
                            <div className="border-b pb-4">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Sekretaris
                                        </label>
                                        <input
                                            type="text"
                                            name="sekretaris_1"
                                            value={strukturData.sekretaris_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Sekretaris
                                        </label>
                                        <input
                                            type="text"
                                            name="sekretaris_2"
                                            value={strukturData.sekretaris_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Divisi Dukungan */}
                            <div className="border-b pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Dukungan Pembentukan Paskibraka dan Duta Pancasila
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_dukungan_1"
                                            value={strukturData.kepala_divisi_dukungan_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Dukungan Pembentukan Paskibraka dan Duta Pancasila
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_dukungan_2"
                                            value={strukturData.kepala_divisi_dukungan_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Divisi Kompetensi */}
                            <div className="border-b pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Peningkatan Kompetensi
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_kompetensi_1"
                                            value={strukturData.kepala_divisi_kompetensi_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Peningkatan Kompetensi
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_kompetensi_2"
                                            value={strukturData.kepala_divisi_kompetensi_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Divisi Aktualisasi */}
                            <div className="border-b pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Aktualisasi Nilai-nilai Pancasila
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_aktualisasi_1"
                                            value={strukturData.kepala_divisi_aktualisasi_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Aktualisasi Nilai-nilai Pancasila
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_aktualisasi_2"
                                            value={strukturData.kepala_divisi_aktualisasi_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Divisi Kominfo */}
                            <div className="border-b pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Komunikasi, Teknologi dan Informasi
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_kominfo_1"
                                            value={strukturData.kepala_divisi_kominfo_1}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Kepala Divisi Komunikasi, Teknologi dan Informasi
                                        </label>
                                        <input
                                            type="text"
                                            name="kepala_divisi_kominfo_2"
                                            value={strukturData.kepala_divisi_kominfo_2}
                                            onChange={handleStrukturChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
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
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={handleNext}
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
                                    Surat Sekretaris Daerah Provinsi, Kabupaten/Kota kepada Kepala BPIP melalui Deputi Diktat *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                                    <input
                                        type="file"
                                        id="suratSekda"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange('suratSekda')}
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
                                    />
                                    <label htmlFor="daftarRiwayatHidup" className="cursor-pointer">
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
                                    />
                                    <label htmlFor="portofolio" className="cursor-pointer">
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
                                    />
                                    <label htmlFor="kartuKeluarga" className="cursor-pointer">
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