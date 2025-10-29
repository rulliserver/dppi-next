

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import Kontak from './Kontak';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Kontak - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Kontak />
        </GuestLayout>
    );
}
