import type { Metadata } from 'next';
import ProfileUser from './ProfileUser';
import AdminLayout from '@/app/Layouts/AdminLayout';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Profile User - DPPI BPIP RI'
	};
}

export default function Page() {
	return (
		<AdminLayout>
			<ProfileUser />
		</AdminLayout>
	);
}
