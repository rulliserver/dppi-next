// components/IdCardDocumentJSPDF.ts
import jsPDF from 'jspdf';

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
    ketum: string | null;
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
// Ukuran ID Card dalam mm
const CARD_WIDTH = 85.60;
const CARD_HEIGHT = 53.98;

// ==== Helper Functions ====
const loadImage = (src: string | null): Promise<string | null> => {
    return new Promise((resolve) => {
        if (!src) {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });
};

const formatDate = (dateString: string | null): string => {
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

// ==== Main Function ====
export default async function generateIdCardPDF({
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
}: IdCardDocProps): Promise<jsPDF> {
    // Create PDF in A4 format
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Calculate position to center the card on A4 page
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const cardX = (pageWidth - CARD_WIDTH) / 2;
    const cardY = (pageHeight - CARD_HEIGHT) / 2;

    // Load all images
    const [
        bgImage,
        logoLeftImage,
        logoRightImage,
        photoImage,
        qrImage,
        capImage,
        ttdImage
    ] = await Promise.all([
        loadImage(bg),
        loadImage(logoLeft),
        loadImage(logoRight),
        loadImage(photo),
        loadImage(qr),
        loadImage(cap),
        loadImage(ttd)
    ]);

    // ==== FRONT SIDE ====
    // Draw background
    if (bgImage) {
        pdf.addImage(bgImage, 'PNG', cardX, cardY, CARD_WIDTH, CARD_HEIGHT);
    }

    // Draw border
    pdf.setDrawColor(204, 204, 204);
    pdf.setLineWidth(0.18);
    pdf.rect(cardX, cardY, CARD_WIDTH, CARD_HEIGHT);

    // Draw red header
    const headerHeight = CARD_HEIGHT * 0.28;
    pdf.setFillColor(127, 29, 29);
    pdf.rect(cardX, cardY, CARD_WIDTH, headerHeight, 'F');

    // Draw logos
    const logoSize = 10;
    const logoY = cardY + (headerHeight - logoSize) / 2;

    if (logoLeftImage) {
        pdf.addImage(logoLeftImage, 'PNG', cardX + 2, logoY, logoSize, logoSize);
    }

    if (logoRightImage) {
        pdf.addImage(logoRightImage, 'PNG', cardX + CARD_WIDTH - logoSize - 2, logoY, logoSize, logoSize);
    }

    // Header text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KARTU ANGGOTA', cardX + CARD_WIDTH / 2, cardY + 5, { align: 'center' });

    pdf.setFontSize(8);
    pdf.text('DUTA PANCASILA PURNA PASKIBRAKA', cardX + CARD_WIDTH / 2, cardY + 8, { align: 'center' });

    pdf.setFontSize(6);
    pdf.text('Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110', cardX + CARD_WIDTH / 2, cardY + 11, { align: 'center' });

    // Body content
    const bodyStartY = cardY + headerHeight;
    const photoSectionWidth = 16;

    // Draw photo
    const photoWidth = 14;
    const photoHeight = 20;
    const photoX = cardX + 2;
    const photoY = bodyStartY + 2;

    if (photoImage) {
        pdf.setFillColor(229, 231, 235);
        pdf.addImage(photoImage, 'PNG', photoX, photoY, photoWidth, photoHeight);
    } else {
        pdf.setFillColor(229, 231, 235);
        pdf.rect(photoX, photoY, photoWidth, photoHeight, 'F');
    }

    // Print date below photo
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Tanggal Cetak', photoX + photoWidth / 2, photoY + photoHeight + 3, { align: 'center' });
    pdf.text(printedAt, photoX + photoWidth / 2, photoY + photoHeight + 5, { align: 'center' });

    // Info section
    const infoX = cardX + photoSectionWidth + 3;
    let infoY = bodyStartY + 5;

    const tempatTanggal = `${pdp?.tempat_lahir ?? '-'}, ${formatDate(pdp?.tgl_lahir)}`;
    const asalDaerah = pdp?.tingkat_penugasan === 'Paskibraka Tingkat Kabupaten/Kota'
        ? (pdp?.kabupaten ?? '-')
        : (pdp?.provinsi ?? '-');

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');

    // Helper function to draw info row
    const drawInfoRow = (label: string, value: string, isBold = false) => {
        // Fixed position untuk titik dua
        const colonX = infoX + 20;

        // Draw label dan titik dua
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, infoX, infoY);
        pdf.text(':', colonX, infoY);

        // Position value
        const valueX = colonX + 2;
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

        // Handle text wrapping for long values
        const maxWidth = CARD_WIDTH - 45;
        const lines = pdf.splitTextToSize(value, maxWidth);

        if (lines.length > 1) {
            pdf.text(lines[0], valueX, infoY);
            infoY += 3;
            for (let i = 1; i < lines.length; i++) {
                pdf.text(lines[i], valueX, infoY);
                infoY += 3;
            }
        } else {
            pdf.text(value, valueX, infoY);
            infoY += 3;
        }
    };

    // Pemanggilan tetap sama
    drawInfoRow('NRA', pdp?.no_simental || '-', true);
    drawInfoRow('Nama', pdp?.nama_lengkap || '-');
    drawInfoRow('Kelahiran', tempatTanggal);
    drawInfoRow('Alamat', pdp?.alamat || '-');
    drawInfoRow('Asal Daerah', asalDaerah);
    drawInfoRow('Masa Berlaku', 'Selama menjadi Anggota');

    // QR Code
    if (qrImage) {
        const qrSize = 12;
        const qrX = cardX + CARD_WIDTH - qrSize - 2;
        const qrY = cardY + CARD_HEIGHT - qrSize - 2;
        pdf.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);
    }

    // ==== BACK SIDE ====
    pdf.addPage();

    // Draw background for back side
    if (bgImage) {
        pdf.addImage(bgImage, 'PNG', cardX, cardY, CARD_WIDTH, CARD_HEIGHT);
    }

    // Draw border
    pdf.setDrawColor(204, 204, 204);
    pdf.setLineWidth(0.18);
    pdf.rect(cardX, cardY, CARD_WIDTH, CARD_HEIGHT);

    // Draw red header bar
    const backHeaderHeight = 4;
    pdf.setFillColor(127, 29, 29);
    pdf.rect(cardX, cardY, CARD_WIDTH, backHeaderHeight, 'F');

    // Terms and conditions
    const termsStartY = cardY + 6;
    let currentY = termsStartY;

    const daftarAturan = [
        'Kartu Anggota merupakan tanda atau bukti bahwa nama yang tertera telah terdaftar sebagai anggota Duta Pancasila Purnapaskibraka Indonesia',
        'Pemegang Kartu Anggota ini wajib menjaga harkat dan martabat serta nama baik organisasi Duta Pancasila Purnapaskibraka Indonesia',
        'Penyalahgunaan Kartu Anggota ini akan dikenakan sanksi sesuai peraturan yang berlaku',
        'Barang siapa yang menemukan Kartu Anggota ini harap dikembalikan ke alamat berikut:',
    ];

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');

    daftarAturan.forEach((item, index) => {
        const number = `${index + 1}.`;
        const textX = cardX + 3;
        const numberWidth = 4;

        // Draw number
        pdf.text(number, textX, currentY);

        // Draw text with wrapping
        const textStartX = textX + numberWidth;
        const maxTextWidth = CARD_WIDTH - 10;
        const lines = pdf.splitTextToSize(item, maxTextWidth);

        lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, textStartX, currentY + (lineIndex * 3));
        });

        currentY += (lines.length * 3) + 1;
    });

    // Address section
    currentY += 1;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sekretariat Duta Pancasila Purnapaskibraka Indonesia', cardX + 5, currentY);
    currentY += 2;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110', cardX + 5, currentY);

    // Signature block
    const signX = cardX + CARD_WIDTH - 25;
    const signY = cardY + CARD_HEIGHT - 15;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.text('Ketua Umum DPPI', signX, signY, { align: 'center' });

    // Draw signature and stamp
    if (ttdImage) {
        pdf.addImage(ttdImage, 'PNG', signX - 5, signY + 1, 15, 6);
    }

    if (capImage) {
        pdf.addImage(capImage, 'PNG', signX - 2, signY + 3, 9, 9);
    }

    // Ketum name
    pdf.text(ketum || '', signX, signY + 12, { align: 'center' });

    return pdf;
}

// ==== Utility Function for Download ====
export async function downloadIdCardPDF(props: IdCardDocProps, filename: string = 'kartu-anggota.pdf') {
    const pdf = await generateIdCardPDF(props);
    pdf.save(filename);
}

// ==== Utility Function to Get Blob ====
export async function getIdCardPDFBlob(props: IdCardDocProps): Promise<Blob> {
    const pdf = await generateIdCardPDF(props);
    return pdf.output('blob');
}