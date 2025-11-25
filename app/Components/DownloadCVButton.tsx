// Components/DownloadCVButton.jsx
'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import { BaseUrl } from '@/app/Components/baseUrl';
import FormatLongDate from '@/app/Components/FormatLongDate';

const DownloadCVButton = ({ pdp, pendidikan, organisasi }: any) => {
    const [generating, setGenerating] = useState(false);

    // Function untuk convert image ke base64
    const getBase64Image = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error loading image:', error);
            return '';
        }
    };

    const generatePDF = async () => {
        const doc = new jsPDF();

        // Load background image
        let backgroundImage = '';
        try {
            backgroundImage = await getBase64Image('https://dppi.bpip.go.id/assets/images/bg-header-cv2.jpg');
        } catch (error) {
            console.error('Error loading background image:', error);
            // Fallback ke background color jika image gagal load
            doc.setFillColor(255, 248, 248);
            doc.rect(0, 0, 210, 297, 'F');
        }

        // Add background image jika berhasil load
        if (backgroundImage) {
            try {
                // Add background image untuk seluruh halaman
                doc.addImage(backgroundImage, 'JPEG', 0, 0, 210, 40);

                // Add semi-transparent overlay agar text mudah dibaca
                // doc.setFillColor(255, 255, 255, 0.8); // White dengan opacity 80%
                // doc.rect(0, 0, 210, 297, 'F');
            } catch (error) {
                console.error('Error adding background image:', error);
                // Fallback ke background color
                doc.setFillColor(185, 28, 28); // dark red
                doc.rect(0, 0, 210, 40, 'F');

                // doc.setFillColor(255, 248, 248);
                // doc.rect(0, 0, 210, 297, 'F');
            }
        }


        // Judul CV
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('CURRICULUM VITAE', 105, 16, { align: 'center' });

        // NRA dan Nomor Piagam
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        if (pdp.no_simental) {
            doc.text(`NRA: ${pdp.no_simental}`, 105, 25, { align: 'center' });
        }
        if (pdp.no_piagam) {
            doc.text(`Nomor Piagam: ${pdp.no_piagam}`, 105, 31, { align: 'center' });
        }

        let yPosition = 55;

        // PHOTO PROFILE - DI SEBELAH KIRI
        if (pdp.photo) {
            try {
                const photoUrl = `${BaseUrl + pdp.photo.replace("/uploads", "uploads")}`;
                const base64Image = await getBase64Image(photoUrl);

                if (base64Image) {
                    // Add photo frame MERAH di kiri
                    doc.setDrawColor(185, 28, 28);
                    doc.setLineWidth(1);
                    doc.rect(20, yPosition, 45, 55); // Frame photo

                    // Add photo - ukuran proporsional
                    doc.addImage(base64Image, 'JPEG', 22.5, yPosition + 2, 30, 44);


                }
            } catch (error) {
                console.error('Error loading photo:', error);
                // Fallback placeholder di kiri

            }
        } else {
            doc.setDrawColor(185, 28, 28);
            doc.setLineWidth(1);
            doc.rect(20, yPosition, 45, 55);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(6);
            doc.text('No Photo', 38, yPosition + 28, { align: 'center' });

        }

        // DATA PRIBADI - FLEX COLUMN LAYOUT di sebelah kanan photo
        const flexStartX = 70; // Mulai dari sebelah kanan photo
        const flexWidth = 120; // Lebar flex container

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(185, 28, 28);
        doc.rect(flexStartX - 15, yPosition, flexWidth + 15, 85, 'F');
        doc.rect(flexStartX - 15, yPosition, flexWidth + 15, 85, 'S');

        // Header DATA PRIBADI
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DATA PRIBADI', flexStartX + (flexWidth / 2), yPosition + 5, { align: 'center' });

        // Data dalam format FLEX COLUMN - Vertical Stack
        let currentY = yPosition + 10;

        // 1. Nama
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Nama:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const namaLines = doc.splitTextToSize(pdp.nama_lengkap || '-', flexWidth - 15);
        doc.text(namaLines, flexStartX + 25, currentY);
        currentY += Math.max(namaLines.length * 3, 5);

        // 2. Kelahiran
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text('Kelahiran:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const kelahiranText = pdp.tgl_lahir ? FormatLongDate(pdp.tgl_lahir) : '-';
        doc.text(kelahiranText, flexStartX + 25, currentY);
        currentY += 5;

        // 3. Alamat
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text('Alamat:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const alamatText = `${pdp.alamat || ''} ${pdp.kabupaten_domisili || ''} ${pdp.provinsi_domisili || ''}`.trim() || '-';
        const alamatLines = doc.splitTextToSize(alamatText, flexWidth - 28);
        doc.text(alamatLines, flexStartX + 25, currentY);
        currentY += (alamatLines.length * 3) + 2;

        // 4. Kewarganegaraan
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text('Kewarganegaraan:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Indonesia', flexStartX + 25, currentY);
        currentY += 5;

        // 5. Telepon
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text('Telepon:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(pdp.telepon || '-', flexStartX + 25, currentY);
        currentY += 5;

        // 6. Email
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', flexStartX - 5, currentY);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const emailLines = doc.splitTextToSize(pdp.email || '-', flexWidth - 15);
        doc.text(emailLines, flexStartX + 25, currentY);

        yPosition = currentY + 15;

        // PENDIDIKAN - Box dengan background
        if (pendidikan && pendidikan.length > 0) {
            // Calculate height dynamically based on content
            let pendidikanHeight = 25;
            pendidikan.forEach((item: any) => {
                const educationText = `${item.nama_instansi_pendidikan}${item.jurusan ? ` - ${item.jurusan}` : ''}`;
                const lines = doc.splitTextToSize(educationText, 120);
                pendidikanHeight += (lines.length * 4) + 8;
            });

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(185, 28, 28);
            doc.rect(20, yPosition - 5, 170, pendidikanHeight, 'F');
            doc.rect(20, yPosition - 5, 170, pendidikanHeight, 'S');

            doc.setTextColor(185, 28, 28);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PENDIDIKAN', 25, yPosition + 3);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            pendidikan.forEach((item: any) => {
                const educationText = `${item.nama_instansi_pendidikan}${item.jurusan ? ` - ${item.jurusan}` : ''}`;
                const yearText = `${item.tahun_masuk} - ${item.tahun_lulus}`;

                // Background untuk setiap item pendidikan
                doc.setFillColor(255, 248, 248);
                doc.rect(25, yPosition - 6, 160, 10, 'F');

                const splitText = doc.splitTextToSize(educationText, 110);
                doc.text(splitText, 28, yPosition);

                // Tahun dengan warna merah
                doc.setTextColor(185, 28, 28);
                doc.setFont('helvetica', 'bold');
                doc.text(yearText, 155, yPosition, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');

                yPosition += (splitText.length * 4) + 6;

                // Check if need new page
                if (yPosition > 250) {
                    doc.addPage();
                    // Add background untuk halaman baru
                    if (backgroundImage) {
                        doc.addImage(backgroundImage, 'JPEG', 0, 0, 210, 297);
                        doc.setFillColor(255, 255, 255, 0.8);
                        doc.rect(0, 0, 210, 297, 'F');
                    } else {
                        doc.setFillColor(255, 248, 248);
                        doc.rect(0, 0, 210, 297, 'F');
                    }
                    yPosition = 30;
                }
            });

            yPosition += 10;
        }

        // ORGANISASI - Box dengan background
        if (organisasi && organisasi.length > 0) {
            let organisasiHeight = 25;
            organisasi.forEach((item: any) => {
                const orgText = `${item.posisi} - ${item.nama_organisasi}`;
                const lines = doc.splitTextToSize(orgText, 120);
                organisasiHeight += (lines.length * 4) + 8;
            });

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(185, 28, 28);
            doc.rect(20, yPosition - 5, 170, organisasiHeight, 'F');
            doc.rect(20, yPosition - 5, 170, organisasiHeight, 'S');

            doc.setTextColor(185, 28, 28);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('ORGANISASI', 25, yPosition + 3);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            organisasi.forEach((item: any) => {
                const orgText = `${item.posisi} - ${item.nama_organisasi}`;
                const yearText = item.status === 'Masih Aktif'
                    ? `${item.tahun_masuk} - sekarang`
                    : `${item.tahun_masuk} - ${item.tahun_keluar}`;

                doc.setFillColor(255, 248, 248);
                doc.rect(25, yPosition - 2, 160, 10, 'F');

                const splitText = doc.splitTextToSize(orgText, 110);
                doc.text(splitText, 28, yPosition);

                doc.setTextColor(185, 28, 28);
                doc.setFont('helvetica', 'bold');
                doc.text(yearText, 155, yPosition, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');

                yPosition += (splitText.length * 4) + 6;

                if (yPosition > 250) {
                    doc.addPage();
                    // Add background untuk halaman baru
                    if (backgroundImage) {
                        doc.addImage(backgroundImage, 'JPEG', 0, 0, 210, 297);
                        doc.setFillColor(255, 255, 255, 0.8);
                        doc.rect(0, 0, 210, 297, 'F');
                    } else {
                        doc.setFillColor(255, 248, 248);
                        doc.rect(0, 0, 210, 297, 'F');
                    }
                    yPosition = 30;
                }
            });

            yPosition += 10;
        }

        // HOBI - Box dengan background
        const hobiList = parseHobi(pdp.id_hobi);
        if (hobiList.length > 0) {
            const hobiHeight = 25;
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(185, 28, 28);
            doc.rect(20, yPosition - 5, 170, hobiHeight, 'F');
            doc.rect(20, yPosition - 5, 170, hobiHeight, 'S');

            doc.setTextColor(185, 28, 28);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('HOBI', 25, yPosition + 3);
            yPosition += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            const hobbiesText = hobiList.join(', ');
            doc.text(hobbiesText, 28, yPosition + 3);
            yPosition += 15;
        }

        // BAKAT - Box dengan background
        if (pdp.detail_bakat) {
            const bakatLines = doc.splitTextToSize(pdp.detail_bakat, 160);
            const bakatHeight = 20 + (bakatLines.length * 4);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(185, 28, 28);
            doc.rect(20, yPosition - 5, 170, bakatHeight, 'F');
            doc.rect(20, yPosition - 5, 170, bakatHeight, 'S');

            doc.setTextColor(185, 28, 28);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('BAKAT', 25, yPosition + 3);
            yPosition += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            doc.text(bakatLines, 28, yPosition + 3);
        }

        // Footer dengan background MERAH
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Footer background
            doc.setFillColor(185, 28, 28);
            doc.rect(0, 280, 210, 20, 'F');

            // Footer text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('DPPI BPIP RI', 105, 295, { align: 'center' });
        }

        return doc;
    };

    const parseHobi = (hobiData: any) => {
        if (!hobiData) return [];

        try {
            const parsed = JSON.parse(hobiData);
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (typeof parsed === 'string') {
                return parsed.split(',').map(item => item.trim()).filter(item => item);
            } else {
                return [];
            }
        } catch (error) {
            if (typeof hobiData === 'string') {
                return hobiData.split(',').map(item => item.trim()).filter(item => item);
            }
            return [];
        }
    };

    const handleViewPDF = async () => {
        setGenerating(true);
        try {
            const doc = await generatePDF();
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const newWindow = window.open(pdfUrl, '_blank');
            if (newWindow) {
                newWindow.focus();
            }

            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
            }, 1000);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async () => {
        setGenerating(true);
        try {
            const doc = await generatePDF();
            doc.save(`CV-${pdp.nama_lengkap.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleViewPDF}
                disabled={generating}
                className='px-3 py-2'
            >
                {generating ? (
                    <>
                        <i className='fas fa-spinner fa-spin mr-2'></i>
                        Generating PDF...
                    </>
                ) : (
                    <>
                        Download CV
                    </>
                )}
            </button>


        </div>
    );
};

export default DownloadCVButton;