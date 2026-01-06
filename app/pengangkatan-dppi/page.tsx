

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PengangkatanDppi from './PengangkatanDppi';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pengangkatan Pertama Kali - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PengangkatanDppi />
        </GuestLayout>
    );
}
