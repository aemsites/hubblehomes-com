import { div, h3 } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const items = div({ class: 'elevation-items fluid-grid' }, ...block.children);
  block.innerHTML = '';
  block.append(h3('Elevations'), items);
}
