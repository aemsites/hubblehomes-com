import { div } from '../../scripts/dom-helpers.js';

function buildCards(doc) {
  const allTabs = doc.querySelectorAll('.tabs > div');

  allTabs.forEach((tab) => {
    const cards = [];
    const { length } = tab.children;

    // skip the first child because it's the title of the tab
    for (let i = 1; i < length; i += 1) {
      const child = tab.children[i];
      const h2Elements = child.querySelectorAll('h2');

      h2Elements.forEach((h2El) => {
        const group = {
          h2El,
          pEl: null,
          pictureEl: null,
        };

        let next = h2El.nextElementSibling;

        while (next) {
          if (next.tagName === 'P' && !next.querySelector('picture')) {
            group.pEl = next;
          } else if (next.querySelector('picture')) {
            group.pictureEl = next.querySelector('picture');
          } else if (next.tagName === 'HR') {
            break;
          }
          next = next.nextElementSibling;
        }

        if (group.h2El && group.pEl && group.pictureEl) {
          cards.push(div({ class: 'card' }, group.pictureEl.cloneNode(true), group.h2El.cloneNode(true), group.pEl.cloneNode(true)));
        }
      });
    }

    if (cards.length > 0) {
      // nuke the existing content and replace it with the cards
      tab.children[1].innerHTML = '';
      tab.append(div({ class: 'card-container' }, ...cards));
    }
  });
}

export default async function decorate(doc) {
  const $newPage = div();
  const $page = doc.querySelector('main .section');
  buildCards(doc);
  $page.appendChild($newPage);
}
