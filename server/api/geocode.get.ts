import {
	cacheGeocodeResults,
	getCachedGeocodeResults,
	normalizeGeocodeQuery,
} from '../utils/geocode-cache-store';
import { getQuery, setResponseHeader } from 'h3';
import type { GeocodeResult } from '#shared/types/geocode';

const MINIMUM_QUERY_LENGTH = 3;
const MAXIMUM_QUERY_LENGTH = 200;
const RESULT_LIMIT = 5;
const pendingRequests = new Map<string, Promise<GeocodeResult[]>>();

const fetchAndCacheGeocodeResults = async (
	query: string,
): Promise<GeocodeResult[]> => {
	const runtimeConfig = useRuntimeConfig();
	let results: GeocodeResult[];

	try {
		results = await $fetch<GeocodeResult[]>(
			runtimeConfig.nominatimBaseUrl,
			{
				query: {
					format: 'json',
					limit: RESULT_LIMIT,
					q: query,
				},
				headers: {
					'User-Agent': runtimeConfig.nominatimUserAgent,
				},
			},
		);

		if (!Array.isArray(results)) {
			throw new Error('Nominatim returned an unexpected response');
		}
	} catch (error) {
		console.error('Nominatim geocode request failed.', error);
		throw createError({
			statusCode: 502,
			statusMessage: 'The geocoding service is unavailable',
		});
	}

	try {
		await cacheGeocodeResults(query, results);
	} catch (error) {
		console.error('Unable to persist the geocode response cache.', error);
	}

	return results;
};

export default defineEventHandler(async (event) => {
	const queryParameter = getQuery(event).q;
	const query = typeof queryParameter === 'string' ? queryParameter.trim() : '';

	if (
		query.length < MINIMUM_QUERY_LENGTH
		|| query.length > MAXIMUM_QUERY_LENGTH
	) {
		throw createError({
			statusCode: 400,
			statusMessage: `Query must be between ${MINIMUM_QUERY_LENGTH} and ${MAXIMUM_QUERY_LENGTH} characters`,
		});
	}

	const cachedResults = await getCachedGeocodeResults(query);
	if (cachedResults) {
		setResponseHeader(event, 'X-Geocode-Cache', 'HIT');
		return cachedResults;
	}

	setResponseHeader(event, 'X-Geocode-Cache', 'MISS');
	const normalizedQuery = normalizeGeocodeQuery(query);
	const pendingRequest = pendingRequests.get(normalizedQuery);

	if (pendingRequest) {
		return pendingRequest;
	}

	const geocodeRequest = fetchAndCacheGeocodeResults(query);
	pendingRequests.set(normalizedQuery, geocodeRequest);

	try {
		return await geocodeRequest;
	} finally {
		pendingRequests.delete(normalizedQuery);
	}
});
