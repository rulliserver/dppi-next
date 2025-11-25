import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const t = url.searchParams.get('t');
    if (!t) return new NextResponse('Missing t', { status: 400 });
    const png: any = await QRCode.toBuffer(t, { errorCorrectionLevel: 'M', margin: 1, scale: 6 });
    return new NextResponse(png, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
