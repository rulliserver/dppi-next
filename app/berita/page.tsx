

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import Berita from './Berita';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Berita />
        </GuestLayout>
    );
}
