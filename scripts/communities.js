import { getCommunitiesSheet, getModelsSheet } from './workbook.js';

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
 * @returns {Promise<*>} The city that the community exists in
 * @param city
 */
async function getCommunitiesInCity(city) {
  const communities = await getCommunitiesSheet('data');
  return communities
    .filter((community) => community.city.toLowerCase() === city.toLowerCase())
    .filter((community) => community.price !== 'Sold Out');
}

/**
 * Return a list of cities located in an area.  For example, the area of Boise Metro
 * contains the city of Boise, Meridian, and Nampa. Therefore, the area of Boise Metro
 * would be passed in as the area parameter. The cities of Boise, Meridian, and Nampa would
 * be returned as a result.
 *
 * @param region - The area to search for.
 * @returns {Promise<*>} The list of cities in the area.
 */
async function getCommunitiesForRegion(region) {
  const communities = await getCommunitiesSheet('data');
  return communities
    .filter((community) => community.region.toLowerCase() === region.toLowerCase())
    .filter((community) => community.price !== 'Sold Out')
    .reduce((acc, community) => {
      if (!acc.includes(community.city)) {
        acc.push(community.city);
      }
      return acc;
    }, []);
}

/**
 * Return the list of communities that are located in a state.
 * For example, the community Mason Creek is located in the area of Boise Metro, in the state of
 * Idaho. Therefore, the state of Idaho would be passed in as the state parameter.
 * The city of Boise would be returned as a result.
 *
 * @param state - The state to search for.
 * @returns {Promise<*>} The list of cities in the state.
 */
async function getCommunitiesForState(state) {
  const communities = await getCommunitiesSheet('data');
  return communities
    .filter((community) => community.state.toLowerCase() === state.toLowerCase())
    .filter((community) => community.price !== 'Sold Out')
    .reduce((acc, community) => {
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
      const min = parseFloat(fieldValues[0].replace(',', ''));
      const max = parseFloat(fieldValues[1].replace(',', ''));
      minMax[field].min = Math.min(minMax[field].min, min);
      minMax[field].max = Math.max(minMax[field].max, max);
    } else {
      minMax[field].min = Math.min(minMax[field].min, model[field]);
      minMax[field].max = Math.max(minMax[field].max, model[field]);
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
  getCommunitiesForRegion,
  getCommunitiesForState,
};
