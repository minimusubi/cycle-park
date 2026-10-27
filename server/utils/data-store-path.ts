import { join } from 'node:path';

const configuredPersistentDirectory = process.env.ASDF_PERSISTENT_DIR?.trim();

export const DATA_STORE_DIRECTORY =
	configuredPersistentDirectory || join(process.cwd(), 'data');

export const getDataStorePath = (fileName: string): string =>
	join(DATA_STORE_DIRECTORY, fileName);
