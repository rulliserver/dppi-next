

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PengangkatanDppiProvinsi from './PengangkatanDppiProvinsi';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pengangkatan Pertama Kali - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PengangkatanDppiProvinsi />
        </GuestLayout>
    );
}
