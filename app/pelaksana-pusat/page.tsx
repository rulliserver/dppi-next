

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PelaksanaPusat from './PelaksanaPusat';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pelaksana Pusat - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PelaksanaPusat />
        </GuestLayout>
    );
}
