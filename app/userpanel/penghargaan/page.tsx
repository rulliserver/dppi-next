import type { Metadata } from 'next';
import UserLayout from '@/app/Layouts/UserLayout';
import Penghargaan from './Penghargaan';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Biodata PDP - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <Penghargaan />
        </UserLayout>
    );
}
