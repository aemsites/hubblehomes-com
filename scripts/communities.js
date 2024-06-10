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
 * Given the url attempt to locate the associated community.
 * @param url
 * @return {Promise<*>} the community object, or undefined if not found.
 */
async function getCommunityDetails(url) {
  const communities = await getCommunities();
  return communities.data.find((community) => url.startsWith(community.path));
}

export {
  getCommunityDetails,
};
