import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getQuery } from 'h3';
import type { ParkingLocation } from '#shared/types/parking';

const DB_PATH = join(process.cwd(), 'shared', 'data', 'parking.json');

export default defineEventHandler((event) => {
	const query = getQuery(event);
	const id = query.id as string;

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing ID parameter',
		});
	}

	if (!existsSync(DB_PATH)) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Database file not found',
		});
	}

	let locations: ParkingLocation[] = [];
	try {
		locations = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
	} catch (e) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Error parsing database',
		});
	}

	const initialLength = locations.length;
	locations = locations.filter((loc) => loc.id !== id);

	if (locations.length === initialLength) {
		throw createError({
			statusCode: 404,
			statusMessage: `Location with ID ${id} not found`,
		});
	}

	writeFileSync(DB_PATH, JSON.stringify(locations, null, 2), 'utf-8');

	return {
		success: true,
		deletedId: id,
	};
});
