import AdminLayout from '../Layouts/AdminLayout';
import Dashboard from './Dashboard';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Dashboard - Sismart Geodome'
	};
}
export default function Page() {
	return (
		<AdminLayout>
			<Dashboard />
		</AdminLayout>
	);
}
