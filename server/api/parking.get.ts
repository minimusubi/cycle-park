import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getQuery } from 'h3';
import type { ParkingLocation } from '#shared/types/parking';
import { getHaversineDistance } from '#shared/utils/pricing';

const DB_DIR = join(process.cwd(), 'shared', 'data');
const DB_PATH = join(DB_DIR, 'parking.json');

// Seed data
const SEED_DATA: ParkingLocation[] = [
	{
		id: 'lot-a',
		name: 'Ikebukuro West Gate Bike Park',
		address: '1-18 Nishiikebukuro, Toshima City, Tokyo, Japan',
		latitude: 35.7295,
		longitude: 139.7088,
		country: 'Japan',
		hoursOfOperation: '24 Hours',
		paymentMethods: ['cash', 'ic'],
		rates: [
			{
				id: 'top-rack',
				name: 'Top Rack',
				freePeriodMinutes: 120, // 2 hours free
				chargeSteps: [
					{ durationMinutes: 360, rate: 100, isRecurring: false }, // 100 yen for the next 6 hours
					{ durationMinutes: 120, rate: 100, isRecurring: true }, // 100 yen for every 2 hours after
				],
			},
			{
				id: 'bottom-rack',
				name: 'Bottom Rack',
				freePeriodMinutes: 120, // 2 hours free
				chargeSteps: [
					{ durationMinutes: 180, rate: 100, isRecurring: false }, // 100 yen for the next 3 hours
					{ durationMinutes: 60, rate: 100, isRecurring: true }, // 100 yen for every 1 hour after
				],
			},
		],
		photoUrl:
			'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80',
		lastUpdated: new Date().toISOString(),
	},
	{
		id: 'lot-b',
		name: 'Sunshine City Bicycle Parking',
		address: '3-1-1 Higashiikebukuro, Toshima City, Tokyo, Japan',
		latitude: 35.7291,
		longitude: 139.7191,
		country: 'Japan',
		hoursOfOperation: '07:00 - 23:30',
		paymentMethods: ['cash', 'credit', 'paypay'],
		rates: [
			{
				id: 'standard-rack',
				name: 'Standard Rack',
				freePeriodMinutes: 0,
				chargeSteps: [
					{ durationMinutes: 240, rate: 100, isRecurring: true }, // 100 yen per 4 hours
				],
			},
		],
		photoUrl:
			'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=500&q=80',
		lastUpdated: new Date().toISOString(),
	},
	{
		id: 'lot-c',
		name: 'Powell St BART Station Locker',
		address: '899 Market St, San Francisco, CA 94103, USA',
		latitude: 37.7844,
		longitude: -122.408,
		country: 'United States',
		hoursOfOperation: '24 Hours',
		paymentMethods: ['credit', 'applepay', 'googlepay'],
		rates: [
			{
				id: 'secure-locker',
				name: 'Secure Locker',
				freePeriodMinutes: 60, // 1 hour free
				chargeSteps: [
					{ durationMinutes: 120, rate: 1.5, isRecurring: true }, // $1.50 per 2 hours
				],
			},
			{
				id: 'standard-hoop',
				name: 'Standard Hoop (Outdoor)',
				freePeriodMinutes: 1440, // 24 hours free
				chargeSteps: [
					{ durationMinutes: 1440, rate: 0, isRecurring: true },
				],
			},
		],
		photoUrl:
			'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=500&q=80',
		lastUpdated: new Date().toISOString(),
	},
];

export default defineEventHandler((event) => {
	// Ensure DB directory and file exist
	if (!existsSync(DB_DIR)) {
		mkdirSync(DB_DIR, { recursive: true });
	}
	if (!existsSync(DB_PATH)) {
		writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
	}

	// Load data
	const dataRaw = readFileSync(DB_PATH, 'utf-8');
	let locations: ParkingLocation[] = [];
	try {
		locations = JSON.parse(dataRaw);
	} catch (e) {
		locations = SEED_DATA;
	}

	// Extract query parameters
	const query = getQuery(event);
	const latStr = query.lat as string;
	const lngStr = query.lng as string;

	if (latStr && lngStr) {
		const searchLat = parseFloat(latStr);
		const searchLng = parseFloat(lngStr);

		if (!isNaN(searchLat) && !isNaN(searchLng)) {
			// Calculate distances and attach to response objects
			const locationsWithDistance = locations.map((loc) => {
				const distance = getHaversineDistance(
					searchLat,
					searchLng,
					loc.latitude,
					loc.longitude,
				);
				return {
					...loc,
					distance, // Distance in km
				};
			});

			// Sort by distance ascending
			return locationsWithDistance.sort(
				(a, b) => (a.distance ?? 0) - (b.distance ?? 0),
			);
		}
	}

	return locations;
});
