window.hh = window.hh || {};
const { hh } = window;

async function loadHomePlans() {
  if (hh.homeplans) {
    return Promise.resolve(hh.homeplans);
  }
  const response = await fetch('/drafts/bhellema/home-plans.json');
  if (response.ok) {
    const plans = await response.json();
    hh.homeplans = plans.data;
    return plans.data;
  }
  throw new Error('Failed to load inventory data');
}

/**
 * Return all the home plans.
 * @returns {Promise<Awaited<*>|*|undefined>}
 */
async function getHomePlans() {
  return loadHomePlans();
}

/**
 * Get the image for the given home plan model.
 * @param modelName
 * @returns {Promise<undefined|boolean|string|*>}
 */
async function getHomePlanImage(modelName) {
  if (!modelName) {
    return undefined;
  }

  const plans = await loadHomePlans();
  return plans.find((plan) => plan.model.toLowerCase() === modelName.toLowerCase())?.image;
}

export {
  getHomePlans,
  getHomePlanImage,
};
