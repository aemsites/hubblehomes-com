import { getCommunitiesSheet } from './workbook.js';

/**
 * Given a URL, attempts to locate the associated community.
 *
 * @param {string} url - The URL to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function getCommunityForUrl(url) {
  const communities = await getCommunitiesSheet('data');
  return communities.find((community) => url.startsWith(community.path));
}

/**
 * Retrieves community details by the community name.
 *
 * @param {string} communityName - The name of the community to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function getCommunityDetailsByName(communityName) {
  const communities = await getCommunitiesSheet('data');
  return communities.find((community) => community.name === communityName);
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
};
