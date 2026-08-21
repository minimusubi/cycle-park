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
		},
	},
	css: ['maplibre-gl/dist/maplibre-gl.css', '~/styles/global.scss'],
	runtimeConfig: {
		public: {
			mapStyleUrl:
				process.env.NUXT_PUBLIC_MAP_STYLE_URL
				|| 'https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json',
			mapDarkStyleUrl: process.env.NUXT_PUBLIC_MAP_DARK_STYLE_URL || '',
			mapTilerKey: process.env.NUXT_PUBLIC_MAP_TILER_KEY || '',
		},
	},
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
