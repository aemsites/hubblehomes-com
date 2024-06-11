/**
 * Extract the last segment from a given URL.
 * @param {string} url - The URL to extract the last segment from.
 * @returns {string} The extracted last segment.
 */
export default function getLastUrlSegment(url) {
  const { pathname } = new URL(url);
  const sanitizedPathname = pathname.replace(/\/+$/, '');
  const parts = sanitizedPathname.split('/');
  return parts.pop();
}
