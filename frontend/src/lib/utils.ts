export function getMediaUrl(url: string | null) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // Remove /api suffix if present to get the root URL
    baseUrl = baseUrl.replace(/\/api$/, '');
    
    return `${baseUrl}${url}`;
}
