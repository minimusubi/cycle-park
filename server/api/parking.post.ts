import {
	DATA_STORE_DIRECTORY,
	getDataStorePath,
} from '../utils/data-store-path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { readBody } from 'h3';

const DB_PATH = getDataStorePath('parking.json');

const sanitizeRates = (rates: PricingRate[]): PricingRate[] =>
	rates.map((rate) => ({
		...rate,
		chargeSteps: rate.chargeSteps.map((step, stepIndex) => ({
			durationMinutes: step.durationMinutes,
			rate: step.rate,
			...((
				stepIndex === rate.chargeSteps.length - 1
				&& Number(step.rate) !== 0
				&& step.isRecurring === true
			) ?
				{ isRecurring: true }
			:	{}),
		})),
	}));

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
		|| body.latitude === undefined
		|| body.latitude === null
		|| body.longitude === undefined
		|| body.longitude === null
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
	if (!existsSync(DATA_STORE_DIRECTORY)) {
		mkdirSync(DATA_STORE_DIRECTORY, { recursive: true });
	}

	let locations: ParkingLocation[] = [];
	if (existsSync(DB_PATH)) {
		try {
			locations = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
		} catch {
			locations = [];
		}
	}

	const id = body.id || `${randomUUID()}`;
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
		rates: Array.isArray(body.rates) ? sanitizeRates(body.rates) : [],
		photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
		notes: body.notes ? String(body.notes) : undefined,
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
