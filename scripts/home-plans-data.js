const hh = window.hh || {};

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

// eslint-disable-next-line no-unused-vars
async function getHomePlans() {
  return loadHomePlans();
}

async function getHomePlanImage(modelName) {
  if (!modelName) {
    return undefined; // this could be an image placeholder
  }

  const plans = await loadHomePlans();
  return plans.find((plan) => plan.model.toLowerCase() === modelName.toLowerCase())?.image;
}

export {
  getHomePlans,
  getHomePlanImage,
};
