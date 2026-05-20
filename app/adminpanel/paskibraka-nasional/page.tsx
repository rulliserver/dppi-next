
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import PaskibrakaNasional from './PaskibrakaNasional';
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Paskibraka Nasional - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <PaskibrakaNasional />
        </AdminLayout>
    );
}
