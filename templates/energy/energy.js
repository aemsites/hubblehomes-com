import { div } from '../../scripts/dom-helpers.js';

/**
 * The buildCards auto blocks out the cards in the tabs.
 * @param doc The document to decorate.
 */
function buildCards(doc) {
  // find all the tabs
  const allTabs = doc.querySelectorAll('.tabs > div');

  allTabs.forEach((tab) => {
    const childrenToRemove = [];
    const cards = [];

    // skip the first child because it's the title of the tab
    Array.from(tab.children).slice(1).forEach((child) => {
      // find all the h2 elements in the child, this can be many
      const h2Elements = child.querySelectorAll('h2');

      // for each h2 there needs to be a P, picture, and HR element
      // the hr element is the end of the card
      h2Elements.forEach((h2El) => {
        childrenToRemove.push(h2El);

        // object to hold the group of elements
        const group = {
          h2El,
          pEl: null,
          pictureEl: null,
        };

        let next = h2El.nextElementSibling;

        // loop through the siblings until we find the next h2 or hr element
        while (next) {
          if (next.tagName === 'P' && !next.querySelector('picture')) {
            group.pEl = next;
            childrenToRemove.push(next);
          } else if (next.querySelector('picture')) {
            group.pictureEl = next.querySelector('picture');
            childrenToRemove.push(next);
          } else if (next.tagName === 'HR') {
            childrenToRemove.push(next);
            break;
          }
          next = next.nextElementSibling;
        }

        // if we have all the elements we need to build the card
        if (group.h2El && group.pEl && group.pictureEl) {
          cards.push(div({ class: 'card' }, group.pictureEl.cloneNode(true), group.h2El.cloneNode(true), group.pEl.cloneNode(true)));
        }
      });
    });

    if (cards.length > 0) {
      // if we have cards we need to remove the original children and add the new cards
      childrenToRemove.forEach((child) => child.remove());
      tab.append(div({ class: 'card-container' }, ...cards));
    }
  });
}

export default async function decorate(doc) {
  buildCards(doc);
}
