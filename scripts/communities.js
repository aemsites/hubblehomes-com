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
 * Retrieves the list of unique cities from the communities sheet.
 * @returns {Promise<*>} The list of unique cities.
 */
async function getCitiesForCommunities() {
  const communities = await getCommunitiesSheet('data');
  return communities.reduce((acc, community) => {
    if (!acc.includes(community.city)) {
      acc.push(community.city);
    }
    return acc;
  }, []);
}

export {
  getCommunityForUrl,
  getCommunityDetailsByName,
  getCitiesForCommunities,
};
