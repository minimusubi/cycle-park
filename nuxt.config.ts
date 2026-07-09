import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	alias: {
		'#shared': fileURLToPath(new URL('./shared', import.meta.url)),
	},
	compatibilityDate: '2025-11-24',
	devtools: { enabled: true },
	modules: [
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxtjs/color-mode',
	],
	app: {
		head: {
			title: 'CyclePark - Bicycle Parking Locator',
			meta: [
				{
					name: 'description',
					content:
						'Find nearby bicycle parking, compare pricing structures, and estimate costs based on duration.',
				},
			],
			link: [
				{
					rel: 'stylesheet',
					href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
					integrity:
						'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
					crossorigin: '',
				},
			],
			script: [
				{
					src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
					integrity:
						'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
					crossorigin: '',
				},
			],
		},
	},
	css: ['~/styles/global.scss'],
	nitro: {
		esbuild: {
			options: {
				target: 'esnext',
			},
		},
	},
	// https://fonts.nuxt.com/get-started/configuration
	fonts: {
		defaults: {
			weights: ['100 900'],
			styles: ['normal', 'italic'],
		},
		// Optical size, fill, grade variable axes seem to not be supported
		// families: [
		// 	{
		// 		name: 'Material Symbols Outlined',
		// 		provider: 'googleicons',
		// 		fallbacks: [],
		// 		weights: ['100 700'],
		// 	},
		// ],
	},
	// https://color-mode.nuxtjs.org/usage/configuration
	colorMode: {
		preference: 'system',
		fallback: 'dark',
		dataValue: 'bs-theme',
	},
});
