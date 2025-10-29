

import type { Metadata } from 'next';
import GuestLayout from '@/app/Layouts/GuestLayout';
import GaleriShow from './GaleriShow';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Galeri Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <GaleriShow />
        </GuestLayout>
    );
}
