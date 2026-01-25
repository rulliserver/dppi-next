// app/component/SuratRekomendasi.tsx

import FormatLongDate from '@/app/components/FormatLongDate';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image
} from '@react-pdf/renderer';

// Definisikan styles di luar komponen
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        borderBottomStyle: 'solid',
    },
    logo: {
        width: 60,
        height: 60,
    },
    kopSurat: {
        flex: 1,
        marginLeft: 20,
    },
    institution: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 2,
    },
    department: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 2,
    },
    address: {
        textAlign: 'center',
        fontSize: 12,
    },
    suratInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sifatLampiran: {
        flexDirection: 'row',
    },
    label: {
        width: 60,
        fontWeight: 'bold',
    },
    content: {
        marginTop: 30,
        textAlign: 'justify',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tableCell: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    cellNo: {
        width: '10%',
    },
    cellJabatan: {
        width: '30%',
    },
    cellNama: {
        width: '60%',
    },
    tandaTangan: {
        marginTop: 60,
        marginLeft: 350,
        textAlign: 'center',
    },
    penandatangan: {
        marginTop: 80,
        fontWeight: 'bold',
    },
    tembusan: {
        marginTop: 50,
    },
});

export default function SuratRekomendasi({ data }: any) {
    const daerah = `${data.nama_kabupaten}`;
    const currentYear = new Date().getFullYear();
    const pelaksanaDppi = data.pelaksanaDppi;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header dengan logo */}
                <View style={styles.header}>
                    <Image
                        src="/assets/images/logo-bpip.png"
                        style={styles.logo}
                    />
                    <View style={styles.kopSurat}>
                        <Text style={styles.institution}>
                            BADAN PEMBINAAN IDEOLOGI PANCASILA
                        </Text>
                        <Text style={styles.department}>
                            DEPUTI BIDANG PENDIDIKAN DAN PELATIHAN
                        </Text>
                        <Text style={styles.address}>
                            Jalan Veteran III No. 2 Jakarta 10110 Telepon (021) 3505200
                        </Text>
                        <Text style={styles.address}>
                            Situs Web: https://bpip.go.id Alamat surel: persuratan@bpip.go.id
                        </Text>
                    </View>
                </View>

                {/* Informasi Surat */}
                <View style={styles.suratInfo}>
                    <Text>{data.no_surat || 'Nomor: -'}</Text>
                    <Text>Jakarta, {FormatLongDate(Date.now())}</Text>
                </View>

                {/* Sifat, Lampiran, Perihal */}
                <View style={styles.sifatLampiran}>
                    <Text style={styles.label}>Sifat</Text>
                    <Text>: Biasa</Text>
                </View>

                <View style={styles.sifatLampiran}>
                    <Text style={styles.label}>Lampiran</Text>
                    <Text>: -</Text>
                </View>

                <View style={styles.sifatLampiran}>
                    <Text style={styles.label}>Perihal</Text>
                    <Text> : Penyampaian 7 (tujuh) Nama Pelaksana </Text>
                </View>
                <View>

                    <Text style={{ marginLeft: 66 }}>Duta Pancasila Paskibraka Indonesia (DPPI) </Text>
                    <Text style={{ marginLeft: 66 }}>{daerah} Periode {currentYear} s.d. {currentYear + 4}</Text>
                </View>

                {/* Tujuan Surat */}
                <View style={{ marginTop: 2 }}>
                    <Text>Yth. Sekretaris Daerah {data.nama_kabupaten}</Text>
                    <Text>di -</Text>
                    <Text style={{ marginLeft: 20 }}>{daerah}</Text>
                </View>

                {/* Isi Surat */}
                <View style={styles.content}>
                    <Text>
                        Menindaklanjuti Registrasi Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat {daerah} pada portal dppi.bpip.go.id tanggal {FormatLongDate(data.created_at)}, dengan ini kami sampaikan 7 (tujuh) Nama Pelaksana DPPI {daerah} Periode {currentYear} s.d. {currentYear + 5} sebagai berikut:
                    </Text>
                </View>

                {/* Tabel Pelaksana DPPI */}
                <View style={styles.table}>
                    {/* Header Table */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.cellNo]}>
                            <Text>No</Text>
                        </View>
                        <View style={[styles.tableCell, styles.cellJabatan]}>
                            <Text>Jabatan</Text>
                        </View>
                        <View style={[styles.tableCell, styles.cellNama]}>
                            <Text>Nama Pelaksana DPPI</Text>
                        </View>
                    </View>

                    {/* Data Table */}
                    {pelaksanaDppi.map((pelaksana: any, index: any) => (
                        <View key={pelaksana.id} style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.cellNo]}>
                                <Text>{index + 1}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.cellJabatan]}>
                                <Text>{pelaksana.jabatan}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.cellNama]}>
                                <Text>{pelaksana.nama}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Lanjutan Isi Surat */}
                <View style={styles.content}>
                    <Text>
                        Selanjutnya, berdasarkan diktum KEDUA Keputusan Kepala BPIP Nomor 50 Tahun 2024 tentang Tata Cara Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Provinsi dan Tingkat Kabupaten/Kota, disebutkan bahwa:
                    </Text>

                    <View style={{ marginLeft: 20, marginTop: 10 }}>
                        <Text>1. Pelaksana DPPI Tingkat Daerah yang telah ditetapkan oleh Kepala BPIP sebagaimana dimaksud dalam diktum KESATU Keputusan Kepala BPali, selanjutnya diangkat oleh Kepala Daerah; dan</Text>
                        <Text>2. Pengangkatan Pelaksana DPPI Tingkat Daerah sebagaimana dimaksud pada diktum PERTAMA huruf a dilakukan paling lambat 30 (tiga puluh) hari kerja sejak surat persetujuan diterima oleh Kepala Daerah.</Text>
                    </View>

                    <Text style={{ marginTop: 20 }}>
                        Demikian surat rekomendasi ini kami sampaikan, atas perhatian dan kerjasama Saudara kami ucapkan terima kasih.
                    </Text>
                </View>

                {/* Tanda Tangan */}
                <View style={styles.tandaTangan}>
                    <Text>Deputi Bidang Pendidikan dan Pelatihan</Text>
                    <Text style={styles.penandatangan}>
                        {data.penandatangan || 'Dr. Ir. Baby Poernomo, M.Si.'}
                    </Text>
                    <Text>NIP. 19650803 199203 1 001</Text>
                </View>

                {/* Tembusan */}
                <View style={styles.tembusan}>
                    <Text style={{ fontWeight: 'bold' }}>Tembusan Yth:</Text>
                    <Text>1. Kepala BPIP; dan</Text>
                    <Text>2. Wakil Kepala BPIP</Text>
                </View>
            </Page>
        </Document>
    );
}