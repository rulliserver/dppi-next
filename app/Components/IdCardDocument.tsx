// components/IdCardDocument.tsx
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
} from '@react-pdf/renderer';

// ==== Types ====
export interface PdpDataLike {
    id?: number | string;
    no_simental?: string | null;
    nama_lengkap?: string | null;
    tempat_lahir?: string | null;
    tgl_lahir?: string | null;
    alamat?: string | null;
    tingkat_penugasan?: string | null;
    kabupaten?: string | null;
    provinsi?: string | null;
    photo?: string | null;
}

export interface IdCardDocProps {
    pdp: any;
    ketum: { nama_lengkap?: string } | null;
    photo: string | null;
    bg: string | null;
    logoLeft: string | null;
    logoRight: string | null;
    cap: string | null;
    ttd: string | null;
    qr: string;
    printedAt: string;
}

// ==== Constants ====
// Ukuran ID Card dalam points (1mm = 2.83465 points untuk presisi)
const CARD_WIDTH = 85.60 * 2.83465;
const CARD_HEIGHT = 53.98 * 2.83465;

// ==== Styles ====
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: 'relative',
        border: '0.5 solid #CCCCCC',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    // FRONT SIDE STYLES
    frontHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: CARD_HEIGHT * 0.28,
        backgroundColor: '#7F1D1D', // red-800
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    frontContent: {
        position: 'absolute',
        top: CARD_HEIGHT * 0.28,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 8,
    },
    logo: {
        width: 35,
        height: 35,
    },
    headerText: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 4,
    },
    bigTitle: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    subTitle: {
        fontSize: 6,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 1,
        fontWeight: 'bold',
    },
    address: {
        fontSize: 5,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    bodyRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    photoSection: {
        width: 60,
        alignItems: 'center',
        marginRight: 8,
    },
    avatar: {
        width: 50,
        height: 65,
        objectFit: 'contain', 
        marginBottom: 4,
        backgroundColor: '#fff',
    },

    printDate: {
        fontSize: 6,
        textAlign: 'center',
        color: '#000000',
        lineHeight: 1.2,
    },
    infoSection: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    label: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#000000',
        width: 45,
    },
    colon: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#000000',
        width: 8,
    },
    value: {
        fontSize: 7,
        color: '#000000',
        flex: 1,
    },
    qrCode: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 30,
        height: 30,
    },

    // BACK SIDE STYLES
    backHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 15,
        backgroundColor: '#7F1D1D',
    },
    backContent: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 10,
    },
    termsList: {
        fontSize: 6,
        color: '#000000',
        marginBottom: 3,
        lineHeight: 1,
        textAlign: 'justify',
    },
    addressSection: {
        marginLeft: 12,
        marginTop: 2,
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 1,
    },
    signBlock: {
        position: 'absolute',
        right: 12,
        bottom: 8,
        alignItems: 'center',
    },
    capImg: {
        width: 35,
        height: 35,
        left: -7, // adjust posisi horizontal
        position: 'relative', // penting untuk zIndex
    },
    signImg: {
        width: 60,
        height: 25,
        position: 'absolute', // agar menimpa cap
        top: 10, // posisi di atas cap
        left: 0, // adjust posisi horizontal
        zIndex: 10, // pastikan di atas cap
    },
    ketumTitle: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 0,
    },
    ketumName: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginTop: 0,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,// Spasi antar item
        alignItems: 'flex-start', // Pastikan teks sejajar dengan nomor di bagian atas
    },
    itemNumber: {
        width: 4, // Ruang untuk nomor (1., 2., dst.)
        marginRight: 3,
        fontSize: 6,
    },
    itemText: {
        fontSize: 6,
        color: '#000000',
        lineHeight: 1,
        textAlign: 'justify',
        paddingRight: 8
    },
});

// ==== Component ====
export default function IdCardDocument({
    pdp,
    ketum,
    photo,
    bg,
    logoLeft,
    logoRight,
    cap,
    ttd,
    qr,
    printedAt,
}: IdCardDocProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    const tempatTanggal = `${pdp?.tempat_lahir ?? '-'}, ${formatDate(pdp?.tgl_lahir)}`;

    const asalDaerah = pdp?.tingkat_penugasan === 'Paskibraka Tingkat Kabupaten/Kota'
        ? (pdp?.kabupaten ?? '-')
        : (pdp?.provinsi ?? '-');
    const daftarAturan = [
        'Kartu Anggota merupakan tanda atau bukti bahwa nama yang tertera telah terdaftar sebagai anggota Duta Pancasila Purnapaskibraka Indonesia',
        'Pemegang Kartu Anggota ini wajib menjaga harkat dan martabat serta nama baik organisasi Duta Pancasila Purnapaskibraka Indonesia',
        'Penyalahgunaan Kartu Anggota ini akan dikenakan sanksi sesuai peraturan yang berlaku',
        'Barang siapa yang menemukan Kartu Anggota ini harap dikembalikan ke alamat berikut:',
    ];
    return (
        <Document>
            {/* FRONT SIDE */}
            <Page size="A4" style={styles.page}>
                <View style={styles.cardContainer}>
                    {/* Background Image */}
                    {bg && <Image style={styles.background} src={bg} />}

                    {/* Header dengan background merah */}
                    <View style={styles.frontHeader}>
                        {logoLeft && <Image style={styles.logo} src={logoLeft} />}
                        <View style={styles.headerText}>
                            <Text style={styles.bigTitle}>KARTU ANGGOTA</Text>
                            <Text style={styles.subTitle}>DUTA PANCASILA PURNA PASKIBRAKA</Text>
                            <Text style={styles.address}>Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110</Text>
                        </View>
                        {logoRight && <Image style={styles.logo} src={logoRight} />}
                    </View>

                    {/* Body Content */}
                    <View style={styles.frontContent}>
                        <View style={styles.bodyRow}>
                            {/* Photo Section */}
                            <View style={styles.photoSection}>
                                {photo ? (
                                    <Image style={styles.avatar} src={photo} />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: '#E5E7EB' }]} />
                                )}
                                <Text style={styles.printDate}>
                                    Tanggal Cetak{"\n"}{printedAt}
                                </Text>
                            </View>

                            {/* Info Section */}
                            <View style={styles.infoSection}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>NRA</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>{pdp?.no_simental || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Nama</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={styles.value}>{pdp?.nama_lengkap || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Kelahiran</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={styles.value}>{tempatTanggal}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Alamat</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={styles.value}>{pdp?.alamat || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Asal Daerah</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={styles.value}>{asalDaerah}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Masa Berlaku</Text>
                                    <Text style={styles.colon}>:</Text>
                                    <Text style={styles.value}>Selama menjadi Anggota</Text>
                                </View>
                            </View>
                        </View>

                        {/* QR Code */}
                        <Image style={styles.qrCode} src={qr} />
                    </View>
                </View>
            </Page>

            {/* BACK SIDE */}
            <Page size="A4" style={styles.page}>
                <View style={styles.cardContainer}>
                    {/* Background Image */}
                    {bg && <Image style={styles.background} src={bg} />}

                    {/* Red Header Bar */}
                    <View style={styles.backHeader} />

                    {/* Back Content */}
                    <View style={styles.backContent}>
                        {daftarAturan.map((item, index) => (
                            <View key={index} style={styles.row}>
                                {/* Nomor item (dimulai dari 1) */}
                                <Text style={styles.itemNumber}>{`${index + 1}.`}</Text>
                                {/* Teks item */}
                                <Text style={styles.itemText}>{item}</Text>
                            </View>
                        ))}
                        <View style={styles.addressSection}>
                            <Text style={styles.addressTitle}>Sekretariat Duta Pancasila Purnapaskibraka Indonesia</Text>
                            <Text style={styles.termsList}>Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110</Text>
                        </View>

                        {/* Signature Block */}
                        <View style={styles.signBlock}>
                            <Text style={styles.ketumTitle}>Ketua Umum DPPI</Text>
                            {ttd && <Image style={styles.signImg} src={ttd} />}
                            {cap && <Image style={styles.capImg} src={cap} />}
                            <Text style={styles.ketumName}>{ketum?.nama_lengkap || ''}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}