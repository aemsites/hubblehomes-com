import { fetchPlaceholders, getMetadata, toCamelCase } from '../../scripts/aem.js';
import {
  getCommunitiesSheet,
  getHomePlansSheet,
  getInventorySheet, getModelsSheet,
} from '../../scripts/workbook.js';
import buildCodeBlockListItems from './code-block-resolver.js';
import { h3 } from '../../scripts/dom-helpers.js';

function getBlockItems(columns, placeholders) {
  const blocks = {};
  columns.forEach((column) => {
    const key = column.trim();
    blocks[key] = [];
    blocks[key].push({
      label: placeholders[toCamelCase(key)],
      key,
    });
  });
  return blocks;
}

async function loadSheetData(template) {
  let sheet;
  if (template === 'communities') {
    sheet = await getCommunitiesSheet('data');
  } else if (template === 'inventory') {
    sheet = await getInventorySheet('data');
  } else if (template === 'model') {
    sheet = await getModelsSheet('data');
  } else if (template === 'home-plan') {
    sheet = await getHomePlansSheet('data');
  }
  return sheet;
}

export default async function decorate(block) {
  const template = getMetadata('template');
  const sheetData = await loadSheetData(template);
  const placeholders = await fetchPlaceholders();
  const pEl = block.querySelector(':scope p');
  const columns = pEl.textContent.split(',');
  block.innerHTML = '';

  const codeBlockItems = getBlockItems(columns, placeholders);
  const blocks = await Promise.all(Object.values(codeBlockItems).map(
    (items) => buildCodeBlockListItems(sheetData, items),
  ));

  block.append(h3('Overview'), ...blocks);
}
