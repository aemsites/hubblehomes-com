import {
  readBlockConfig,
} from '../../scripts/aem.js';
import { div, li, ul } from '../../scripts/dom-helpers.js';
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

export default function decorate(block) {
  const {
    models: modelUrl,
    title,
  } = readBlockConfig(block);

  // if the block does not contain the model class then we don't process anything
  const isModel = block.classList.contains('models');
  if (!isModel) {
    return;
  }

  const classTokenList = block.classList;

  block.innerHTML = '';
  // insert placeholder images for google lighthouse ...

  // Create the title bar that identifies the block
  const titleEl = div({ class: 'grey-divider' }, title);
  block.appendChild(titleEl);

  const loaderBox = div({ class: 'grid-loader repeating-grid' });
  for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i += 1) {
    loaderBox.appendChild(createCardLoader());
  }
  block.appendChild(loaderBox);

  // load the json that's associated with the models and iterate over each home
  // and create a card for each home
  const models = window.hh?.inventory || loadModels(modelUrl);

  const loader = document.querySelector('.grid-loader');
  if (loader) {
    loader.remove();
  }

  const ulEl = ul({ class: 'repeating-grid' });
  models.forEach(async (model) => {
    const liEl = li({ class: 'model-card' });
    const card = CardFactory.createCard(classTokenList, model);
    const rendered = await card.render();
    liEl.appendChild(rendered);
    ulEl.append(liEl);
  });
  block.appendChild(ulEl);
}
