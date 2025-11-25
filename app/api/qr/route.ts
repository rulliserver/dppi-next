// /app/api/qr/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('t') || 'https://dppi.bpip.go.id';
    const buf: any = await QRCode.toBuffer(text, { type: 'png', errorCorrectionLevel: 'M', margin: 1, scale: 6 });
    return new NextResponse(buf, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } });
}
