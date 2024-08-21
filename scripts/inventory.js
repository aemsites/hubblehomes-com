import { getHomePlansSheet, getInventorySheet } from './workbook.js';
import { getCityForCommunity } from './communities.js';
import { getSalesCenterForCommunity } from './sales-center.js';
import { filters } from './inventory-filters.js';

/**
 * Loads inventory data from the server.
 * @returns {Promise<Array>} The inventory data.
 * @throws {Error} If the fetch request fails.
 */
async function getInventoryData() {
  const inventory = await getInventorySheet('data');
  return Promise.all(inventory.map(async (home) => {
    home.salesCenter = await getSalesCenterForCommunity(home.community);
    return home;
  }));
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
};
