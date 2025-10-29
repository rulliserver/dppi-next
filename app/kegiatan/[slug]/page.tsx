

import GuestLayout from '@/app/Layouts/GuestLayout';
import type { Metadata } from 'next';
import ViewKegiatan from './ViewKegiatan';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <ViewKegiatan />
        </GuestLayout>
    );
}
