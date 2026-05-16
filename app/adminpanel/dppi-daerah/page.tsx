
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import DppiDaerah from './DppiDilantik';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'DPPI DAERAH - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <DppiDaerah />
        </AdminLayout>
    );
}
