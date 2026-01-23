//app/component/SuratRekomendasi.tsx

import FormatLongDate from '@/app/components/FormatLongDate';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

export default function SuratRekomendasi(data: any) {
    const styles = StyleSheet.create({
        page: { flexDirection: 'row', backgroundColor: '#E4E4E4' },
        section: { margin: 10, padding: 10, flexGrow: 1 },
        kopSurat: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* logo kiri */}
                <View style={{ position: 'absolute', top: 20, left: 20 }}>
                    <img src={'assets/images/logo-bpip.png'} alt="Logo BPIP" width={60} height={60} />
                </View>
                <View style={styles.kopSurat}>
                    <Text style={{ fontWeight: "bold" }}>BADAN PEMBINAAN IDEOLOGI PANCASILA</Text>
                    <Text>DEPUTI BIDANG PENDIDIKAN DAN PELATIHAN</Text>
                    <Text>Jalan Veteran III No. 2 Jakarta 10110 Telepon (021) 3505200</Text>
                    <Text>Situs Web: https://bpip.go.id Alamat surel: persuratan@bpip.go.id</Text>
                    {/* //line */}
                    <View style={{ borderBottom: '2px solid black', marginTop: 5 }}></View>
                </View>
                <View style={{ marginTop: 100, marginLeft: 20, marginRight: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>{data.nomorSurat}</Text>
                    <Text style={{ textAlign: 'right' }}>Jakarta, {FormatLongDate(Date.now())}</Text>
                </View>

                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'column', }}>
                    <Text style={{ width: '10%' }}>Sifat</Text>
                    <Text style={{ width: '1%' }}>: </Text>
                    <Text style={{ width: '40%' }}>Biasa</Text>
                </View>
                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'column', }}>
                    <Text style={{ width: '10%' }}>Lampiran</Text>
                    <Text style={{ width: '1%' }}>: </Text>
                    <Text style={{ width: '40%' }}>-</Text>
                </View>
                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'column', }}>
                    <Text style={{ width: '10%' }}>Perihal</Text>
                    <Text style={{ width: '1%' }}>: </Text>
                    <Text style={{ width: '40%' }}>Penyampaian 7 (tujuh) Nama Pelaksana Duta Pancaslla Pasklbraka Indonesia (DPPI) {data.daerah} Perlode {new Date().getFullYear()} s.d. {new Date().getFullYear() + 5}</Text>
                </View>
                <View>
                    <Text>Yth. Sekretaris Daerah {data.daerah}</Text>
                    <Text>di -</Text>
                    <Text style={{ marginLeft: 60 }}>{data.daerah}</Text>
                </View>
                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'column', }}></View>
                <Text>Menindaklanjuti Registrasi Pengangkatan Pertama Kali Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat {data.daerah} pada portal dppi.bpip.go.id tanggal {FormatLongDate(data.created_at)},
                    dengan ini kami sampaikan 7 (tujuh) Nama Pelaksana DPPI {data.daerah} Periode {new Date().getFullYear()} s.d. {new Date().getFullYear() + 5} sebagal berikut:</Text>
                {/* tabel nama pelaksana dppi dengan kolom no, jabatan, dan nama pelaksana */}
                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'row', border: '1px solid black' }}></View>
                <View style={{ width: '10%', borderRight: '1px solid black', padding: 5 }}>
                    <Text>No</Text>
                </View>
                <View style={{ width: '30%', borderRight: '1px solid black', padding: 5 }}>
                    <Text>Jabatan</Text>
                </View>
                <View style={{ width: '60%', padding: 5 }}>
                    <Text>Nama Pelaksana DPPI</Text>
                </View>
                {/* //loop data.pelaksanaDppi to fill the table */}
                {data.pelaksanaDppi.map((pelaksana: any, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', border: '1px solid black' }}>
                        <View style={{ width: '10%', borderRight: '1px solid black', padding: 5 }}>
                            <Text>{index + 1}</Text>
                        </View>
                        <View style={{ width: '30%', borderRight: '1px solid black', padding: 5 }}>
                            <Text>{pelaksana.jabatan}</Text>
                        </View>
                        <View style={{ width: '60%', padding: 5 }}>
                            <Text>{pelaksana.nama}</Text>
                        </View>
                    </View>
                ))}

                <View style={{ marginTop: 20, marginLeft: 20, marginRight: 20, flexDirection: 'column', }}>
                    <Text>Selanjutnya, berdasarkan diktum KEDUA Keputusan Kepala BPIP Nomor 50 Tahun 2024 tentang Tata Cara Pengangkatan Pertama Kall Pelaksana Duta Pancasila Paskibraka Indonesia Tingkat Provinsi! dan Tingkat Kabupaten/Kota. disebutkan bahwa:

                    </Text>
                    <view style={{ marginLeft: 20, marginTop: 10, flexDirection: 'column', }}>
                        <Text>1.	Pelaksana DPPI Tingkat Daerah yang telah ditetapkan oleh Kepala BPIP sebagal mana dimaksud dalam diktum KESATU Keputusan Kepala BPIP, selanjutnya diangkat oleh Kepala Daerah; dan</Text>
                        <Text>2.	Pengangkatan Pelaksana DPPI Tingkat Daerah sebagaimana dimaksud pada diktum PERTAMA huruf a dilakukan paling lambat 30 (tiga puluh) hari kerja sejak surat persetujuan diterima oleh Kepala Daerah.</Text>
                    </view>
                    <Text>Demikian surat rekomendasi ini kami sampaikan, atas perhatian dan kerjasama Saudara kami ucapkan terima kasih.</Text>
                </View>
                <View style={{ marginTop: 40, marginLeft: 300, flexDirection: 'column', }}>
                    <Text>Deputi Bidang Pendidikan dan Pelatihan</Text>
                    <Text style={{ marginTop: 60 }}>{data.penandatangan}</Text>
                    <Text>{data.jabatan_penandatangan}</Text>
                </View>
                <View style={{ marginTop: 40, marginLeft: 20, flexDirection: 'column', }}>
                    <Text>Tembusan Yth.</Text>
                    <Text>1.	Kepala BPIP; dan</Text>
                    <Text>2.	Wakil Kepala BPIP</Text>
                </View>
            </Page>
        </Document>
    );
}
