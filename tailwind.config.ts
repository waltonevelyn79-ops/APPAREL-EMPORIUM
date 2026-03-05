import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',
                'light-bg': 'var(--color-light-bg)',
                'dark-bg': 'var(--color-dark-bg)',
                'dark-surface': 'var(--color-dark-surface)',
                'text-light': 'var(--color-text-light)',
                'text-dark': 'var(--color-text-dark)',
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'sans-serif'],
                body: ['var(--font-body)', 'sans-serif'],
                sans: ['var(--font-body)', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
export default config
