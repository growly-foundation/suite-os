import moment from 'moment';

interface CachePayload<T> {
  cachedDate: number;
  expiredAfter: number;
  data: T;
}

export function storeJsonData<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function storeJsonCacheData<T>(key: string, data: CachePayload<T>) {
  storeJsonData(key, data);
}

export function getJsonData<T>(key: string): T | null {
  const rawOutput = localStorage.getItem(key);
  try {
    if (!rawOutput) return null;
    const output = JSON.parse(rawOutput);
    return output as T;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export function getJsonCacheData<T>(key: string): CachePayload<T> | null {
  return getJsonData(key);
}

export function buildCachePayload<T>(data: T, ms: number): CachePayload<T> {
  return {
    data,
    expiredAfter: ms,
    cachedDate: moment().unix(),
  };
}

export function isCacheExpires(cachePayload: CachePayload<any>) {
  return moment().unix() >= cachePayload.cachedDate + cachePayload.expiredAfter;
}

export function isValidStorageKey(key: string) {
  const cachedData = getJsonCacheData(key);
  return !!cachedData && !isCacheExpires(cachedData);
}

export async function getRevalidatedJsonData<T>(
  key: string,
  revalidateMethod?: () => Promise<CachePayload<T>>,
  opts?: Partial<{ forceRefetch: boolean }>
): Promise<T | null> {
  const revalidate = async (method: () => Promise<CachePayload<T>>) => {
    const newData = await method();
    storeJsonCacheData<T>(key, newData);
    return newData;
  };
  let cachedData = getJsonCacheData<T>(key);
  if (!cachedData || opts?.forceRefetch) {
    if (revalidateMethod) {
      cachedData = await revalidate(revalidateMethod);
    } else {
      return null;
    }
  }
  if (isCacheExpires(cachedData) && revalidateMethod) {
    cachedData = await revalidate(revalidateMethod);
  }
  return cachedData.data;
}
