// /app/userpanel/download-id-card/route.ts
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import {
    pdf,
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
} from '@react-pdf/renderer';
import type { PdpData } from '@/app/lib/pdp-types';
import { http } from '@/app/lib/https';
import { createLogger, withLog } from '@/app/lib/logger';
import { UrlApi } from '@/app/Components/apiUrl';
import { BaseUrl } from '@/app/Components/baseUrl';
import QRCode from 'qrcode';
import IdCardDocument from '@/app/Components/IdCardDocument';

export const runtime = 'nodejs';

const log = createLogger('pdf-id-card');

function joinUrl(base: string, path: string) {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
// helper baru: kembalikan data URL (string)
async function fetchImageAsDataUrl(pathOrUrl: string): Promise<string> {
    const isAbs = /^https?:\/\//i.test(pathOrUrl);
    const url = isAbs ? pathOrUrl : joinUrl(BaseUrl, pathOrUrl);
    const res = await http.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });

    const ext = (url.split('.').pop() || '').toLowerCase();
    const mime =
        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
            : ext === 'webp' ? 'image/webp'
                : 'image/png';

    const base64 = Buffer.from(res.data).toString('base64');
    return `data:${mime};base64,${base64}`;
}

// ---------- Fetch helpers ----------
const fetchUser = withLog('pdf-id-card', 'fetchUser', async (cookie: string) => {
    const res = await http.get<{ id_pdp?: string | number }>(joinUrl(UrlApi, '/user'), {
        headers: { Cookie: cookie },
        validateStatus: (s) => s >= 200 && s < 500,
    });
    if (res.status !== 200) throw new Error('Tidak bisa membaca sesi user');
    return res.data;
});

const fetchPdp = withLog('pdf-id-card', 'fetchPdp', async (id: string | number, cookie: string) => {
    const url = joinUrl(UrlApi, `/userpanel/pdp/${id}`);
    const res = await http.get<PdpData>(url, { headers: { Cookie: cookie } });
    return res.data;
});

const fetchKetum = withLog('pdf-id-card', 'fetchKetum', async (cookie: string) => {
    const url = joinUrl(UrlApi, `/userpanel/ketum`);
    const res = await http.get<Array<{ nama_lengkap: string }>>(url, { headers: { Cookie: cookie } });
    return res.data?.[0] ?? { nama_lengkap: '' };
});

const fetchImage = withLog('pdf-id-card', 'fetchImage', async (pathOrUrl: string) => {
    // boleh path ("/assets/...") atau url penuh
    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const url = isAbsolute ? pathOrUrl : joinUrl(BaseUrl, pathOrUrl);
    const res = await http.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
    const ext = (url.split('.').pop() || '').toLowerCase();
    let format: 'png' | 'jpg' | 'jpeg' | 'webp' = 'png';
    if (ext === 'jpg') format = 'jpg';
    else if (ext === 'jpeg') format = 'jpeg';
    else if (ext === 'webp') format = 'webp';
    return { buffer: res.data, format };
});

const generateQrPng = withLog('pdf-id-card', 'generateQr', async (targetUrl: string) => {
    // hasilkan PNG buffer untuk dimasukkan ke react-pdf <Image>
    const buf = await QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: 'M',
        type: 'png',
        margin: 1,
        scale: 6,
    });
    return { buffer: buf, format: 'png' as const };
});

// ---------- Route Handler ----------
export async function GET(req: NextRequest) {
    const t = log.timeStart('GET /download-id-card');
    try {
        const cookie = req.headers.get('cookie') || '';
        const { searchParams } = new URL(req.url);
        const paramId = searchParams.get('id');

        // Tentukan ID PDP: query param > sesi user
        let effectiveId: string | number | undefined = paramId || undefined;
        if (!effectiveId) {
            const user = await fetchUser(cookie);
            effectiveId = user?.id_pdp;
        }
        if (!effectiveId) {
            t.error('no id_pdp (param dan sesi kosong)');
            return NextResponse.json(
                { error: 'ID PDP tidak ditemukan (param ?id= kosong dan sesi tidak memiliki id_pdp).' },
                { status: 400 }
            );
        }

        // Data utama
        const [pdp, ketum] = await Promise.all([
            fetchPdp(effectiveId, cookie),
            fetchKetum(cookie).catch(() => ({ nama_lengkap: '' })),
        ]);

        // Asset opsional
        const [photo, bg, logoLeft, logoRight, cap, ttd] = await Promise.all([
            pdp?.photo ? fetchImageAsDataUrl(pdp.photo).catch(() => null) : Promise.resolve(null),
            fetchImageAsDataUrl('/assets/images/bg-card.jpg').catch(() => null),
            fetchImageAsDataUrl('/assets/images/logo-dppi.png').catch(() => null),
            fetchImageAsDataUrl('/assets/images/logo-smart.png').catch(() => null),
            fetchImageAsDataUrl('/assets/images/cap-dppi.png').catch(() => null),
            fetchImageAsDataUrl('/assets/images/ttd.png').catch(() => null),
        ]);


        // QR code ? mengarah ke URL publik id-card download
        const qrTarget = `https://dppi.bpip.go.id/id-card/download/${pdp?.id ?? effectiveId}`;
        const qr: any = await generateQrPng(qrTarget);

        // Tanggal cetak
        const printedAt = new Date().toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
        });

        // Build PDF
        const doc: any = React.createElement(IdCardDocument, {
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
        });
        const pdfBuffer = await pdf(doc).toBuffer();
        const filenameSafe = (`IDCARD_${pdp?.nama_lengkap || 'PDP'}`)
            .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
            .replace(/\s+/g, '_');

        t.end({ filename: filenameSafe, id: String(effectiveId) });
        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filenameSafe}.pdf"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (err: any) {
        t.error(err);
        const status = err?.response?.status ?? 500;
        const msg = err?.response?.data?.message || err?.message || 'Gagal membuat PDF ID Card';
        return NextResponse.json({ error: msg }, { status });
    }
}
