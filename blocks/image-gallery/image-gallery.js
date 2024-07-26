import { button, div } from '../../scripts/dom-helpers.js';

function buildGallery(block) {
  const pictures = block.querySelectorAll('picture');

  block.innerHTML = '';

  const rowRules = [[0, 0, 1], [0, 0, 0], [1, 0, 0], [0, 0, 0]];
  let currentRulePtr = 0;

  pictures.forEach((picture, index) => {
    if (index !== 0) {
      currentRulePtr = Math.floor((index / 3) % 4);
    }
    const rule = rowRules[currentRulePtr][index % 3];
    const style = rule === 0 ? 'small' : 'large';

    // is the next rule a large rule
    const nextRule = rowRules[currentRulePtr][(index + 1) % 3];
    if (nextRule === 1) {
      picture.classList.add('large-sibling');
    }

    picture.classList.add(style);
  });

  block.append(...pictures);
}

function buildOverlay(block) {
  const overlay = div({ class: 'section overlay full-width', id: 'overlay' });
  overlay.innerHTML = `
    <div class="overlay-content">
      <div class="overlay-header">
        <h1 class="title">Inspiration Gallery</h1>
        <button class="close btn rounded white-outlined"></button>  
      </div>
      <div class='nav-buttons'>
        <button class='prev btn rounded white-outlined'></button>
        <button class='next btn rounded white-outlined'></button>
      </div>
      <img id="overlay-img" src="" alt="">
    </div>
  `;

  const section = document.querySelector('main > .section');
  section.append(overlay);

  const cards = block.querySelectorAll('picture');
  const overlayImg = section.querySelector('#overlay-img');
  const closeBtn = section.querySelector('.close');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      overlayImg.src = card.querySelector('img').src;
      overlay.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export default async function decorate(block) {
  buildGallery(block);
  buildOverlay(block);
}
