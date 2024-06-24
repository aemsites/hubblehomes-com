import {
  div, li, p, ul,
} from '../../../scripts/dom-helpers.js';
import CardFactory from './CardFactory.js';
import { readBlockConfig } from '../../../scripts/aem.js';

function createCardLoader() {
  const loader = div({ class: 'card-loader' });
  return div({ class: 'wrapper' }, loader);
}

/**
 * Render a list of models given a title for the section block.
 * The code will attempt to inspect the window.hh.models object for a list of models to use
 * as the data source for the cards. If the window.hh.models object is not available then the
 * code will attempt to load the models from the given models url that was specified in the block.
 * @param block
 */
export default async function decorate(block) {
  const {
    community,
  } = readBlockConfig(block);

  const classTokenList = block.classList;
  if (!classTokenList.contains('cards')) {
    return;
  }
  block.innerHTML = '';

  let data;
  // The community is optional, if it is provided then we will only show the models for
  // that community. Otherwise we will look in the hh.current.models for the list of models
  // to display.
  if (community && window.hh.current.models[community]) {
    data = window.hh.current.models[community];
  } else if (window.hh.current.models) {
    data = window.hh.current.models;
  } else {
    data = [];
  }

  // const { models: data } = window.hh.current;

  if (data.length === 0) {
    block.append(p({ class: 'no-results' }, 'Sorry, no homes match your criteria.'));
    return;
  }

  const loaderBox = div({ class: 'grid-loader repeating-grid' });
  for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i += 1) {
    loaderBox.appendChild(createCardLoader());
  }
  block.appendChild(loaderBox);

  const loader = document.querySelector('.grid-loader');
  if (loader) {
    loader.remove();
  }

  const ulEl = ul({ class: 'repeating-grid' });

  const promises = data.map(async (cardData) => {
    const liEl = li({ class: 'model-card' });
    const card = CardFactory.createCard(classTokenList, cardData, community);
    const cardEl = await card.render();
    liEl.appendChild(cardEl);
    ulEl.append(liEl);
  });
  await Promise.all(promises);

  block.appendChild(ulEl);
}
