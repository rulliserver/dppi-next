

import type { Metadata } from 'next';

import IdPelaksanaKabupaten from './IdPelaksanaKabupaten';
import GuestLayout from '@/app/Layouts/GuestLayout';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Kabupaten - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <IdPelaksanaKabupaten />
        </GuestLayout>
    );
}
