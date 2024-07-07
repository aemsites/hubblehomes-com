import { getHomePlansSheet } from './workbook.js';

async function getHomePlanByPath(path) {
  const plans = await getHomePlansSheet('data');
  return plans.find((plan) => plan.path === path);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  getHomePlanByPath,
};
