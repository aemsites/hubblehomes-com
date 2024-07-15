import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = row.querySelector('.btn-container a').href;
    a.className = 'card-link';
    while (row.firstElementChild) a.append(row.firstElementChild);
    [...a.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
        const img = div.querySelector('img');
        if (img) {
          const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
          div.querySelector('picture').replaceWith(optimizedPicture);
        }
      } else {
        div.className = 'cards-card-body';
      }
    });
    li.append(a);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
