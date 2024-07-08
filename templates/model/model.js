import {
  aside,
  div,
  h4,
  h1, br,
} from '../../scripts/dom-helpers.js';
import { createTemplateBlock, safeAppend } from '../../scripts/block-helper.js';
import { loadWorkbook } from '../../scripts/workbook.js';
import { getInventoryHomesByCommunities } from '../../scripts/inventory.js';
import { buildBlock, decorateBlock } from '../../scripts/aem.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';
import { getSalesCenterForCommunity } from '../../scripts/sales-center.js';
import { loadRates } from '../../scripts/mortgage.js';
import { getModelByPath } from '../../scripts/models.js';
import { loadTemplate } from '../../scripts/scripts.js';

async function fetchRequiredPageData() {
  await loadWorkbook();
  await loadRates();
  return getModelByPath(window.location.pathname);
}

async function createRightAside(doc, homePlan) {
  const modelName = homePlan['model name'];
  const availableAt = await createTemplateBlock('available-at-locations', [['model', modelName]]);
  return div(availableAt, br(), doc.querySelector('.links-wrapper'));
}

async function buildInventoryCards(inventoryHomes, community) {
  window.hh.current.models = window.hh.current.models || {};
  window.hh.current.models[community] = inventoryHomes;
  window.hh.current.sale_center = window.hh.current.sale_center || {};
  window.hh.current.sale_center[community] = await getSalesCenterForCommunity(community);
  const modelsBlock = buildBlock('cards', [['community', community]]);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadTemplateBlock(modelsBlock);
  return blockWrapper;
}

async function buildAccordion(model) {
  const homesByCommunity = await getInventoryHomesByCommunities(model);
  if (Object.keys(homesByCommunity).length === 0) {
    return undefined;
  }

  const content = [];

  const communityName = Object.keys(homesByCommunity);

  await Promise.all(communityName.map(async (community) => {
    const models = await buildInventoryCards(homesByCommunity[community], community);
    content.push([`View All ${model} Quick-Delivery Homes in ${community}`, models]);
  }));

  const block = buildBlock('accordion', content);
  const wrapper = div(block);
  wrapper.classList.add('section');
  decorateBlock(block);
  await loadTemplateBlock(block);
  return wrapper;
}

export default async function decorate(doc) {
  await loadTemplate(doc, 'default');
  const homePlan = await fetchRequiredPageData();
  const rightAside = await createRightAside(doc, homePlan);

  const mainSectionEl = doc.querySelector('main > .section');
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const overview = doc.querySelector('.overview-wrapper');
  const matterport = doc.querySelector('.embed-wrapper');
  if (matterport) {
    matterport.classList.add('section');
  }

  const descriptionWrapper = doc.querySelector('.description-wrapper');
  const elevations = doc.querySelector('.elevations-wrapper');
  if (elevations) {
    elevations.classList.add('section');
  }

  const actionButtons = doc.querySelector('.action-buttons-wrapper');
  if (actionButtons) {
    actionButtons.classList.add('section');
  }

  const tabs = doc.querySelector('.tabs-wrapper');
  if (tabs) {
    tabs.classList.add('section');
  }

  const accordion = await buildAccordion(homePlan['model name']);

  const listingHeader = div(
    { class: 'page-info' },
    h1(`The ${homePlan['model name']}`),
    h4(homePlan['home style']),
  );

  const twoCols = div(
    listingHeader,
    div({ class: 'repeating-grid' }, descriptionWrapper, div(overview)),
  );

  const leftRight = div({ class: 'section' }, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(rightAside),
  ));

  safeAppend(
    mainSectionEl,
    leftRight,
    elevations,
    actionButtons,
    tabs,
    matterport,
    accordion,
    div({ class: 'section disclaimer' }, disclaimer),
  );
}
