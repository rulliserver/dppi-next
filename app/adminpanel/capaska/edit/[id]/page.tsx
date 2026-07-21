import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import EditCapaskaPage from './EditCapaska';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Edit Capaska - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <EditCapaskaPage />
        </AdminLayout>
    );
}
