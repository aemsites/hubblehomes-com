import { div } from '../../scripts/dom-helpers.js';
import registerTouchHandlers from '../carousel/carousel-touch.js';

let animating = false;
let currentSlideIndex = 0;

/**
 * Builds a gallery layout for all images.  This is the main UI for the gallery.
 * @param block - The block element to build the gallery in.
 */
function buildPicturesForGallery(block) {
  const pictures = block.querySelectorAll('picture');
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

  return pictures;
}

function animateAsync(element, keyframes, options) {
  return new Promise((res) => {
    element.animate(keyframes, options);
    setTimeout(res, options.duration || 0);
  });
}

function navigateSlide(index, duration = 300) {
  const next = document.querySelector('.next');
  const prev = document.querySelector('.prev');
  const imageContainer = document.querySelector('.image-container');
  next.disabled = index === imageContainer.children.length - 1;
  prev.disabled = index === 0;

  if (index === currentSlideIndex || animating) return;

  animating = true;
  const currentSlide = imageContainer.children[currentSlideIndex];
  const nextSlide = imageContainer.children[index];

  const pos = index > currentSlideIndex ? '-100%' : '100%';

  Promise.all([
    animateAsync(nextSlide, [
      { transform: `translate(${parseInt(pos, 10) * -1}%, 0)` },
      { transform: 'translate(0, 0)' },
    ], { duration, easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)', fill: 'forwards' }),
    animateAsync(currentSlide, [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${pos}, 0)` },
    ], { duration, easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)', fill: 'forwards' }),
  ]).then(() => {
    currentSlideIndex = index;
    currentSlide.classList.remove('active');
    nextSlide.classList.add('active');
    animating = false;
  });
}

function buildOverlay(block) {
  const overlay = div({ class: 'section overlay full-width' });
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
      <div class="image-container">
      </div>
    </div>`;

  const pictures = block.querySelectorAll('picture');

  const nextBtn = overlay.querySelector('.next');
  nextBtn.addEventListener('click', () => {
    navigateSlide(Math.min(currentSlideIndex + 1, pictures.length - 1));
  });

  const prev = overlay.querySelector('.prev');
  prev.addEventListener('click', () => {
    navigateSlide(Math.max(0, currentSlideIndex - 1));
  });

  const section = document.querySelector('main > .section');
  section.append(overlay);

  const imageContainer = section.querySelector('.image-container');

  registerTouchHandlers(
    imageContainer,
    () => navigateSlide(Math.max(0, currentSlideIndex - 1)),
    () => navigateSlide(Math.min(currentSlideIndex + 1, pictures.length - 1)),
  );

  const closeBtn = section.querySelector('.close');

  pictures.forEach((picture, index) => {
    const clonedPicture = picture.cloneNode(true);
    if (index === currentSlideIndex) clonedPicture.classList.add('active');
    imageContainer.append(clonedPicture);

    picture.addEventListener('click', () => {
      const item = Array.from(pictures).findIndex((p) => p === picture);
      navigateSlide(item, 0);
      overlay.classList.add('show');
      document.body.classList.add('no-scroll');
    });
  });

  closeBtn.addEventListener('click', () => {
    pictures.forEach((card) => {
      card.classList.remove('active');
    });
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    document.querySelector('#chat-widget-container').style.visibility = 'hidden';
  });
}

export default async function decorate(block) {
  const pictures = buildPicturesForGallery(block);
  block.innerHTML = '';

  block.append(...pictures);
  buildOverlay(block);
}
