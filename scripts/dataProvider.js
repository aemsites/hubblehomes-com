/**
 * dataProvider.js
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Extract the last segment from a given URL.
 * @param {string} url - The URL to extract the last segment from.
 * @returns {string} The extracted last segment.
 */
function getLastUrlSegment(url) {
  const pathname = new URL(url).pathname;
  const sanitizedPathname = pathname.replace(/\/+$/, '');
  const parts = sanitizedPathname.split('/');
  return parts.pop();
}

/**
 * Fetch the sales center details for a given model URL.
 * @param {string} url - The model URL.
 * @returns {Promise<Object>} A promise that resolves to the sales center details or an empty object if no data is found.
 */
async function getSalesCenterDetails(url) {
  const data = await loadSalesCenterData('https://main--hubblehomes-com--aemsites.hlx.live/data/sales-office-and-specialists.json');

  if (!data || !url) {
    return {};
  }

  const { 'sales-office': { data: salesOffices }, specialists: { data: salesSpecialists } } = data;
  const urlSlug = getLastUrlSegment(url);

  const salesOfficeDetails = salesOffices.find((office) => office['url-slug'] === urlSlug);

  if (!salesOfficeDetails) {
    return {};
  }

  const { area } = salesOfficeDetails;
  const specialists = area
    ? salesSpecialists.filter((specialist) => {
      const officeLocationFields = Object.keys(specialist).filter((key) => key.startsWith('office location'));
      return officeLocationFields.some(
        (officeLocationField) => specialist[officeLocationField] === area
      );
    })
    : [];

  return {
    sales_center: {
      phone: salesOfficeDetails['phone-number'],
      name: salesOfficeDetails['sc-name'],
      community: salesOfficeDetails.community,
      address: salesOfficeDetails.address,
      city: salesOfficeDetails['sc-city'],
      state: salesOfficeDetails['sc-state'],
      zip: salesOfficeDetails['sc-zipcode'],
      model: salesOfficeDetails.model,
      latitude: salesOfficeDetails['sc-latitude'],
      longitude: salesOfficeDetails['sc-longitude'],
      specialists: specialists.map((specialist) => ({
        name: specialist.name,
        email: specialist.email,
        phone: specialist.phone,
        headshotImage: specialist.headshot,
      })),
    },
  };
}
