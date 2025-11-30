import type { Metadata } from 'next';
import PdpEdit from './PdpEdit';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Verified - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <PdpEdit />
        </UserLayout>
    );
}
