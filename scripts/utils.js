/**
 * Format time stamp
 * @param {string} - unix timestamp
 * @returns {string} - Month day, year
 */
export default function formatTimeStamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Debounce function to prevent multiple calls to the same function.
 * @param func - function to debounce
 * @param wait - time to wait before calling function
 * @returns {(function(...[*]): void)|*}
 */
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
