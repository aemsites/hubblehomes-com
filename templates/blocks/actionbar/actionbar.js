import {
  a, div, form, img, input,
} from '../../../scripts/dom-helpers.js';

const Action = {
  share: {
    src: '/icons/sharethis.svg',
    style: 'share',
    link: '#',
  },
  save: {
    src: '/icons/heart.svg',
    style: 'save',
    link: '#',
  },
  compare: {
    src: '/icons/compare.svg',
    style: 'compare',
    link: '#',
  },
};


export default function decorate(block) {
  const items = [];
  const actions = block.querySelector('p');
  if (actions) {
    actions.textContent.split(',').forEach((action) => {
      const actionName = action.trim();
      const item = div({ class: 'actionbar-item dark-blue' }, a({
        class: `${Action[actionName].style}`,
        href: Action[actionName].link || '#',
        onclick: Action[actionName].onclick,
      }, img({
        src: Action[actionName].src,
      })));
      items.push(item);
    });
  }
  block.innerHTML = '';
  block.append(...items);
}
