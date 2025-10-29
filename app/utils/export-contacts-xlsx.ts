// export-contacts-xlsx.ts
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import FormatLongDate from '../Components/FormatLongDate';

export interface ContactMessage {
    id: number;
    nama: string;
    telepon?: string | null;
    email: string;
    jenis_pesan: string;
    evidance?: string | null; // URL bukti
    pesan: string;
    created_at: string | Date; // DateTime<Utc> -> ISO string di frontend
}

export function exportContactsXlsx(
    data: ContactMessage[],
    filename = 'contacts.xlsx'
) {
    // 1) Header + data (AOA agar kontrol styling lebih mudah)
    const header = [
        'ID',
        'Nama',
        'Telepon',
        'Email',
        'Jenis Pesan',
        'Evidance',
        'Pesan',
        'Dibuat Pada',
    ];

    const rows = data.map((d) => [
        d.id,
        d.nama ?? '',
        // pastikan nomor telepon jadi teks (tidak diubah Excel):
        d.telepon ? `'${d.telepon}` : '',
        d.email ?? '',
        d.jenis_pesan ?? '',
        d.evidance ?? '', // akan diubah jadi hyperlink di langkah styling
        d.pesan ?? '',
        FormatLongDate(d.created_at), // tampilkan sebagai string siap baca
    ]);

    const aoa = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // 2) Range worksheet
    const range = XLSX.utils.decode_range(ws['!ref'] as string);

    // 3) Styling header
    for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        const cell = ws[addr] || (ws[addr] = { t: 's', v: header[C] });

        (cell as any).s = {
            font: { bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } }, // gray-100
            alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
            border: {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            },
        };
    }

    // 4) Styling body + hyperlink evidance + wrap pesan
    const COL_EVIDANCE = 5; // index kolom (0-based): A=0 ... Evidance=5
    const COL_PESAN = 6;

    for (let R = 1; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (!cell) continue;

            // border + alignment dasar
            (cell as any).s = {
                alignment: {
                    vertical: 'top',
                    horizontal: C === 0 ? 'center' : 'left',
                    wrapText: C === COL_PESAN, // wrap untuk pesan
                },
                border: {
                    top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    right: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                },
            };

            // hyperlink untuk evidance jika URL ada
            if (C === COL_EVIDANCE) {
                const url = String(cell.v || '').trim();
                if (url) {
                    // tampilkan teks yang ramah
                    cell.v = 'Buka Bukti';
                    (cell as any).l = { Target: url, Tooltip: 'Buka evidance' };
                    // sedikit pewarnaan supaya tampak seperti link
                    (cell as any).s = {
                        ...(cell as any).s,
                        font: { color: { rgb: '2563EB' }, underline: true }, // biru & underline
                    };
                }
            }

            // pastikan telepon tetap teks
            if (C === 2 && cell.v) {
                cell.t = 's';
            }
        }
    }

    // 5) Autofilter & freeze header
    ws['!autofilter'] = { ref: ws['!ref'] as string };
    (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

    // 6) Auto column width (berdasar panjang teks)
    const colCount = header.length;
    const colWidths: { wch: number }[] = new Array(colCount).fill({ wch: 10 }).map(() => ({ wch: 10 }));

    const measure = (val: any) => {
        if (val == null) return 0;
        const s = String(val);
        // sedikit bonus ruang; pesan bisa panjang
        return Math.min(80, Math.max(10, s.length + 2));
    };

    // hitung lebar max per kolom
    for (let C = 0; C < colCount; C++) {
        // mulai dari header
        colWidths[C].wch = Math.max(colWidths[C].wch, measure(header[C]));
        // body
        for (let R = 1; R <= range.e.r; R++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (!cell) continue;
            // untuk evidance tampilkan panjang teks “Buka Bukti”
            const val =
                C === COL_EVIDANCE && (cell as any).l?.Target
                    ? 'Buka Bukti'
                    : cell.v;
            colWidths[C].wch = Math.max(colWidths[C].wch, measure(val));
        }
    }

    // sedikit penyesuaian manual agar kolom “Pesan” lebih lebar
    colWidths[COL_PESAN].wch = Math.max(colWidths[COL_PESAN].wch, 60);
    ws['!cols'] = colWidths;

    // 7) Workbook & simpan
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
        type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
}
