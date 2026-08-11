import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

import type { InlineConfig } from 'vitest';
import type { UserConfig } from 'vite';

interface VitestConfigExport extends UserConfig {
    test: InlineConfig;
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/react-vite-vitest/',
    test: {
        port: 3000,
        environment: 'jsdom',
        globals: true,
        transformMode: {
            web: [/\.[jt]sx?$/],
        },
        setupFiles: './src/setupVitest.ts',
        css: true,
    },
    resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
} as VitestConfigExport);
