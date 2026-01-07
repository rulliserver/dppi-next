import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';

import ListProvinsi from './ListProvinsi';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'List Pendaftaran Pengangkatan DPPI Kab/Kota - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <ListProvinsi />
        </AdminLayout>
    );
}
