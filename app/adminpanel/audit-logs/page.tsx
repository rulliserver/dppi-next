import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import AuditLogsPage from './AuditLogs';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Log Aktivitas - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <AuditLogsPage />
        </AdminLayout>
    );
}
