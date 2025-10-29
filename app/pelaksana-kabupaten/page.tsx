

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PelaksanaKabupatenProvinsi from './PelaksanaKabupatenProvinsi';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Kabupaten - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PelaksanaKabupatenProvinsi />
        </GuestLayout>
    );
}
