import { useState, useEffect } from 'react';

export default function darkMode() {
	const [theme, setTheme]: any = useState(typeof window !== 'undefined' ? localStorage.theme : 'light');
	const colorTheme: string = theme === 'light' ? 'dark' : 'light';

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(colorTheme);
		root.classList.add(theme);
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', theme);
		}
	}, [theme]);

	return [colorTheme, setTheme];
}
