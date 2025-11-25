import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import Kegiatan from './Kegiatan';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <Kegiatan />
        </AdminLayout>
    );
}
