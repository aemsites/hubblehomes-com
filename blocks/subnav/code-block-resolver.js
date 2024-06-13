import {
  dd, dl, dt,
} from '../../scripts/dom-helpers.js';

/**
 * Builds a list block based on the template and items passed in.
 * @param template
 * @param items
 * @returns {Promise<Element>} The list of key values wrapped in a dl element.
 */
export default async function buildListBlock(template, items) {
  let sheet;
  if (template === 'communities') {
    sheet = await fetch('/data/hubblehomes.json?sheet=communities');
  } else if (template === 'inventory') {
    sheet = await fetch('/data/hubblehomes.json?sheet=inventory');
  }

  if (!sheet) {
    return undefined;
  }

  const sheetJson = await sheet.json();
  const { data } = sheetJson;

  const rowData = data.find((row) => row.path === window.location.pathname);
  if (!rowData) {
    return undefined;
  }

  const dlEl = dl();
  items.forEach((item) => {
    const dtEl = dt(item.label);
    const ddEl = dd(rowData[item.key]);
    dlEl.append(dtEl);
    dlEl.append(ddEl);
  });

  return dlEl;
}
