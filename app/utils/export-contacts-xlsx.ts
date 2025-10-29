// export-contacts-xlsx.ts (judul A1–H1, tabel mulai A3)
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import FormatLongDate from '../Components/FormatLongDate';

export interface ContactMessage {
    nama: string;
    telepon?: string | null;
    email: string;
    jenis_pesan: string;
    evidance?: string | null; // URL bukti
    pesan: string;
    created_at: string | Date;
}

export function exportContactsXlsx(
    data: ContactMessage[],
    filename = 'contacts.xlsx',
    title = 'Data Pesan Kontak'
) {
    const header = [
        'No',
        'Nama',
        'Telepon',
        'Email',
        'Jenis Pesan',
        'Evidance',
        'Pesan',
        'Dibuat Pada',
    ];

    // Row indices (0-based):
    const TITLE_ROW = 0;      // A1
    const BLANK_ROW = 1;      // A2
    const HEADER_ROW = 2;     // A3
    const DATA_START_ROW = 3; // A4

    const rows = data.map((d, i) => [
        i + 1,                                   // No (urut dari 1)
        d.nama ?? '',
        d.telepon ? `'${d.telepon}` : '',        // paksa teks agar nol depan aman
        d.email ?? '',
        d.jenis_pesan ?? '',
        d.evidance ?? '',                        // akan jadi hyperlink
        d.pesan ?? '',
        FormatLongDate(d.created_at),
    ]);

    // Susun AOA: title, blank, header, data
    const aoa: any[][] = [
        [title, '', '', '', '', '', '', ''], // A1–H1 (akan di-merge)
        ['', '', '', '', '', '', '', ''],    // A2
        header,                               // A3
        ...rows,                              // A4..dst
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge A1:H1 untuk judul
    (ws as any)['!merges'] = [{ s: { r: TITLE_ROW, c: 0 }, e: { r: TITLE_ROW, c: header.length - 1 } }];

    // Styling judul (A1:H1 merged)
    for (let c = 0; c < header.length; c++) {
        const addr = XLSX.utils.encode_cell({ r: TITLE_ROW, c });
        const cell = ws[addr] || (ws[addr] = { t: 's', v: c === 0 ? title : '' });
        (cell as any).s = {
            font: { bold: true, sz: 14 },
            alignment: { vertical: 'center', horizontal: 'center' },
        };
    }

    // Styling header (A3:H3)
    for (let C = 0; C < header.length; C++) {
        const addr = XLSX.utils.encode_cell({ r: HEADER_ROW, c: C });
        const cell = ws[addr] || (ws[addr] = { t: 's', v: header[C] });
        (cell as any).s = {
            font: { bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
            alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        };
    }

    const range = XLSX.utils.decode_range(ws['!ref'] as string);
    const COL_EVIDANCE = 5;
    const COL_PESAN = 6;

    // === Border presets ===
    const thin = { style: 'thin', color: { rgb: 'black' } };    // grid tipis
    // const thin = { style: 'thin', color: { rgb: '9CA3AF' } }; // outline tebal

    // Batas tabel (untuk outline tebal)
    const START_ROW = HEADER_ROW;        // baris header (A3)
    const END_ROW = range.e.r;         // baris data terakhir
    const START_COL = 0;                 // kolom A
    const END_COL = header.length - 1; // kolom H

    // === Header borders (A3:H3) ===
    for (let C = 0; C < header.length; C++) {
        const addr = XLSX.utils.encode_cell({ r: HEADER_ROW, c: C });
        const cell = ws[addr] || (ws[addr] = { t: 's', v: header[C] });

        (cell as any).s = {
            font: { bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
            alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
            border: {
                top: C >= START_COL && C <= END_COL ? thin : thin, // outline atas tebal
                right: C === END_COL ? thin : thin,
                bottom: thin,
                left: C === START_COL ? thin : thin,
            },
        };
    }

    // === Body borders + hyperlink + telepon teks ===
    for (let R = DATA_START_ROW; R <= range.e.r; R++) {
        for (let C = 0; C < header.length; C++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (!cell) continue;

            const border = {
                top: R === START_ROW ? thin : thin,      // baris tepat di bawah header dapat outline atas tebal
                right: C === END_COL ? thin : thin,
                bottom: R === END_ROW ? thin : thin,      // outline bawah tebal
                left: C === START_COL ? thin : thin,
            };

            (cell as any).s = {
                alignment: {
                    vertical: 'top',
                    horizontal: C === 0 ? 'center' : 'left',
                    wrapText: C === COL_PESAN,
                },
                border,
            };

            // Hyperlink Evidance
            if (C === COL_EVIDANCE) {
                const url = String(cell.v || '').trim();
                if (url) {
                    cell.v = 'Buka Bukti';
                    (cell as any).l = { Target: url, Tooltip: 'Buka evidance' };
                    (cell as any).s = {
                        ...(cell as any).s,
                        font: { color: { rgb: '2563EB' }, underline: true },
                    };
                }
            }

            // Telepon sebagai teks
            if (C === 2 && cell.v) cell.t = 's';
        }
    }

    // Tanpa AutoFilter
    // ws['!autofilter'] = undefined;

    // Freeze sampai header (baris 1..3 dipertahankan)
    (ws as any)['!freeze'] = { xSplit: 0, ySplit: HEADER_ROW + 1, topLeftCell: 'A4', activePane: 'bottomLeft', state: 'frozen' };

    // Auto width kolom
    const colCount = header.length;
    const colWidths: { wch: number }[] = Array.from({ length: colCount }, () => ({ wch: 10 }));
    const measure = (val: any) => {
        if (val == null) return 0;
        const s = String(val);
        return Math.min(80, Math.max(10, s.length + 2));
    };

    // Hitung lebar: perhatikan judul, header, dan data
    for (let C = 0; C < colCount; C++) {
        // title row: pakai panjang title di kolom A saja
        if (C === 0) colWidths[C].wch = Math.max(colWidths[C].wch, measure(title));

        // header
        colWidths[C].wch = Math.max(colWidths[C].wch, measure(header[C]));

        // data
        for (let R = DATA_START_ROW; R <= range.e.r; R++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (!cell) continue;
            const val =
                C === COL_EVIDANCE && (cell as any).l?.Target ? 'Buka Bukti' : cell.v;
            colWidths[C].wch = Math.max(colWidths[C].wch, measure(val));
        }
    }
    // Pesan lebih lebar
    colWidths[COL_PESAN].wch = Math.max(colWidths[COL_PESAN].wch, 60);
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
}
