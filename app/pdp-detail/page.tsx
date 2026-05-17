

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import PDPDetailPage from './PdpDetail';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Detail PDP - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
                </div>
            }>
                <PDPDetailPage />
            </Suspense >
        </GuestLayout>
    );
}
