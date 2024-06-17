import { fetchPlaceholders, getMetadata, toCamelCase } from '../../scripts/aem.js';
import buildCodeBlockListItems from './code-block-resolver.js';
import { a, div } from '../../scripts/dom-helpers.js';

function makeActive(event) {
  const currentActive = document.querySelector('.subnav-container-item.active');
  const currentActiveIndex = currentActive.dataset.containerIndex;
  const nextIndex = event.target.dataset.btnIndex;

  if (currentActiveIndex === nextIndex) {
    return;
  }

  // remove the active class from the current active button and container
  document.querySelector(`[data-btn-index="${currentActiveIndex}"]`).classList.remove('active');

  if (currentActive) {
    currentActive.classList.remove('active');
  }

  // update the active class for the button that was clicked
  event.target.classList.add('active');

  // update the next container to be active
  const nextContainer = document.querySelector(`.subnav-container-item[data-container-index="${nextIndex}"]`);
  if (nextContainer) {
    nextContainer.classList.add('active');
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

async function loadSheetData(template) {
  let sheet;
  if (template === 'communities') {
    sheet = await fetch('/data/hubblehomes.json?sheet=communities');
  } else if (template === 'inventory') {
    sheet = await fetch('/data/hubblehomes.json?sheet=inventory');
  }

  if (!sheet) {
    return undefined;
  }

  const jsonSheetData = await sheet.json();
  return jsonSheetData.data;
}

function buildNavButtons(buttonLabels) {
  // for each column we need to create a button, the content will be placed
  // into a div container that will be used to display the data when buttons are clicked
  const buttons = [];
  let index = 0;
  buttonLabels.forEach((el) => {
    const styles = ['btn', 'light-gray', 'square'];
    if (index === 0) { styles.push('active'); }
    buttons.push(a({ class: [...styles], 'data-btn-index': index, onclick: (e) => makeActive(e) }, el.textContent));
    index += 1;
  });

  return buttons;
}

/**
 * When using subnav, the block will look for a div with the class of subnav-detail-container to
 * add the content into.  If no div is found, a default div will be created and appended to the
 * block.
 *
 * @param block
 * @returns {Promise<void>}
 */
export default async function decorate(block) {
  block.style.visibility = 'hidden';

  const template = getMetadata('template');
  // build out the list of items that have been identified as code blocks.
  // these items need to fetch the data from the spreadsheet
  const codeBlockEls = [...block.querySelectorAll('.subnav > div:has(code)')];
  const nonCodeBlocksEls = [...block.querySelectorAll('.subnav > div:not(:has(code))')];
  const buttonLabels = block.querySelectorAll('div > div:first-of-type > p');
  const placeholders = await fetchPlaceholders();

  block.innerHTML = '';

  const buttons = buildNavButtons(buttonLabels);
  const codeBlockItems = getBlockItems(codeBlockEls, placeholders);

  // this container will be used to display the data when buttons are clicked
  const itemContainer = div({ class: 'subnav-item-container' });

  const sheetData = await loadSheetData(template);

  // for each column that has a code block, that row will be rendered as a dl - dt, dd.
  const blocks = await Promise.all(Object.values(codeBlockItems).map(
    (items) => buildCodeBlockListItems(sheetData, items),
  ));

  let index = 0;

  blocks.forEach((b) => {
    // the index will map to the button that was clicked, which allows us to control the display
    const styles = ['subnav-container-item'];
    if (index === 0) { styles.push('active'); }
    itemContainer.append(div({ class: styles, 'data-container-index': index }, b));
    index += 1;
  });

  nonCodeBlocksEls.forEach((el) => {
    el.querySelector(':scope > div').remove();
    itemContainer.append(div({ class: 'subnav-container-item', 'data-container-index': index }, el));
    index += 1;
  });

  block.append(div({ class: 'fluid-flex' }, ...buttons));

  const container = document.querySelector('.subnav-detail-container');
  if (!container) {
    block.append(div({ class: 'subnav-detail-container' }, itemContainer));
  } else {
    document.querySelector('.subnav-detail-container').appendChild(itemContainer);
  }

  block.style.visibility = 'visible';
}
