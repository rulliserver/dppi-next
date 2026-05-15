

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PDPDetailPage from './PdpDetail';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Detail PDP - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <PDPDetailPage />
        </GuestLayout>
    );
}
