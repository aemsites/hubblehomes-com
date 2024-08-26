import { getCommunitiesSheet, getModelsSheet } from './workbook.js';
import { getSalesCenterForCommunity } from './sales-center.js';

/**
 * Given a URL, attempts to locate the associated community.
 *
 * @param {string} url - The URL to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function getCommunityForUrl(url) {
  const communities = await getCommunitiesSheet('data');
  const community = communities.find((c) => url.startsWith(c.path));
  if (community) {
    community.salesCenter = await getSalesCenterForCommunity(community.name);
  }
  return community;
}

/**
 * Retrieves community details by the community name.
 *
 * @param {string} communityName - The name of the community to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function getCommunityDetailsByName(communityName) {
  const communities = await getCommunitiesSheet('data');
  const community = communities.find((c) => c.name === communityName);
  if (community) {
    community.salesCenter = await getSalesCenterForCommunity(community.name);
  }
  return community;
}

/**
 * Every community is associated in a city therefore return a unique list of
 * city names that are associated with communities.
 *
 * @returns {Promise<*>} The list of unique cities.
 */
async function getCitiesInCommunities() {
  const communities = await getCommunitiesSheet('data');
  return communities.reduce((acc, community) => {
    if (!acc.includes(community.city)) {
      acc.push(community.city);
    }
    return acc;
  }, []);
}

/**
 * Given a community name, return the city that the community exists in.
 * @returns {Promise<*>} The city that the community exists in
 * @param city
 */
async function getCommunitiesInCity(city) {
  const communities = await getCommunitiesSheet('data');
  const all = communities
    .filter((community) => community.city.toLowerCase() === city.toLowerCase())
    .filter((community) => community.price !== 'Sold Out');

  return Promise.all(all.map(async (community) => {
    community.salesCenter = await getSalesCenterForCommunity(community.name);
    return community;
  }));
}

/**
 * Return all communities in a city for a given state.  Filter out sold out communities.
 * @param state
 * @returns {Promise<void>}
 */
async function getCommunitiesByCityForState(state) {
  const communities = await getCommunitiesSheet('data');
  const all = communities
    .filter((community) => community.state.toLowerCase() === state.toLowerCase())
    .filter((community) => community.price !== 'Sold Out')
    .reduce((acc, community) => {
      if (!acc.includes(community.name)) {
        acc.push(community);
      }
      return acc;
    }, []);

  const result = await Promise.all(all.map(async (community) => {
    community.salesCenter = await getSalesCenterForCommunity(community.name);
    return community;
  }));

  return result.reduce((acc, community) => {
    if (!acc[community.city]) {
      acc[community.city] = [];
    }
    acc[community.city].push(community);
    return acc;
  }, {});
}

async function getCommunitiesByCityForRegion(region) {
  const communities = await getCommunitiesSheet('data');
  const all = communities
    .filter((community) => community.region.toLowerCase() === region.toLowerCase())
    .filter((community) => community.price !== 'Sold Out')
    .reduce((acc, community) => {
      if (!acc.includes(community.name)) {
        acc.push(community);
      }
      return acc;
    }, []);

  const result = await Promise.all(all.map(async (community) => {
    community.salesCenter = await getSalesCenterForCommunity(community.name);
    return community;
  }));

  return result.reduce((acc, community) => {
    if (!acc[community.city]) {
      acc[community.city] = [];
    }
    acc[community.city].push(community);
    return acc;
  }, {});
}

/**
 * Given a community name, return the city that the community exists in.
 * @param communityName - The name of the community to search for.
 * @returns {Promise<*>} The city that the community exists in
 */
async function getCityForCommunity(communityName) {
  const community = await getCommunityDetailsByName(communityName);
  return community.city;
}

async function getCommunityMinMaxDetails(communityName) {
  const models = await getModelsSheet('data');

  const communityModels = models.filter((model) => model.community === communityName);

  if (communityModels.length === 0) {
    return {
      'square feet': { min: 0, max: 0 },
      beds: { min: 0, max: 0 },
      baths: { min: 0, max: 0 },
      cars: { min: 0, max: 0 },
    };
  }

  const minMax = {
    'square feet': { min: Infinity, max: -1 },
    beds: { min: Infinity, max: -1 },
    baths: { min: Infinity, max: -1 },
    cars: { min: Infinity, max: -1 },
  };

  function getValueForField(field, model) {
    const fieldValues = model[field].split('-');
    if (fieldValues.length === 2) {
      const min = parseFloat(fieldValues[0].trim().replace(',', ''));
      const max = parseFloat(fieldValues[1].trim().replace(',', ''));
      minMax[field].min = Math.min(minMax[field].min, min);
      minMax[field].max = Math.max(minMax[field].max, max);
    } else {
      minMax[field].min = Math.min(minMax[field].min, model[field].trim().replace(',', ''));
      minMax[field].max = Math.max(minMax[field].max, model[field].trim().replace(',', ''));
    }
  }

  communityModels.forEach((model) => {
    getValueForField('square feet', model);
    getValueForField('beds', model);
    getValueForField('baths', model);
    getValueForField('cars', model);
  });

  return minMax;
}

export {
  getCommunityForUrl,
  getCommunityDetailsByName,
  getCitiesInCommunities,
  getCityForCommunity,
  getCommunityMinMaxDetails,
  getCommunitiesInCity,
  getCommunitiesByCityForState,
  getCommunitiesByCityForRegion,
};
