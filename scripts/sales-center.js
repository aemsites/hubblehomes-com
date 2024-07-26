import getLastUrlSegment from './url-utils.js';
import { getSalesOfficesSheet, getStaffSheet } from './workbook.js';

/**
 * Fetch the sales center details for a given community URL.
 * @param {string} url - The model URL.
 * @returns {Promise<Object>} A promise that resolves to the sales center details
 * or an empty object if no data is found.
 */
async function getSalesCentersForCommunityUrl(url) {
  const salesOffices = await getSalesOfficesSheet('data');
  const staff = await getStaffSheet('sales');

  if (!url) {
    return {};
  }

  const urlSlug = getLastUrlSegment(url);
  const salesOfficeDetails = salesOffices.find((office) => office['url-slug'] === urlSlug);

  if (!salesOfficeDetails) {
    return {};
  }

  const { community } = salesOfficeDetails;
  const specialists = community
    ? staff.filter((specialist) => Object.keys(specialist)
      .some((key) => key.startsWith('office location') && specialist[key] === community))
    : [];

  return {
    sales_center: {
      ...salesOfficeDetails,
      specialists: specialists.map((specialist) => ({
        name: specialist.name,
        email: specialist.email,
        phone: specialist.phone,
        headshotImage: specialist.headshot,
      })),
    },
  };
}

async function getSalesCenterCommunityNameFromUrl(url) {
  const salesOffices = await getSalesOfficesSheet('data');
  const urlSlug = getLastUrlSegment(url);
  const salesOfficeDetails = salesOffices.find((office) => office['url-slug'] === urlSlug);
  return salesOfficeDetails ? salesOfficeDetails.community : '';
}

/**
 * Return the sales office details for a given community name.
 *
 * @param {string} community - The name of the community.
 * @returns {Promise<Object>} The sales office details for the community,
 * or an empty object if not found.
 */
async function getSalesCenterForCommunity(community) {
  const salesOffices = await getSalesOfficesSheet('data');
  const salesOffice = salesOffices.find((office) => office.community === community);
  return salesOffice || {};
}

export {
  getSalesCentersForCommunityUrl,
  getSalesCenterCommunityNameFromUrl,
  getSalesCenterForCommunity,
};
