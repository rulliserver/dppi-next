

import type { Metadata } from 'next';

import PelaksanaKabupatenId from './PelaksanaKabupatenId';
import GuestLayout from '@/app/Layouts/GuestLayout';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Provinsi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PelaksanaKabupatenId />
        </GuestLayout>
    );
}
