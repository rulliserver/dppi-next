import type { Config } from 'tailwindcss';

export default {
    content: ['./app/**/*.{ts,tsx,jsx,css}'],
    theme: {
        extend: {
            colors: {
                dark: '#0f172a',       // setara slate-900
                mute: '#f3f4f6',       // setara gray-100
                textlight: '#1f2937',  // slate-800/900 (untuk mode light)
                textdark: '#e5e7eb',   // slate-200 (untuk mode dark)
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
} satisfies Config;
