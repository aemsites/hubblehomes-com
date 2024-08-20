import { getHomePlansSheet, getInventorySheet } from './workbook.js';
import { getCityForCommunity } from './communities.js';

const filters = [
  { category: 'label', value: '', label: 'Price' },
  { category: 'label', value: '', label: 'Beds' },
  { category: 'label', value: '', label: 'Baths' },
  { category: 'label', value: '', label: 'City' },
  { category: 'label', value: '', label: 'Square Feet' },
  { category: 'label', value: '', label: 'Cars' },
  { category: 'label', value: '', label: 'Status' },
  { category: 'label', value: '', label: 'Home Type' },
  { category: 'all', value: '', label: 'All' },
  {
    category: 'status',
    value: 'status-*',
    label: 'All Listings',
    headerTitle: 'All New Home Listings',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'filterBy',
    value: '',
    label: 'Filter By',
  },
  {
    category: 'sortBy',
    value: '',
    label: 'Sort By',
  },
  {
    category: 'status',
    value: 'ready-now',
    label: 'Ready Now',
    headerTitle: 'Move-In Ready Homes',
    rule: (models) => models.filter((model) => model.status === 'Ready Now'),
  },
  {
    category: 'status',
    value: 'under-construction',
    label: 'Under Construction',
    headerTitle: 'Under Construction Homes',
    rule: (models) => models.filter((model) => model.status === 'Under Construction'),
  },
  {
    category: 'status',
    value: 'to-be-built',
    label: 'To Be Built',
    headerTitle: 'To Be Built Homes',
    rule: (models) => models.filter((model) => model.status === 'To Be Built'),
  },
  {
    category: 'priceAcsDesc',
    value: 'pricesasc',
    label: 'Price - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.pricing, 10) - parseInt(b.pricing, 10)),
  },
  {
    category: 'priceAcsDesc',
    value: 'pricedesc',
    label: 'Price - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.pricing, 10) - parseInt(a.pricing, 10)),
  },
  {
    category: 'sqftAcsDesc',
    value: 'totalsquarefeetasc',
    label: 'Sq Ft - Low to High',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(a.squarefeet, 10) - parseInt(b.squarefeet, 10)),
  },
  {
    category: 'sqftAcsDesc',
    value: 'totalsquarefeetdesc',
    label: 'Sq Ft - High to Low',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(b.squarefeet, 10) - parseInt(a.squarefeet, 10)),
  },
  {
    category: 'bedsAcsDesc',
    value: 'bedsasc',
    label: 'Beds - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.beds, 10) - parseInt(b.beds, 10)),
  },
  {
    category: 'bedsAcsDesc',
    value: 'bedsdesc',
    label: 'Beds - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.beds, 10) - parseInt(a.beds, 10)),
  },
  {
    category: 'bathsAcsDesc',
    value: 'bathsasc',
    label: 'Baths - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.baths, 10) - parseInt(b.baths, 10)),
  },
  {
    category: 'bathsAcsDesc',
    value: 'bathsdesc',
    label: 'Baths - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.baths, 10) - parseInt(a.baths, 10)),
  },
  {
    category: 'beds',
    value: 'beds-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'beds',
    value: 'beds-3',
    label: '3+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 3),
  },
  {
    category: 'beds',
    value: 'beds-4',
    label: '4+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 4),
  },
  {
    category: 'beds',
    value: 'beds-5',
    label: '5+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 5),
  },
  {
    category: 'beds',
    value: 'beds-6',
    label: '6+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 6),
  },
  {
    category: 'sqft',
    value: 'squarefeet-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'sqft',
    value: 'squarefeet-1',
    label: 'Under 1500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) <= 1500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-2',
    label: '1501 - 2000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 1500 && parseInt(model['square feet'], 10) <= 2000),
  },
  {
    category: 'sqft',
    value: 'squarefeet-3',
    label: '2001 - 2500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 2000 && parseInt(model['square feet'], 10) <= 2500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-4',
    label: '2501 - 3000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 2500 && parseInt(model['square feet'], 10) <= 3000),
  },
  {
    category: 'sqft',
    value: 'squarefeet-5',
    label: '3001 - 3500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 3000 && parseInt(model['square feet'], 10) <= 3500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-6',
    label: 'Over 3500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 3500),
  },
  {
    category: 'price',
    value: 'price-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'price',
    value: 'price-1',
    label: '$300-$399',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 300000
         && parseInt(model.price, 10) <= 399999,
    ),
  },
  {
    category: 'price',
    value: 'price-2',
    label: '$400-$499',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 400000
        && parseInt(model.price, 10) <= 499999,
    ),
  },
  {
    category: 'price',
    value: 'price-3',
    label: '$500-$599',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 500000
        && parseInt(model.price, 10) <= 599999,
    ),
  },
  {
    category: 'price',
    value: 'price-4',
    label: '$600-$699',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 600000
        && parseInt(model.price, 10) <= 699999,
    ),
  },
  {
    category: 'price',
    value: 'price-5',
    label: '$700-$799',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 700000
        && parseInt(model.price, 10) <= 799999,
    ),
  },
  {
    category: 'price',
    value: 'price-8',
    label: '$800-$899',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 800000
        && parseInt(model.price, 10) <= 899999,
    ),
  },
  {
    category: 'price',
    value: 'price-9',
    label: '$900+',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 900000,
    ),
  },
  {
    category: 'cars',
    value: 'cars-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'cars',
    value: 'cars-2',
    label: '2',
    rule: (models) => models.filter((model) => parseInt(model.cars, 10) === 2),
  },
  {
    category: 'cars',
    value: 'cars-3',
    label: '3',
    rule: (models) => models.filter((model) => parseInt(model.cars, 10) === 3),
  },
  {
    category: 'baths',
    value: 'baths-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'baths',
    value: 'baths-2+',
    label: '2+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 2),
  },
  {
    category: 'baths',
    value: 'baths-3+',
    label: '3+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 3),
  },
  {
    category: 'baths',
    value: 'baths-4+',
    label: '4+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 4),
  },
  {
    category: 'homestyle',
    value: 'homestyle-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'homestyle',
    value: '1-story',
    label: '1 Story',
    rule: (models) => models.filter((model) => model['home style'] === '1 Story'),
  },
  {
    category: 'homestyle',
    value: '1.5-story',
    label: '1.5 Story',
    rule: (models) => models.filter((model) => model['home style'] === '1.5 Story'),
  },
  {
    category: 'homestyle',
    value: '2-story',
    label: '2 Story',
    rule: (models) => models.filter((model) => model['home style'] === '2 Story'),
  },
];

/**
 * Loads inventory data from the server.
 * @returns {Promise<Array>} The inventory data.
 * @throws {Error} If the fetch request fails.
 */
async function getInventoryData() {
  return getInventorySheet('data');
}

/**
 * Get the list of inventory homes for each community.
 * {
 *   'Adams Ridge': [
 *   { 'model name': 'The Aspen', 'community': 'Adams Ridge', ... },
 *   ],
 *   'Sera Sol': [
  *   { 'model name': 'The Aspen', 'community': 'Sera Sol', ... },
 *   ],
 * }
 * @returns {Promise<Map>} A map of communities to their respective homes.
 * @throws {Error} If the fetch request fails or data processing fails.
 */
async function createCommunityInventoryMap() {
  // Load inventory data using the loadInventoryData function
  const inventoryData = await getInventoryData();

  const homeplans = await getHomePlansSheet('data');

  // Create a map of communities to homes
  const communityMap = new Map();

  inventoryData.forEach((inventoryHome) => {
    // Inject the home plan image into the inventory home
    const { image } = homeplans.find((model) => model['model name'] === inventoryHome['model name']) || {};
    if (image) {
      inventoryHome.image = image;
    }

    const { community } = inventoryHome;
    if (!communityMap.has(community)) {
      communityMap.set(community, []);
    }
    communityMap.get(community).push(inventoryHome);
  });

  // iterate through all the communities and update the city for each inventory home
  const communityMapEntries = Array.from(communityMap.entries());
  await Promise.all(communityMapEntries.map(async ([community, homes]) => {
    const city = await getCityForCommunity(community);
    homes.forEach((home) => {
      home.city = city;
    });
  }));

  return communityMap;
}

/**
 * Given the filter return the associated header title for the filter.
 * @param filterStr
 * @returns {string} the header title for the filter
 */
function getHeaderTitleForFilter(filterStr) {
  const filter = filters.find((f) => f.value === filterStr);
  if (!filter) {
    return 'All New Home Listings';
  }
  return filter.headerTitle || 'All New Home Listings';
}

/**
 * Flatten the community map to a list of homes.
 * @param communityMap - the community map
 * @returns {U[]} - the list of homes
 */
function flatten(communityMap) {
  if (Array.isArray(communityMap)) return communityMap;

  return Array.from(communityMap)
    .flatMap(([, value]) => Object.values(value));
}

/**
 * Filter the inventory homes based on the filter string.  The filter string is a comma-separated
 * list of filters.  The filters are applied in order and the results are accumulated.
 * @param inventory - the inventory of homes
 * @param community - the community to filter on.
 * @param filterStr - the filter string
 */
function filterHomes(inventory, filterStr, community) {
  // no filtering return everything
  if (!filterStr) {
    return community ? inventory.get(community) : flatten(inventory);
  }

  if (!filterStr) {
    return community ? inventory.get(community) : flatten(inventory);
  }

  const searchFilters = filterStr.split(',');
  return searchFilters.reduce((acc, curr) => {
    const filter = filters.find((f) => f.value === curr);
    return filter ? filter.rule(acc) : acc;
  }, community ? inventory.get(community) : flatten(inventory));
}

/**
 * Retrieves the inventory homes for a specific community and filter.
 * @param {string} community - The name of the community.
 * @param {string} filterStr - The filter string. If empty, all homes are returned. Otherwise,
 * the filterStr should be a single or comma-separated list of values.  The values come from
 * the `filters` array in this module.
 * @returns {Promise<Array>} The filtered inventory homes for the community.
 */
async function getInventoryHomesForCommunity(community, filterStr) {
  const inventory = await createCommunityInventoryMap();
  const filteredItems = filterHomes(inventory, filterStr, community);
  return Promise.resolve(filteredItems);
}

/**
 * Retrieves inventory homes by model name and groups them by community.
 * @param modelName
 * @returns {Promise<*>}
 */
async function getInventoryHomeModelByCommunities(modelName) {
  const inventory = await getInventoryData();
  const filteredInventory = inventory.filter((home) => home['model name'] === modelName);

  return filteredInventory.reduce((acc, home) => {
    const { community } = home;
    if (!acc[community]) {
      acc[community] = [];
    }
    acc[community].push(home);
    return acc;
  }, {});
}

/**
 * Retrieves all inventory homes and apply a filter if provided.
 * @param filter
 * @returns {Promise<Array>}
 */
async function getAllInventoryHomes(filter = '') {
  return getInventoryHomesForCommunity(null, filter);
}

/**
 * Retrieves an inventory home by its path.
 * @param {string} path - The path of the home.
 * @returns {Promise<Object>} The inventory home.
 * @throws {Error} If the fetch request fails.
 */
async function getInventoryHomeByPath(path) {
  try {
    const inventory = await getInventoryData();
    return inventory.find((home) => home.path === path);
  } catch (error) {
    return {};
  }
}

export {
  getAllInventoryHomes,
  getInventoryHomesForCommunity,
  getInventoryHomeModelByCommunities,
  getInventoryHomeByPath,
  getHeaderTitleForFilter,
  filterHomes,
  filters,
};
