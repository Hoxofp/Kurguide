/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // 60 % — Dominant surfaces (theme-aware via CSS vars)
                surface: {
                    base: 'var(--surface-base)',
                    raised: 'var(--surface-raised)',
                    border: 'var(--surface-border)',
                    hover: 'var(--surface-hover)',
                },
                // 30 % — Secondary surfaces
                secondary: {
                    DEFAULT: 'var(--surface-secondary)',
                    hover: 'var(--surface-secondary-hover)',
                },
                // 10 % — Accent
                accent: {
                    DEFAULT: 'var(--accent)',
                    muted: 'var(--accent-muted)',
                },
                // Text
                txt: {
                    primary: 'var(--txt-primary)',
                    secondary: 'var(--txt-secondary)',
                    muted: 'var(--txt-muted)',
                },
                // Fixed accent colors for node types (never change)
                cream: '#F4F0E4',
                teal: '#44A194',
                violet: '#685AFF',
                flame: '#FF4400',
            },
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
            },
            boxShadow: {
                'node': '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px var(--surface-border)',
                'node-hover': '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--surface-border)',
                'prompt': '0 -4px 24px rgba(0,0,0,0.3), 0 0 0 1px var(--surface-border)',
                'sidebar': '2px 0 16px rgba(0,0,0,0.2)',
                'tooltip': '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px var(--surface-border)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
