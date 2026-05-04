import { fetchJson, type MesFetchResult } from '../api/mesClient';

export const runApiSmokeTest = async <T>(path: string): Promise<MesFetchResult<T>> => fetchJson<T>(path);
