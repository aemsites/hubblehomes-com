/**
 * Formats data from the Communities sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Communities sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatCommunities = (data) => data.map((item) => ({
  display: `${item.name} - Community`,
  value: item.name,
}));

/**
 * Formats data from the Staff sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Staff sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatStaff = (data) => data.map((item) => {
  const formattedName = item.name.toLowerCase().replace(/\s+/g, '-');
  return {
    display: `${item.name} - Sales Agent`,
    value: item.name,
    path: `/contact-us/sales-team#${formattedName}`
  };
});

/**
 * Formats data from the Sales Offices sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Sales Offices sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatSalesOffices = (data) => data.map((item) => ({
  display: `${item.name} - Sales Office`,
  value: item.name,
}));

/**
 * Formats data from the Models sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Models sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatModels = (data) => data.map((item) => ({
  display: `${item['model name']} - ${item[
    'home style'
  ].toLowerCase()} home in ${item.community}`,
  value: item['model name'],
  path: item.path,
}));

/**
 * Formats data from the Inventory sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Inventory sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatInventory = (data) => data.map((item) => ({
  display: `${item.address} - MLS ${item.mls} - ${item.status} plan`,
  value: item.address,
  path: item.path,
}));

/**
 * Throttle function to limit the rate at which a function can be executed.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The number of milliseconds to wait
 * before allowing the function to be called again.
 * @returns {Function} The throttled function.
 */
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};
