import {
  dd, dl, dt,
} from '../../scripts/dom-helpers.js';

/**
 * Builds a list block based on the template and items passed in.
 * @param data - the data from the spreadsheet
 * @param items - the items to build the list from
 * @returns {Promise<Element>} The list of key values wrapped in a dl element.
 */
export default async function buildListBlock(data, items) {
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
