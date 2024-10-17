import { getCommunitiesSheet } from './workbook.js';
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

export {
  getCommunityForUrl,
  getCommunityDetailsByName,
  getCitiesInCommunities,
  getCityForCommunity,
  getCommunitiesInCity,
  getCommunitiesByCityForState,
  getCommunitiesByCityForRegion,
};
