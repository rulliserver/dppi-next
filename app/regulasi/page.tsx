

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import RegulasiList from './RegulasiList';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Profil - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <RegulasiList />
        </GuestLayout>
    );
}
