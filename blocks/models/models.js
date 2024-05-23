import {
  readBlockConfig
} from '../../scripts/aem.js';
import {div, li } from '../../scripts/dom-helpers.js'
import CardFactory from "./CardFactory.js";

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
}

export default function decorate(block) {
  const {
    models: modelData,
    title,
  } = readBlockConfig(block);

  // if the block does not contain the model class then we don't process anything
  const isModel = block.classList.contains("models");
  if (!isModel) {
    return;
  }

  const classTokenList = block.classList;

  block.innerHTML = '';

  // Create the title bar that identifies the block
  const titleEl = div({class: 'grey-divider'}, title);
  block.appendChild(titleEl);

  // load the json that's associated with the models and iterate over each home
  // and create a card for each home

  loadModels(modelData).then((models) => {
    const ul = document.createElement('ul');

    models.forEach((model) => {
      const li = document.createElement('li');
      const card = CardFactory.createCard(classTokenList);
      card.setModel(model);
      li.appendChild(card.render());
      ul.append(li);
    });

    block.appendChild(ul);
  });

}

