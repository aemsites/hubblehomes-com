import { fetchPlaceholders, getMetadata, toCamelCase } from '../../scripts/aem.js';
import buildListBlock from './code-block-resolver.js';
import { a, div } from '../../scripts/dom-helpers.js';

function makeActive(event) {
  // reset all buttons and remove the active and in.
  const currentActive = document.querySelector('.subnav-container-item.active');
  // if there's some reason we can't find the active container, just return
  let currentIndex;
  if (currentActive) {
    currentIndex = currentActive.dataset.containerIndex;
    currentActive.classList.remove('active', 'up', 'down');
  }

  const nextIndex = event.target.dataset.btnIndex;

  if (currentIndex === nextIndex) {
    return;
  }

  const nextContainer = document.querySelector(`.subnav-container-item[data-container-index="${nextIndex}"]`);
  if (nextContainer) {
    setTimeout(() => {
      nextContainer.classList.add('active');
    }, 200);
  }
}

/**
 * For each code block, generate a object that contains a key being the label of the column,
 * and the values are the keys specified by the author.
 * <code>
 * {
 *    overview: [{label: 'Overview', key: 'overview'}, ...],
 *    'interactive sitemap': [{label: 'Interactive Sitemap', key: 'interactive_sitemap'}, ...],
 * }
 * </code>
 *
 * Each item has a label (column 1) and a keys (column 2).  The labels are fetched from the
 * placeholders and the keys are the values that will be used to fetch the data from
 * the spreadsheet.
 * @param els - the code blocks
 * @param placeholders - the placeholders
 * @returns {*}
 */
function getBlockItems(els, placeholders) {
  return els.reduce((blocks, codeEl) => {
    // each item here is a column with a list of keys
    const label = codeEl.querySelector('p').textContent;
    blocks[label] = [];
    const code = codeEl.querySelector('code').textContent;
    const keys = code.trim().split(',');

    keys.forEach((keyItem) => {
      blocks[label].push({
        label: placeholders[toCamelCase(keyItem.trim())],
        key: keyItem.trim(),
      });
    });

    return blocks;
  }, {});
}

export default async function decorate(block) {
  const template = getMetadata('template');

  // this container will be used to display the data when buttons are clicked
  const container = div({ class: 'subnav-container' });

  const buttonLabels = block.querySelectorAll('div > div:first-of-type > p');

  // for each column we need to create a button, the content will be placed
  // into a div container that will be used to display the data when buttons are clicked
  const buttons = [];

  let index = 0;
  buttonLabels.forEach((el) => {
    buttons.push(a({ class: 'btn light-gray square', 'data-btn-index': index, onclick: (e) => makeActive(e) }, el.textContent));
    index += 1;
  });

  // the placeholders contain the labels for the columns
  const placeholders = await fetchPlaceholders();

  // build out the list of items that have been identified as code blocks.
  // these items need to fetch the data from the spreadsheet
  const els = [...block.querySelectorAll('.subnav > div:has(code)')];
  const codeBlockItems = getBlockItems(els, placeholders);

  index = 0;
  // eslint-disable-next-line max-len
  const blocks = await Promise.all(Object.values(codeBlockItems).map((items) => buildListBlock(template, items)));
  blocks.forEach((b) => {
    container.append(div({ class: 'subnav-container-item', 'data-container-index': index }, b));
    index += 1;
  });

  block.innerHTML = '';

  block.append(div({ class: 'fluid-flex' }, ...buttons));
  container.querySelector('.subnav-container-item').classList.add('active');
  block.append(container);
}
