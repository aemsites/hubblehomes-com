window.hh = window.hh || {};
const { hh } = window;

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

async function getModelImage(modelName) {
  const models = await getModels();
  return models.find((model) => model.name === modelName).image;
}

export {
  getModels,
  getModelImage,
};
