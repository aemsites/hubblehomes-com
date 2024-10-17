import { getHomePlansSheet, getModelsSheet } from './workbook.js';
import { getCommunityDetailsByName } from './communities.js';
import { getSalesCenterForCommunity } from './sales-center.js';

/**
 * Fetches the models data.
 *
 * @returns {Promise<Array>} The list of models.
 * @throws {Error} If the fetch request fails.
 */
async function getModels() {
  const models = await getModelsSheet('data');
  return Promise.all(models.map(async (model) => {
    if (typeof model.community === 'string') model.salesCenter = await getSalesCenterForCommunity(model.community);
    else model.salesCenter = await getSalesCenterForCommunity(model.community.name);
    return model;
  }));
}

/**
 * Retrieves models that belong to a specific community sorted by price acsending.
 *
 * @param {string} communityName - The name of the community.
 * @returns {Promise<Array>} The list of models for the specified community.
 */
async function getModelsByCommunity(communityName) {
  const models = await getModels();
  const community = await getCommunityDetailsByName(communityName);
  const sortedModels = models.filter((model) => model.community === communityName)
    .sort((f1, f2) => f1.price - f2.price);

  return sortedModels.map((model) => {
    model.community = community;
    return model;
  });
}

/**
 * Given the name of a model, retrieves the image associated with the model.
 * @param modelName
 * @returns {Promise<boolean|string|*|string>}
 */
async function getModelImage(modelName) {
  const models = await getHomePlansSheet('data');
  const m = models.find((model) => model['model name'] === modelName);
  return m ? m.image : '';
}

/**
 * Retrieves the list of communities where a specific model is available.
 *
 * @param {string} modelName - The name of the model.
 * @returns {Promise<Array>} The list of community names where the model is available.
 */
async function getCommunitiesForModel(modelName) {
  const models = await getModels();

  // Filter models by the given modelName and extract community names.
  const communities = models
    .filter((model) => model['model name'].trim().toLowerCase() === modelName.trim().toLowerCase())
    .map((model) => model.community)
    .filter((community, index, self) => self.indexOf(community) === index);

  return Promise.all(communities.map(async (community) => getCommunityDetailsByName(community)));
}

async function getModelByPath(path) {
  const models = await getModels();
  return models.find((model) => model.path === path);
}

export {
  getModels,
  getModelByPath,
  getModelImage,
  getModelsByCommunity,
  getCommunitiesForModel,
};
