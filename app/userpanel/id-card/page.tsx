import type { Metadata } from 'next';
import UserLayout from '@/app/Layouts/UserLayout';
import IdCard from './IdCard';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Id Card - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <IdCard />
        </UserLayout>
    );
}
