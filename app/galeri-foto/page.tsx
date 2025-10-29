

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';

import Galeri from './Galeri';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Galeri Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Galeri />
        </GuestLayout>
    );
}
