window.hh = window.hh || {};
const { hh } = window;

/**
 * Fetches the models data.
 *
 * @returns {Promise<Array>} The list of models.
 * @throws {Error} If the fetch request fails.
 */
async function getModels() {
  if (hh.models) {
    return hh.models;
  }

  const response = await fetch('/data/hubblehomes.json?sheet=models');
  if (response.ok) {
    const models = await response.json();
    hh.models = models.data;
    return models.data;
  }

  throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
}

/**
 * Retrieves models that belong to a specific community.
 *
 * @param {string} communityName - The name of the community.
 * @returns {Promise<Array>} The list of models for the specified community.
 */
async function getModelsByCommunity(communityName) {
  const models = await getModels();
  return models.filter((model) => model.community === communityName);
}

/**
 * Retrieves the image URL for a specific model.
 *
 * @param {string} modelName - The name of the model.
 * @returns {Promise<string>} The image URL for the specified model.
 */
async function getModelImage(modelName) {
  const models = await getModels();
  const desiredModel = models.find((model) => model.name === modelName);
  return desiredModel ? desiredModel.image : null;
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
  const communityNames = models
    .filter((model) => model['model name'].trim().toLowerCase() === modelName.trim().toLowerCase())
    .map((model) => model.community)
    .filter((community, index, self) => self.indexOf(community) === index); // Remove duplicates

  return communityNames;
}

export {
  getModels,
  getModelsByCommunity,
  getModelImage,
  getCommunitiesForModel,
};
