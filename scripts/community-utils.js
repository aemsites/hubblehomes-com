import { getModelsByCommunity } from './models.js';

/**
 * Given a community name, returns an object containing the min and max values for the following:
 * - square feet
 * - beds
 * - baths
 * - cars
 * @param communityName - The name of the community to search for.
 * @returns {Promise<{cars: {min: number, max: number}, baths: {min: number, max: number},
 * 'square feet': {min: number, max: number}, beds: {min: number, max: number}}>}
 */
async function getCommunityMinMaxDetails(communityName) {
  const communityModels = await getModelsByCommunity(communityName);

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
      const min = parseFloat(fieldValues[0].trim().replace(',', ''));
      const max = parseFloat(fieldValues[1].trim().replace(',', ''));
      minMax[field].min = Math.min(minMax[field].min, min);
      minMax[field].max = Math.max(minMax[field].max, max);
    } else {
      minMax[field].min = Math.min(minMax[field].min, model[field].trim().replace(',', ''));
      minMax[field].max = Math.max(minMax[field].max, model[field].trim().replace(',', ''));
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
  // eslint-disable-next-line import/prefer-default-export
  getCommunityMinMaxDetails,
};
