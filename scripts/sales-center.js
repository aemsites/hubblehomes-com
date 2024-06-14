import getLastUrlSegment from './url-utils.js';

window.hh = window.hh || {};
const { hh } = window;

/**
 * sales-center.js
 *
 * This script contains functions to fetch and process data for page templates.
 * The `loadSalesCenterData` function fetches sales center data.
 */

/**
 * Fetch the sales center data from the given URL.
 * @param {string} url - The URL to load the sales center data from.
 * @returns {Promise<Object>} A promise that resolves to the sales center data as JSON.
 * @throws Will throw an error if the network request fails.
 */
async function loadSalesCenterData(url) {
  if (hh.salescenters) {
    return hh.salescenters;
  }
  const response = await fetch(url);
  if (response.ok) {
    const salesCenters = await response.json();
    hh.salescenters = salesCenters;
    return salesCenters;
  }
  throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
}

/**
 * Fetch the sales center details for a given community URL.
 * @param {string} url - The model URL.
 * @returns {Promise<Object>} A promise that resolves to the sales center details
 * or an empty object if no data is found.
 */
async function getSalesCentersForCommunityUrl(url) {
  const salesAndStaff = await loadSalesCenterData('/data/hubblehomes.json?sheet=sales-offices&sheet=staff');

  if (!salesAndStaff || !url) {
    return {};
  }

  const { 'sales-offices': { data: salesOffices }, staff: { data: salesSpecialists } } = salesAndStaff;
  const urlSlug = getLastUrlSegment(url);
  const salesOfficeDetails = salesOffices.find((office) => office['url-slug'] === urlSlug);

  if (!salesOfficeDetails) {
    return {};
  }

  const { community } = salesOfficeDetails;
  const specialists = community
    ? salesSpecialists.filter((specialist) => Object.keys(specialist).some((key) => key.startsWith('office location') && specialist[key] === community))
    : [];

  return {
    sales_center: {
      phone: salesOfficeDetails['phone-number'],
      name: salesOfficeDetails['sales-center-model'],
      community: salesOfficeDetails.community,
      address: salesOfficeDetails.address,
      city: salesOfficeDetails.city,
      state: salesOfficeDetails.state,
      zip: salesOfficeDetails.zipcode,
      zipCodeAbbr: salesOfficeDetails['zip-code-abbr'],
      model: salesOfficeDetails.models,
      latitude: salesOfficeDetails.latitude,
      longitude: salesOfficeDetails.longitude,
      specialists: specialists.map((specialist) => ({
        name: specialist.name,
        email: specialist.email,
        phone: specialist.phone,
        headshotImage: specialist.headshot,
      })),
    },
  };
}

function getSalesCenterCommunityNameFromUrl(url) {
  const saleCenters = hh.salescenters;
  if (!saleCenters) {
    return '';
  }

  const { 'sales-office': { data: salesOffices } } = saleCenters;
  const urlSlug = getLastUrlSegment(url);
  const salesOfficeDetails = salesOffices.find((office) => office['url-slug'] === urlSlug);
  return salesOfficeDetails ? salesOfficeDetails.community : '';
}

/**
 * Fetches the sales center details for a given community.
 *
 * @param {string} community - The name of the community.
 * @returns {Promise<Object>} The sales office details for the community, or an empty object if not found.
 * @throws {Error} If the data fetching process fails.
 */
async function getSalesCenterForCommunity(community) {
  if (!community) {
    console.error('Community name is required');
    return {};
  }

  try {
    // Load sales center and staff data
    const salesAndStaff = await loadSalesCenterData('/data/hubblehomes.json?sheet=sales-offices&sheet=staff');

    // Check if the data was loaded successfully
    if (!salesAndStaff) {
      console.error('Failed to load sales and staff data');
      return {};
    }

    const salesCenter = hh.salescenters;

    // Check if sales centers are available
    if (!salesCenter) {
      console.error('Sales centers data not available');
      return {};
    }

    const { 'sales-offices': { data: salesOffices } } = salesCenter;

    // Find and return the sales office for the given community
    const salesOffice = salesOffices.find((office) => office.community === community);
    return salesOffice || {};
  } catch (error) {
    console.error('Error fetching sales center data:', error);
    return {};
  }
}
export {
  getSalesCentersForCommunityUrl,
  getSalesCenterCommunityNameFromUrl,
  getSalesCenterForCommunity,
};
