import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import type { GeocodeResult } from '#shared/types/geocode';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { getDataStorePath } from './data-store-path';

interface GeocodeCacheEntry {
	query: string;
	cachedAt: string;
	results: GeocodeResult[];
}

interface GeocodeCacheFile {
	version: 1;
	entries: Record<string, GeocodeCacheEntry>;
}

const CACHE_FILE_PATH = getDataStorePath('geocode-cache.json');
const CACHE_FILE_VERSION = 1;

let cacheLoadPromise: Promise<Map<string, GeocodeCacheEntry>> | null = null;
let cacheWriteQueue = Promise.resolve();

export const normalizeGeocodeQuery = (query: string): string =>
	query.trim().replace(/\s+/g, ' ').toLowerCase();

const createCacheKey = (normalizedQuery: string): string =>
	createHash('sha256').update(normalizedQuery).digest('hex');

const loadCache = async (): Promise<Map<string, GeocodeCacheEntry>> => {
	try {
		const cacheContents = await readFile(CACHE_FILE_PATH, 'utf8');
		const cacheFile = JSON.parse(cacheContents) as Partial<GeocodeCacheFile>;

		if (
			cacheFile.version !== CACHE_FILE_VERSION
			|| !cacheFile.entries
			|| typeof cacheFile.entries !== 'object'
		) {
			throw new Error('Unsupported geocode cache format');
		}

		return new Map(Object.entries(cacheFile.entries));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.warn('Unable to read the geocode cache; starting empty.', error);
		}

		return new Map();
	}
};

const getCache = (): Promise<Map<string, GeocodeCacheEntry>> => {
	cacheLoadPromise ??= loadCache();
	return cacheLoadPromise;
};

const persistCache = async (
	cache: Map<string, GeocodeCacheEntry>,
): Promise<void> => {
	const cacheFile: GeocodeCacheFile = {
		version: CACHE_FILE_VERSION,
		entries: Object.fromEntries(cache),
	};
	const temporaryFilePath = `${CACHE_FILE_PATH}.${process.pid}.tmp`;

	await mkdir(dirname(CACHE_FILE_PATH), { recursive: true });
	await writeFile(
		temporaryFilePath,
		`${JSON.stringify(cacheFile, null, 2)}\n`,
		'utf8',
	);
	await rename(temporaryFilePath, CACHE_FILE_PATH);
};

export const getCachedGeocodeResults = async (
	query: string,
): Promise<GeocodeResult[] | null> => {
	const normalizedQuery = normalizeGeocodeQuery(query);
	const cache = await getCache();
	const cacheEntry = cache.get(createCacheKey(normalizedQuery));

	return cacheEntry?.results ?? null;
};

export const cacheGeocodeResults = async (
	query: string,
	results: GeocodeResult[],
): Promise<void> => {
	const normalizedQuery = normalizeGeocodeQuery(query);
	const cache = await getCache();
	const cacheKey = createCacheKey(normalizedQuery);

	cache.set(cacheKey, {
		query: normalizedQuery,
		cachedAt: new Date().toISOString(),
		results,
	});

	const writeOperation = cacheWriteQueue.then(() => persistCache(cache));
	cacheWriteQueue = writeOperation.catch(() => undefined);
	await writeOperation;
};
