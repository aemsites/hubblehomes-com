import {
  div, h3, a, img,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function decorateAbout(col, index) {
  const h2 = col.querySelector('h2');
  const h3s = col.querySelectorAll('h3');
  const newCol = document.createDocumentFragment();

  // Create header row
  const headerRow = div({ class: 'header-row' });
  headerRow.appendChild(h2);

  // Add expand icon
  const iconSrc = index % 2 === 0 ? '/icons/angle-right-white.svg' : '/icons/angle-right-black.svg';
  const expandIcon = img({
    class: 'expand-icon',
    src: iconSrc,
    alt: 'Expand',
  });
  headerRow.appendChild(expandIcon);

  newCol.appendChild(headerRow);

  // Create content wrapper
  const contentWrapper = div({ class: 'column-content' });

  // create cards
  h3s.forEach((h) => {
    const h3Text = h.textContent;
    const { href } = h.querySelector('a');
    const imgEl = h.nextElementSibling.querySelector('img');
    const text = h.nextElementSibling.nextElementSibling;
    const card = a(
      { href },
      createOptimizedPicture(imgEl.src, imgEl.alt || h3Text, true, [{ width: '80' }]),
      h3(h3Text),
      text,
    );
    contentWrapper.appendChild(card);
  });

  newCol.appendChild(contentWrapper);

  // clear existing content
  while (col.firstChild) col.removeChild(col.firstChild);

  // append new
  col.appendChild(newCol);

  // Add expand/collapse functionality
  headerRow.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.innerWidth < 900) {
      col.classList.toggle('expanded');
    }
  });
}

export default function decorate(block) {
  const blockClasses = block.classList;

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, index) => {
      if (blockClasses.contains('about')) decorateAbout(col, index);

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
