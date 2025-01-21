export const CACHE_KEYS = {
    CHATA_DATA: 'chataData_cache',
    FORM_DATA: 'submitted_forms_cache',
    PDF_URLS: 'pdf_urls_cache',
    TIMESTAMP: 'cache_timestamp'
} as const;

type CacheKey = keyof typeof CACHE_KEYS;

export function getCachedData<T>(key: CacheKey): T | null {
    try {
        const cachedData = localStorage.getItem(CACHE_KEYS[key]);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
    }
}

export function setCacheData<T>(key: CacheKey, data: T): void {
    try {
        localStorage.setItem(CACHE_KEYS[key], JSON.stringify(data));
    } catch (error) {
        console.error('Error setting cache:', error);
    }
}

export function clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

export function isCacheValid(key: CacheKey): boolean {
    try {
        const data = getCachedData(key);
        if (!data) return false;
        
        if (key === 'CHATA_DATA') {
            return Array.isArray(data) && data.length >= 2;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
} 