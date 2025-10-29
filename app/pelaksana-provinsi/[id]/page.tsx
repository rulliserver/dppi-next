

import GuestLayout from '@/app/Layouts/GuestLayout';
import type { Metadata } from 'next';
import IdPelaksanaProvinsi from './IdPelaksanaProvinsi';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Provinsi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <IdPelaksanaProvinsi />
        </GuestLayout>
    );
}
