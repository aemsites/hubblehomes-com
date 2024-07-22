import { div } from '../../scripts/dom-helpers.js';

function buildCards(doc) {
  const tabs = doc.querySelectorAll('.tabs > .tabs-panel');
  debugger;
  const cards = [];

  tabs.forEach((tab) => {
    const h2Elements = tab.querySelectorAll('h2');

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
        cards.push(div({ class: 'card' }, group.pictureEl, group.h2El, group.pEl));
      }
    });
  });

  return cards;
}

export default async function decorate(doc) {
  const $newPage = div();
  const $page = doc.querySelector('main .section');
  // const $text = $page.querySelector('.default-content-wrapper');
  const specialistsSection = div({ class: 'overview-cards' });
  const cards = buildCards(doc);
  specialistsSection.append(...cards);
  const mainPageContent = div({ class: 'section' }, specialistsSection);
  $newPage.appendChild(mainPageContent);
  $page.appendChild($newPage);
}
