import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import AssignPamongPage from './PamongAssign';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Penugasan Pamong - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <AssignPamongPage />
        </AdminLayout>
    );
}
