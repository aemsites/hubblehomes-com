import {
  dd, dl, dt,
} from '../../scripts/dom-helpers.js';
import { formatPrice } from '../../scripts/currency-formatter.js';

function parseToNumber(str) {
  const number = Number(str.replace(/\$,/g, ''));
  return Number.isNaN(number) ? Number.NaN : number;
}

const ColumnFormatter = {
  price: (value) => formatPrice(value),
  'square feet': (value) => {
    const formatter = new Intl.NumberFormat('en-US');
    return !Number.isNaN(parseToNumber(value)) ? formatter.format(parseFloat(value)) : value;
  },
};

/**
 * Find the associated data for the current page and build a list of key value pairs
 * for the columns provided in the items array.
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
    const value = ColumnFormatter[item.key]
      ? ColumnFormatter[item.key](rowData[item.key])
      : rowData[item.key];
    dlEl.append(dtEl, dd(value));
  });

  return dlEl;
}
