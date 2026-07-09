import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readBody } from 'h3';
import type { ParkingLocation } from '#shared/types/parking';

const DB_DIR = join(process.cwd(), 'shared', 'data');
const DB_PATH = join(DB_DIR, 'parking.json');

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	if (!body) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing request body',
		});
	}

	// Basic validation
	if (
		!body.name
		|| !body.latitude
		|| !body.longitude
		|| !body.address
		|| !body.country
	) {
		throw createError({
			statusCode: 400,
			statusMessage:
				'Missing required fields (name, latitude, longitude, address, country)',
		});
	}

	// Ensure DB exists
	if (!existsSync(DB_DIR)) {
		mkdirSync(DB_DIR, { recursive: true });
	}

	let locations: ParkingLocation[] = [];
	if (existsSync(DB_PATH)) {
		try {
			locations = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
		} catch (e) {
			locations = [];
		}
	}

	const id = body.id || `lot-${Date.now()}`;
	const now = new Date().toISOString();

	const newLocation: ParkingLocation = {
		id,
		name: String(body.name),
		address: String(body.address),
		latitude: Number(body.latitude),
		longitude: Number(body.longitude),
		country: String(body.country),
		hoursOfOperation:
			body.hoursOfOperation ? String(body.hoursOfOperation) : '24 Hours',
		paymentMethods:
			Array.isArray(body.paymentMethods) ?
				body.paymentMethods.map(String)
			:	[],
		rates: Array.isArray(body.rates) ? body.rates : [],
		photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
		lastUpdated: now,
	};

	const existingIndex = locations.findIndex((loc) => loc.id === id);
	if (existingIndex > -1) {
		locations[existingIndex] = newLocation;
	} else {
		locations.push(newLocation);
	}

	writeFileSync(DB_PATH, JSON.stringify(locations, null, 2), 'utf-8');

	return {
		success: true,
		location: newLocation,
	};
});
