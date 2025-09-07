import { environment } from '../../environments/environment';

export function normalizeImagePath(img?: any): string {
  const placeholder = '/assets/images/placeholder.jpg';
  if (!img) return placeholder;

  // If an object is passed (e.g. { url: '...' } or {src: '...'}), extract likely fields
  if (typeof img === 'object') {
    if (img.url) img = img.url;
    else if (img.src) img = img.src;
    else if (img.path) img = img.path;
    else return placeholder;
  }

  // Coerce to string and trim
  img = String(img).trim();
  if (!img) return placeholder;

  // Absolute URLs
  if (/^https?:\/\//i.test(img)) return img;

  // Leading slash -> treat as server root relative
  if (img.startsWith('/')) return `${environment.serviceBaseUrls.DOMAIN01}${img}`;

  // If image already contains uploads/ prefix or looks like a filename, build uploads URL
  if (/^(uploads\/)?.+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(img) || /^[\w-]+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(img)) {
    const path = img.startsWith('uploads/') ? img : `uploads/${img}`;
    return `${environment.serviceBaseUrls.DOMAIN01}/${path}`;
  }

  // Fallback
  return placeholder;
}
