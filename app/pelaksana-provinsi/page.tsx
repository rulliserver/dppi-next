

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PelaksanaProvinsi from './PelaksanaProvinsi';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Provinsi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PelaksanaProvinsi />
        </GuestLayout>
    );
}
