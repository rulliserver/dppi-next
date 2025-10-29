import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import UpdatePassword from './UpdatePassword';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Profile User - Sismart Geodome'
	};
}

export default function Page() {
	return (
		<AdminLayout>
			<UpdatePassword />
		</AdminLayout>
	);
}
