import { fetchPlaceholders, getMetadata, toCamelCase } from '../../scripts/aem.js';
import { getCommunitiesSheet, getInventorySheet } from '../../scripts/workbook.js';
import buildCodeBlockListItems from './code-block-resolver.js';

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

  block.append(...blocks);
}
