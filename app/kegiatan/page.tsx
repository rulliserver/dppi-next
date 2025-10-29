

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import KegiatanList from './KegiatanList';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <KegiatanList />
        </GuestLayout>
    );
}
