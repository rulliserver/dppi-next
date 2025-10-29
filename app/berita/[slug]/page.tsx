import type { Metadata } from 'next';
import GuestLayout from '@/app/Layouts/GuestLayout';
import ViewBerita from './ViewBerita';
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <ViewBerita />
        </GuestLayout>
    );
}
