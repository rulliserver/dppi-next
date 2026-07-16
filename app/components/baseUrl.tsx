import { UrlApi } from './apiUrl';

export const BaseUrl = 'http://localhost:8000/';

export function getImageUrl(path: string | null | undefined, width?: number, quality?: number): string {
    if (!path) return '/assets/images/logo-dppi.png';
    
    let cleanPath = path.trim();
    // If it starts with BaseUrl, strip it to get the relative path
    if (cleanPath.startsWith(BaseUrl)) {
        cleanPath = cleanPath.substring(BaseUrl.length);
    }
    
    // Remove leading slash if any
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    
    // Check if it's already an absolute URL or base64 or public asset
    if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('assets/')) {
        return cleanPath;
    }
    
    // Construct the optimized image URL (returns WebP)
    let url = `${UrlApi}/image?src=${cleanPath}`;
    if (width) url += `&w=${width}`;
    if (quality) url += `&q=${quality}`;
    return url;
}
