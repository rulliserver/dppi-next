
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import PelaksanaPusat from './PelaksanaPusat';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Verified - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <PelaksanaPusat />
        </AdminLayout>
    );
}
