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
 * Fetch the sales center details for a given model URL.
 * @param {string} url - The model URL.
 * @returns {Promise<Object>} A promise that resolves to the sales center details
 * or an empty object if no data is found.
 */
async function getSalesCenters(url) {
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

export {
  getSalesCenters,
  getSalesCenterCommunityNameFromUrl,
};
