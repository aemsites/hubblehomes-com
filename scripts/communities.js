window.hh = window.hh || {};
const { hh } = window;

/**
 * Fetch the communities data from the server.
 * @returns {Promise<any>}
 */
async function getCommunities() {
  if (hh.communities) {
    return hh.communities;
  }

  const response = await fetch('/data/hubblehomes.json?sheet=communities');

  if (response.ok) {
    hh.communities = await response.json();
    return hh.communities;
  }

  throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
}

/**
 * Given a URL, attempts to locate the associated community.
 *
 * @param {string} url - The URL to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function fetchCommunityDetailsForUrl(url) {
  const communities = await getCommunities();
  return communities.data.find((community) => url.startsWith(community.path));
}

/**
 * Retrieves community details by the community name.
 *
 * @param {string} communityName - The name of the community to search for.
 * @returns {Promise<Object|undefined>} The community object, or undefined if not found.
 */
async function getCommunityDetailsByName(communityName) {
  const communities = await getCommunities();
  return communities.data.find((community) => community.name === communityName);
}

export {
  fetchCommunityDetailsForUrl,
  getCommunityDetailsByName,
};
