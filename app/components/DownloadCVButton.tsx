'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import { BaseUrl } from '@/app/components/baseUrl';
import FormatLongDate from '@/app/components/FormatLongDate';

const DownloadCVButton = ({ pdp, pendidikan, organisasi }: any) => {
    const [generating, setGenerating] = useState(false);

    // Function untuk convert image ke base64
    const getBase64Image = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error('Image fetch failed');
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

    const generatePDF = async () => {
        const doc = new jsPDF();

        // Load DPPI Logo
        let logoBase64 = '';
        try {
            const logoUrl = window.location.origin + '/assets/images/logo-dppi.png';
            logoBase64 = await getBase64Image(logoUrl);
        } catch (error) {
            console.error('Error loading DPPI logo:', error);
        }

        // Helper to draw left sidebar background & border
        const drawSidebar = (pdfDoc: jsPDF) => {
            pdfDoc.setFillColor(127, 29, 29); // BPIP Red 900
            pdfDoc.rect(0, 0, 70, 297, 'F');
            
            pdfDoc.setFillColor(245, 158, 11); // Gold Divider Line
            pdfDoc.rect(69, 0, 1, 297, 'F');
        };

        // Render Page 1 Sidebar Base
        drawSidebar(doc);

        let yPosition = 15;

        // PHOTO PROFILE
        let photoLoaded = false;
        if (pdp.photo) {
            try {
                let cleanPhotoPath = pdp.photo.trim();
                if (cleanPhotoPath.startsWith('/')) {
                    cleanPhotoPath = cleanPhotoPath.substring(1);
                }
                if (!cleanPhotoPath.startsWith('uploads/')) {
                    cleanPhotoPath = 'uploads/' + cleanPhotoPath;
                }
                const photoUrl = `${BaseUrl}${cleanPhotoPath}`;
                const base64Image = await getBase64Image(photoUrl);

                if (base64Image) {
                    // Frame photo
                    doc.setFillColor(255, 255, 255);
                    doc.rect(13.5, 18.5, 43, 53, 'F');
                    
                    // Add photo
                    doc.addImage(base64Image, 'JPEG', 15, 20, 40, 50);
                    photoLoaded = true;
                }
            } catch (error) {
                console.error('Error loading photo for PDF:', error);
            }
        }

        // Render DPPI Logo at the top right of first page
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 182, 10, 15, 15);
            } catch (error) {
                console.error('Error rendering logo on PDF:', error);
            }
        }
        
        if (!photoLoaded) {
            // Draw placeholder frame
            doc.setFillColor(255, 255, 255);
            doc.rect(13.5, 18.5, 43, 53, 'F');
            doc.setDrawColor(220, 38, 38);
            doc.setLineWidth(0.5);
            doc.rect(15, 20, 40, 50, 'S');
            doc.setTextColor(185, 28, 28);
            doc.setFontSize(8);
            doc.text('PAS FOTO', 35, 43, { align: 'center' });
            doc.text('CAPASKA', 35, 48, { align: 'center' });
        }

        // Draw Left Sidebar Content
        let sidebarY = 80;
        
        const drawSidebarHeader = (title: string, y: number) => {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 12, y);
            
            doc.setDrawColor(245, 158, 11); // Gold
            doc.setLineWidth(0.5);
            doc.line(12, y + 2, 58, y + 2);
            return y + 7;
        };
        
        // 1. Kontak
        sidebarY = drawSidebarHeader('KONTAK PRIBADI', sidebarY);
        doc.setFontSize(8);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', 12, sidebarY);
        doc.setFont('helvetica', 'normal');
        const emailLines = doc.splitTextToSize(pdp.email || '-', 46);
        doc.text(emailLines, 12, sidebarY + 3.5);
        sidebarY += (emailLines.length * 3.5) + 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Telepon:', 12, sidebarY);
        doc.setFont('helvetica', 'normal');
        doc.text(pdp.telepon || '-', 12, sidebarY + 3.5);
        sidebarY += 8.5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Kelahiran:', 12, sidebarY);
        doc.setFont('helvetica', 'normal');
        const birthText = `${pdp.tempat_lahir || ''}, ${pdp.tgl_lahir ? FormatLongDate(pdp.tgl_lahir) : '-'}`;
        const birthLines = doc.splitTextToSize(birthText, 46);
        doc.text(birthLines, 12, sidebarY + 3.5);
        sidebarY += (birthLines.length * 3.5) + 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Alamat:', 12, sidebarY);
        doc.setFont('helvetica', 'normal');
        const addressLines = doc.splitTextToSize(pdp.alamat || '-', 46);
        doc.text(addressLines, 12, sidebarY + 3.5);
        sidebarY += (addressLines.length * 3.5) + 8;
        
        // 2. Bakat & Minat
        if (pdp.detail_bakat || pdp.detail_minat) {
            sidebarY = drawSidebarHeader('MINAT & BAKAT', sidebarY);
            doc.setFontSize(8);
            
            if (pdp.detail_bakat) {
                doc.setFont('helvetica', 'bold');
                doc.text('Bakat:', 12, sidebarY);
                doc.setFont('helvetica', 'normal');
                const bakatLines = doc.splitTextToSize(pdp.detail_bakat, 46);
                doc.text(bakatLines, 12, sidebarY + 3.5);
                sidebarY += (bakatLines.length * 3.5) + 5;
            }
            
            if (pdp.detail_minat) {
                doc.setFont('helvetica', 'bold');
                doc.text('Minat:', 12, sidebarY);
                doc.setFont('helvetica', 'normal');
                const minatLines = doc.splitTextToSize(pdp.detail_minat, 46);
                doc.text(minatLines, 12, sidebarY + 3.5);
                sidebarY += (minatLines.length * 3.5) + 8;
            }
        }
        
        // 3. Hobi
        const hobiList = parseHobi(pdp.id_hobi);
        if (hobiList.length > 0) {
            sidebarY = drawSidebarHeader('HOBI / KEGEMARAN', sidebarY);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const hobiText = hobiList.join(', ');
            const hobiLines = doc.splitTextToSize(hobiText, 46);
            doc.text(hobiLines, 12, sidebarY);
            sidebarY += (hobiLines.length * 3.5) + 8;
        }

        // ================== RIGHT COLUMN CONTENT ==================
        // Header: Curriculum Vitae
        doc.setTextColor(127, 29, 29); // Red 900
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Curriculum Vitae', 78, 18);

        // Candidate Name
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const nameRightLines = doc.splitTextToSize(pdp.nama_lengkap || '', 100);
        doc.text(nameRightLines, 78, 28);
        let rightY = 28 + (nameRightLines.length * 5.5) + 2;

        // NRA (bold and larger)
        if (pdp.no_simental) {
            doc.setTextColor(15, 23, 42); // Slate 900
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`NRA: ${pdp.no_simental}`, 78, rightY);
            rightY += 6;
        }

        // Piagam (normal size)
        if (pdp.no_piagam) {
            doc.setTextColor(71, 85, 105); // Slate 600
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Nomor Piagam: ${pdp.no_piagam}`, 78, rightY);
            rightY += 5;
        }
        
        // Horizontal separator line
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.5);
        doc.line(78, rightY + 3, 200, rightY + 3);
        rightY += 12;

        const drawSectionHeader = (title: string, y: number) => {
            doc.setTextColor(127, 29, 29); // Red 900
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 78, y);
            
            doc.setDrawColor(127, 29, 29);
            doc.setLineWidth(0.8);
            doc.line(78, y + 2, 200, y + 2);
            return y + 8;
        };

        // RIWAYAT PENDIDIKAN
        if (pendidikan && pendidikan.length > 0) {
            rightY = drawSectionHeader('RIWAYAT PENDIDIKAN', rightY);
            
            pendidikan.forEach((item: any) => {
                if (rightY > 255) {
                    doc.addPage();
                    drawSidebar(doc);
                    rightY = 25;
                }
                
                // Bullet dot
                doc.setFillColor(127, 29, 29);
                doc.circle(81, rightY + 1, 1, 'F');
                
                // Institution Name
                doc.setTextColor(15, 23, 42); // Slate 900
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                const schoolName = item.nama_instansi_pendidikan || '-';
                const schoolLines = doc.splitTextToSize(schoolName, 112);
                doc.text(schoolLines, 85, rightY + 2);
                rightY += (schoolLines.length * 4) + 1;
                
                // Major / Degree
                doc.setTextColor(71, 85, 105); // Slate 600
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const majorText = `${item.jenjang_pendidikan || ''} ${item.jurusan ? `- ${item.jurusan}` : ''}`.trim();
                if (majorText) {
                    const majorLines = doc.splitTextToSize(majorText, 112);
                    doc.text(majorLines, 85, rightY + 1.5);
                    rightY += (majorLines.length * 3.5) + 1;
                }
                
                // Academic Year
                doc.setTextColor(185, 28, 28); // Red 700
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'bold');
                doc.text(`${item.tahun_masuk} - ${item.tahun_lulus}`, 85, rightY + 1);
                rightY += 8;
            });
            rightY += 5;
        }

        // RIWAYAT ORGANISASI
        if (organisasi && organisasi.length > 0) {
            if (rightY > 245) {
                doc.addPage();
                drawSidebar(doc);
                rightY = 25;
            }
            
            rightY = drawSectionHeader('RIWAYAT ORGANISASI', rightY);
            
            organisasi.forEach((item: any) => {
                if (rightY > 255) {
                    doc.addPage();
                    drawSidebar(doc);
                    rightY = 25;
                }
                
                // Bullet dot
                doc.setFillColor(127, 29, 29);
                doc.circle(81, rightY + 1, 1, 'F');
                
                // Organization name & Position
                doc.setTextColor(15, 23, 42); // Slate 900
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                const orgTitle = `${item.posisi} - ${item.nama_organisasi}`;
                const orgLines = doc.splitTextToSize(orgTitle, 112);
                doc.text(orgLines, 85, rightY + 2);
                rightY += (orgLines.length * 4) + 1;
                
                // Membership Status & Duration
                doc.setTextColor(185, 28, 28); // Red 700
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'bold');
                const yearText = item.status === 'Masih Aktif'
                    ? `${item.tahun_masuk} - Sekarang`
                    : `${item.tahun_masuk} - ${item.tahun_keluar || ''}`;
                doc.text(yearText, 85, rightY + 1);
                rightY += 8;
            });
        }

        // DRAW FOOTERS FOR ALL PAGES
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Footer background bar
            doc.setFillColor(127, 29, 29); // Red 900
            doc.rect(0, 285, 210, 12, 'F');
            
            // Footer text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${totalPages}`, 140, 292.5, { align: 'center' });
            doc.text('DPPI BPIP RI', 35, 292.5, { align: 'center' });
        }

        return doc;
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
            alert('Gagal membuat PDF CV. Silakan coba kembali.');
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
            alert('Gagal mendownload PDF CV. Silakan coba kembali.');
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