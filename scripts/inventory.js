import { getModels } from './models.js';

window.hh = window.hh || {};
const { hh } = window;

const filters = [
  {
    filter: 'status',
    value: '',
    label: 'All Listings',
    headerTitle: 'All New Home Listings',
  },
  {
    filter: 'status',
    value: 'quick-delivery',
    label: 'Quick Delivery',
    headerTitle: 'Quick Delivery Homes',
    rule: (models) => models.filter((model) => model.status === 'Quick Delivery'),
  },
  {
    filter: 'status',
    value: 'ready-now',
    label: 'Ready Now',
    headerTitle: 'Move-In Ready Homes',
    rule: (models) => models.filter((model) => model.status === 'Ready Now'),
  },
  {
    filter: 'status',
    value: 'under-construction',
    label: 'Under Construction',
    headerTitle: 'Under Construction Homes',
    rule: (models) => models.filter((model) => model.status === 'Under Construction'),
  },
  {
    filter: 'status',
    value: 'to-be-built',
    label: 'To Be Built',
    headerTitle: 'To Be Built Homes',
    rule: (models) => models.filter((model) => model.status === 'To Be Built'),
  },
  {
    filter: 'sortBy',
    value: '',
    label: 'Sort By',
  },
  {
    filter: 'sortBy',
    value: 'pricesasc',
    label: 'Price - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.pricing, 10) - parseInt(b.pricing, 10)),
  },
  {
    filter: 'sortBy',
    value: 'pricedesc',
    label: 'Price - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.pricing, 10) - parseInt(a.pricing, 10)),
  },
  {
    filter: 'sortBy',
    value: 'totalsquarefeetasc',
    label: 'Sq Ft - Low to High',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(a.squarefeet, 10) - parseInt(b.squarefeet, 10)),
  },
  {
    filter: 'sortBy',
    value: 'totalsquarefeetdesc',
    label: 'Sq Ft - High to Low',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(b.squarefeet, 10) - parseInt(a.squarefeet, 10)),
  },
  {
    filter: 'sortBy',
    value: 'bedsasc',
    label: 'Beds - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.beds, 10) - parseInt(b.beds, 10)),
  },
  {
    filter: 'sortBy',
    value: 'bedsdesc',
    label: 'Beds - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.beds, 10) - parseInt(a.beds, 10)),
  },
  {
    filter: 'sortBy',
    value: 'bathsasc',
    label: 'Baths - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.baths, 10) - parseInt(b.baths, 10)),
  },
  {
    filter: 'sortBy',
    value: 'bathsdesc',
    label: 'Baths - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.baths, 10) - parseInt(a.baths, 10)),
  },
  {
    filter: 'filterBy',
    value: '',
    label: 'Filter By',
  },
  {
    filter: 'filterBy',
    value: 'beds-3',
    label: '3+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 3),
  },
  {
    filter: 'filterBy',
    value: 'beds-4',
    label: '4+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 4),
  },
  {
    filter: 'filterBy',
    value: 'beds-5',
    label: '5+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 5),
  },
  {
    filter: 'filterBy',
    value: 'beds-6',
    label: '6+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 6),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-1',
    label: 'Under 1500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) <= 1500),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-2',
    label: '1501 - 2000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) > 1500 && parseInt(model.squarefeet, 10) <= 2000),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-3',
    label: '2001 - 2500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) > 2000 && parseInt(model.squarefeet, 10) <= 2500),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-4',
    label: '2501 - 3000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) > 2500 && parseInt(model.squarefeet, 10) <= 3000),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-5',
    label: '3001 - 3500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) > 3000 && parseInt(model.squarefeet, 10) <= 3500),
  },
  {
    filter: 'filterBy',
    value: 'squarefeet-6',
    label: 'Over 3500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model.squarefeet, 10) > 3500),
  },
];

/**
 * Loads inventory data from the server.
 * @returns {Promise<Array>} The inventory data.
 * @throws {Error} If the fetch request fails.
 */
async function loadInventoryData() {
  // Check if the data is already cached
  if (hh.inventory) {
    return hh.inventory;
  }

  const response = await fetch('/data/hubblehomes.json?sheet=inventory');
  if (response.ok) {
    const inventory = await response.json();
    // Cache the data
    hh.inventory = inventory.data;
    return hh.inventory;
  }
  throw new Error(`Failed to fetch inventory data: ${response.statusText}`);
}

/**
 * Maps community to inventory homes
 * @returns {Promise<Map>} A map of communities to their respective homes.
 * @throws {Error} If the fetch request fails or data processing fails.
 */
async function createCommunityInventoryMap() {
  // Load inventory data using the loadInventoryData function
  const inventoryData = await loadInventoryData();
  
  const models = await getModels();

  // Create a map of communities to homes
  const communityMap = new Map();

  inventoryData.forEach((inventoryHome) => {
    // Inject the model image into the inventory home
    const { image } = models.find((model) => model['model name'] === inventoryHome['model name']) || {};
    if (image) {
      inventoryHome.image = image;
    }

    const { community } = inventoryHome;
    if (!communityMap.has(community)) {
      communityMap.set(community, []);
    }
    communityMap.get(community).push(inventoryHome);
  });

  // Cache the community map
  hh.communityInventory = communityMap;
  return hh.communityInventory;
}

/**
 * Given the filter return the associated header title for the filter.
 * @param filterStr
 * @returns {string} the header title for the filter
 */
function getHeaderTitleForFilter(filterStr) {
  const filter = filters.find((f) => f.value === filterStr);
  if (!filter) {
    return filters[0].headerTitle;
  }
  return filter.headerTitle || filters[0].headerTitle;
}

/**
 * Retrieves the inventory homes for a specific community and filter.
 * @param {string} community - The name of the community.
 * @param {string} filterStr - The filter string.
 * @returns {Promise<Array>} The filtered inventory homes for the community.
 */
async function getInventoryHomes(community, filterStr) {
  const inventory = await createCommunityInventoryMap();
  if (filterStr) {
    const filter = filters.find((f) => f.value === filterStr);
    return filter.rule(inventory.get(community));
  }

  return inventory.get(community);
}

/**
 * Retrieves an inventory home by its path.
 * @param {string} path - The path of the home.
 * @returns {Promise<Object>} The inventory home.
 * @throws {Error} If the fetch request fails.
 */
async function getInventoryHomeByPath(path) {
  try {
    const inventory = await loadInventoryData();
    return inventory.find((home) => home.path === path);
  } catch (error) {
    return {};
  }
}

export {
  getInventoryHomes,
  getInventoryHomeByPath,
  getHeaderTitleForFilter,
  filters,
};
