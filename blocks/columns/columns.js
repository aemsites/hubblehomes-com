/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { h3, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function decorateAbout(block) {
  block.classList.add('fluid-flex');

  // get colums div
  const columns = block.querySelectorAll('div > div > div > div > div');

  columns.forEach((col) => {
    const h2 = col.querySelector('h2');
    const h3s = col.querySelectorAll('h3');
    const newCol = document.createDocumentFragment();
    newCol.appendChild(h2);

    // create cards
    h3s.forEach((h) => {
      const h3Text = h.textContent;
      const { href } = h.querySelector('a');
      const img = h.nextElementSibling.querySelector('img');
      const text = h.nextElementSibling.nextElementSibling;
      const card = a({ href },
        createOptimizedPicture(img.src, img.alt || h3Text, true, [{ width: '80' }]),
        h3(h3Text),
        text,
      );
      newCol.appendChild(card);
    });

    // clear existing content
    while (col.firstChild) col.removeChild(col.firstChild);

    // append new
    col.appendChild(newCol);
  });
}

export default function decorate(block) {
  const c = block.classList;
  if (c.contains('about')) decorateAbout(block);

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
