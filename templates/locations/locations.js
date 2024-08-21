import { a, div } from '../../scripts/dom-helpers.js';
import {
  getMetadata,
} from '../../scripts/aem.js';
import {
  getCommunitiesInCity,
  getCommunitiesByCityForState,
  getCommunitiesByCityForRegion,
} from '../../scripts/communities.js';
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

async function renderCityAndCommunityCards(mainSection, communities, forceRender) {
  const filterSectionTitle = renderTitle(communities[0]);
  mainSection.append(filterSectionTitle);

  if (!forceRender) {
    mainSection.append(div({ class: 'card-container' }));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          sectionObserver.disconnect();
          // console.log(`Intersection observed for community ${filterSectionTitle.textContent}`);
          const cards = await renderCards('community', communities, 1);
          filterSectionTitle.nextSibling.remove();
          filterSectionTitle.insertAdjacentElement('afterend', cards);
        }
      });
    }, {
      rootMargin: '0px',
    });
    sectionObserver.observe(filterSectionTitle);
  } else {
    const cards = await renderCards('community', communities, 5);
    filterSectionTitle.insertAdjacentElement('afterend', cards);
  }
}

/**
 * Render the cards that are associated with the city page.
 * @param mainSection - The document to render the cards in.
 * @returns {Promise<void>} The promise that resolves when the cards are rendered.
 */
async function renderCity(mainSection) {
  const city = getMetadata('city');
  const communities = await getCommunitiesInCity(city);
  const filterSectionTitle = renderTitle(communities[0]);
  mainSection.append(filterSectionTitle);
  const cards = await renderCards('community', communities, 1);
  filterSectionTitle.insertAdjacentElement('afterend', cards);
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

  const fetchCommunities = region ? getCommunitiesByCityForRegion : getCommunitiesByCityForState;
  const location = region || state;

  // fetch the region or state communities based on the metadata
  const communities = await fetchCommunities(location);

  await Promise.all(Object.keys(communities).map(async (cityName, index) => {
    await renderCityAndCommunityCards(mainSection, communities[cityName], index === 0);
  }));
}

export default async function decorate(doc) {
  const mainSection = doc.querySelector('main .section');

  if (isCity()) {
    await renderCity(mainSection);
  } else {
    await renderStateAndRegion(mainSection);
  }
}
