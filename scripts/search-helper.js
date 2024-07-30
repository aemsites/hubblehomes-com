/**
 * Formats data from the Communities sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Communities sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatCommunities = (data) => data.map((item) => ({
  display: `${item.name} - Community`,
  value: item.name,
  path: item.path,
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
    path: `/contact-us/sales-team#${formattedName}`,
  };
});

/**
 * Formats data from the Models sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Models sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatModels = (data) => data.map((item) => ({
  display: `${item['model name']} - Home in ${item.community}`,
  value: item['model name'],
  path: item.path,
}));

/**
 * Formats data from the Inventory sheet for autocomplete.
 * @param {Array} data - The array of data objects from the Inventory sheet.
 * @returns {Array} Formatted suggestions.
 */
export const formatInventory = (data) => data.map((item) => ({
  display: `${item['model name']} - ${item.address} - MLS ${item.mls}`,
  value: item.address,
  path: item.path,
}));

export const formatHomePlans = (data) => data.map((item) => ({
  display: `${item['model name']} - Floor Plan`,
  value: item['model name'],
  path: item.path,
}));

export const formatCities = (data) => data.map((item) => ({
  display: `${item.state} - ${item.name}`,
  value: item.name,
  path: item.path,
}));

// Function to handle keydown events for navigation
export function handleSearchNav(e) {
  const autocompleteList = document.querySelector('#autocomplete-list');
  const items = autocompleteList.querySelectorAll('.search-item');
  if (!items.length) return;

  let newIndex;
  const activeItem = document.querySelector('.search-item.active');

  switch (e.key) {
    case 'Enter':
      if (activeItem) {
        e.preventDefault();
        activeItem.querySelector('a').click();
      }
      break;
    case 'Tab':
      e.preventDefault();
      autocompleteList.innerHTML = '';
      document.querySelector('#search').focus();
      break;
    case 'ArrowDown':
      e.preventDefault();
      newIndex = activeItem ? Array.from(items).indexOf(activeItem) + 1 : 0;
      break;
    case 'ArrowUp':
      e.preventDefault();
      newIndex = activeItem ? Array.from(items).indexOf(activeItem) - 1 : items.length - 1;
      break;
    default:
      e.preventDefault();
      return;
  }

  if (newIndex !== undefined && newIndex >= 0 && newIndex < items.length) {
    if (activeItem) activeItem.classList.remove('active');
    items[newIndex].classList.add('active');
    items[newIndex].focus();
  }
}
