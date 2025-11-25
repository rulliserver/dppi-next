import type { Metadata } from 'next';
import Regulasi from './Regulasi';
import AdminLayout from '@/app/Layouts/AdminLayout';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Regulasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <Regulasi />
        </AdminLayout>
    );
}
