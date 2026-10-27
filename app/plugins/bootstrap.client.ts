import { Drawer } from 'bootstrap';

export default defineNuxtPlugin(() => ({
	provide: {
		bootstrapDrawer: Drawer,
	},
}));
