import { fetchPlaceholders, getMetadata, toCamelCase } from '../../scripts/aem.js';
import { getCommunitiesSheet, getInventorySheet } from '../../scripts/workbook.js';
import buildCodeBlockListItems from './code-block-resolver.js';

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
  const codeBlockEls = [...block.querySelectorAll(':scope > div:has(code)')];

  block.innerHTML = '';
  const codeBlockItems = getBlockItems(codeBlockEls, placeholders);
  const blocks = await Promise.all(Object.values(codeBlockItems).map(
    (items) => buildCodeBlockListItems(sheetData, items),
  ));

  block.append(...blocks);
}
