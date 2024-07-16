import { a, div } from '../../scripts/dom-helpers.js';
import {
  getMetadata,
} from '../../scripts/aem.js';
import {
  getCommunitiesForRegion,
  getCommunitiesInCity, getCommunitiesForState,
} from '../../scripts/communities.js';
import { loadWorkbook } from '../../scripts/workbook.js';
import renderCards from '../blocks/cards/Card.js';

/**
 * Return true if the current page is a city page, false otherwise.
 * @returns {boolean}
 */
function isCity() {
  return window.location.pathname.split('/').length === 5;
  // FYI:
  // region - return window.location.pathname.split('/').length === 4;
  // state - return window.location.pathname.split('/').length === 3;
}

function renderTitle(community) {
  // remove the last segment of the path to expose the community path
  const url = community.path.split('/').slice(0, -1).join('/');

  return div({ class: 'grey-divider full-width' }, a({ href: url }, community.city));
}

async function renderCard(mainSection, city) {
  const communities = await getCommunitiesInCity(city);
  const filterSectionTitle = renderTitle(communities[0]);
  mainSection.append(filterSectionTitle);
  const cards = await renderCards('community', communities);
  filterSectionTitle.insertAdjacentElement('afterend', cards);
}

/**
 * Render the cards that are associated with the city page.
 * @param mainSection - The document to render the cards in.
 * @returns {Promise<void>} The promise that resolves when the cards are rendered.
 */
async function renderCity(mainSection) {
  const city = getMetadata('city');
  await renderCard(mainSection, city);
}

/**
 * Render the cards that are associated with the state or region page.
 * @param mainSection - The document to render the cards in.
 * @returns {Promise<void>} The promise that resolves when the cards are rendered.
 */
async function renderStateAndRegion(mainSection) {
  // regions will have both state and region, while state pages will only have a state
  const region = getMetadata('region');
  const state = getMetadata('state');

  const fetchCommunities = region ? getCommunitiesForRegion : getCommunitiesForState;
  const location = region || state;

  // fetch the region or state communities based on the metadata
  const cities = await fetchCommunities(location);

  await Promise.all(cities.map(async (city) => {
    await renderCard(mainSection, city);
  }));
}

export default async function decorate(doc) {
  // load the workbook so that everything is cached
  await loadWorkbook();

  const mainSection = doc.querySelector('main .section');

  if (isCity()) {
    await renderCity(mainSection);
  } else {
    await renderStateAndRegion(mainSection);
  }
}
