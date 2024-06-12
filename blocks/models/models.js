import {
  readBlockConfig,
} from '../../scripts/aem.js';
import {
  div, li, p, ul,
} from '../../scripts/dom-helpers.js';
import CardFactory from './CardFactory.js';

/**
 * Fetch the models from the given url.
 * @param url the url to load the models json from.
 * @returns {Promise<*>} the promise that resolves to the models json.
 */
async function loadModels(url) {
  const path = new URL(url);
  const resp = await fetch(path.pathname);

  if (resp.ok) {
    const modelJson = await resp.json();
    return modelJson.data;
  }
  throw new Error(`Failed to load models from ${url}`);
}

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
    models: modelUrl,
  } = readBlockConfig(block);

  // if the block does not contain the model class then we don't process anything
  const isModel = block.classList.contains('models');
  if (!isModel) {
    return;
  }

  const classTokenList = block.classList;

  block.innerHTML = '';

  const models = window.hh.current.models || await loadModels(modelUrl);

  if (window.hh.current.models && window.hh.current.models.length === 0) {
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

  const promises = models.map(async (model) => {
    const liEl = li({ class: 'model-card' });
    const card = CardFactory.createCard(classTokenList, model);
    const rendered = await card.render();
    liEl.appendChild(rendered);
    ulEl.append(liEl);
  });
  await Promise.all(promises);

  block.appendChild(ulEl);
}
