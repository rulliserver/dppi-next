

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import MajelisPertimbangan from './MajelisPertimbangan';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Majelis Pertimbangan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <MajelisPertimbangan />
        </GuestLayout>
    );
}
