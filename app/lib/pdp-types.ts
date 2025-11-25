// lib/pdp-types.ts
export type PdpData = {
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

    id_hobi?: string | null;
    detail_bakat?: string | null;
};

export type PendidikanItem = {
    nama_instansi_pendidikan: string;
    jurusan?: string | null;
    tahun_masuk?: string | number | null;
    tahun_lulus?: string | number | null;
};

export type OrganisasiItem = {
    posisi?: string | null;
    nama_organisasi?: string | null;
    tahun_masuk?: string | number | null;
    tahun_keluar?: string | number | null;
    status?: string | null; // 'Masih Aktif' | ...
};
