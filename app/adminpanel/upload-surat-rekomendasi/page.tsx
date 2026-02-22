import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import UploadSuratRekomendasi from './UploadSuratRekomendasi';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Upload Surat Rekomendasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <UploadSuratRekomendasi />
        </AdminLayout>
    );
}
