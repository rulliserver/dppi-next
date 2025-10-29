import type { Metadata } from 'next';
import Video from './Video';
import AdminLayout from '@/app/Layouts/AdminLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Dashboard - Sismart Geodome'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <Video />
        </AdminLayout>
    );
}
