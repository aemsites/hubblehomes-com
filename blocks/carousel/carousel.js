import {
  div,
  ul,
  li,
  button, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { createGallery, initializeGallery } from './gallery.js';
import registerTouchHandlers from './carousel-touch.js';

let isAuto;
let autoInterval;
let autoDuration = 6000; // default if not set in block
const fadeDuration = 700; // match time in css -> .carousel.fade .slide
let isInitialLoad = true;
const initialLoadDelay = 4000;
let defaultContent;
let isAnimating = false;

function showSlide(block, dir) {
  // wait till current animation is completed
  if (isAnimating) return;
  isAnimating = true;
  const nextSlideIndex = parseInt(block.dataset.activeSlide, 10) + dir;
  block.dataset.activeSlide = nextSlideIndex;
  const $slides = block.querySelectorAll('.slide');

  // handle wrap around
  const activeSlideIndex = (nextSlideIndex + $slides.length) % $slides.length;
  const $activeSlide = $slides[activeSlideIndex];

  const $currentActive = block.querySelector('.active');
  $activeSlide.classList.add('ready');
  // small delay to allow for transition to work
  setTimeout(() => $activeSlide.classList.add('transition'), 10);
  setTimeout(() => {
    $activeSlide.classList.add('active');
    $activeSlide.classList.remove('ready');
    $activeSlide.classList.remove('transition');
    $currentActive.classList.remove('active');
    isAnimating = false;
  }, fadeDuration);
}

// auto slide functions
function startAuto(block) {
  if (!autoInterval) {
    autoInterval = setInterval(() => {
      showSlide(block, 1);
    }, autoDuration);
  }
}

function stopAuto() {
  clearInterval(autoInterval);
  autoInterval = undefined;
}

function resetAuto(block) {
  stopAuto();
  setTimeout(() => startAuto(block), autoDuration);
}

function initAuto(block) {
  const autoSlide = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // delay first auto slide to allow for initial load
        if (isInitialLoad) {
          setTimeout(() => startAuto(block), initialLoadDelay);
          isInitialLoad = false;
        } else {
          startAuto(block);
        }
      } else {
        stopAuto();
      }
    });
  };
  const autoObserver = new IntersectionObserver(autoSlide, { threshold: 0.5 });
  autoObserver.observe(block);

  // pause when mouse is over
  block.addEventListener('mouseenter', () => stopAuto());
  block.addEventListener('mouseleave', () => startAuto(block));

  // pause when tab is not active or window is not focused
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') stopAuto();
    else startAuto(block);
  });
  window.addEventListener('blur', () => {
    stopAuto();
  });
  window.addEventListener('focus', () => {
    startAuto(block);
  });
}

/**
 * Return the top and bottom text for the slide.
 * @param col {HTMLElement} - The column element
 * @returns {DocumentFragment} - The top and bottom text
 */
function getSlideText(col) {
  const frag = document.createDocumentFragment();
  const topText = col.querySelector('h2');
  const bottomText = col.querySelector('h3');

  // decorate CTA
  col.querySelectorAll('a').forEach((cta) => cta.classList.add('button'));

  // collect all the siblings of the h2 up to the h3 element if it exists
  const topNodes = [];
  let currentNode = topText ? topText.nextElementSibling : null;
  while (currentNode && currentNode !== bottomText) {
    topNodes.push(currentNode);
    currentNode = currentNode.nextElementSibling;
  }

  // collect all the siblings of the h3
  const bottomNodes = [];
  currentNode = bottomText ? bottomText.nextElementSibling : null;
  while (currentNode) {
    bottomNodes.push(currentNode);
    currentNode = currentNode.nextElementSibling;
  }

  if (topText) {
    const $top = div({ class: 'content top' });
    if (topText.textContent.trim()) {
      $top.append(p(topText));
    }
    topNodes.forEach((node) => $top.append(node));
    frag.append($top);
  }

  if (bottomText) {
    const $bottom = div({ class: 'content bottom' });
    if (bottomText.textContent.trim()) {
      $bottom.append(p(bottomText));
    }
    bottomNodes.forEach((node) => $bottom.append(node));
    frag.append($bottom);
  }

  return frag;
}

/**
 * Create a slide element from a row. The row should contain two columns, the first column should
 * contain an image and the second column may contain the slide content.  If the second column is
 * empty, the default content will be used.
 *
 * @param row {HTMLElement} - The row element
 * @param i {number} - The slide index
 * @returns {Element} - The slide element
 */
function createSlide(row, i) {
  const isFirst = i === 1;
  const $slide = li({ 'data-slide-index': i, class: `slide ${isFirst ? 'active' : ''}` });

  // Create a wrapper for the slide content
  const $slideWrapper = div({ class: 'slide-wrapper' });

  row.querySelectorAll(':scope > div').forEach((col, index) => {
    // decorate image
    if (index === 0) {
      col.classList.add('slide-image');
      const img = col.querySelector('img');
      if (img) {
        const imgSizes = [
          { media: '(max-width: 480px)', width: '480' },
          { media: '(min-width: 480px) and (max-width: 768px)', width: '768' },
          { media: '(min-width: 768px) and (max-width: 1024px)', width: '1024' },
          { media: '(min-width: 1024px)', width: '1920' },
        ];
        col.innerHTML = '';
        col.append(createOptimizedPicture(img.src, img.alt || `slide ${index}`, false, imgSizes));
        // prevent the image from being dragged so that it doesn't interfere with the carousel
        col.addEventListener('dragstart', (e) => e.preventDefault());
        $slideWrapper.append(col);
      }
    } else if (index === 1) {
      // use default content if col is empty
      const content = (col.textContent === '' && defaultContent !== undefined)
        ? defaultContent.cloneNode(true)
        : getSlideText(col);
      $slideWrapper.append(content);
    }
  });

  $slide.appendChild($slideWrapper);

  return $slide;
}

function createNavButtons(isMultiple, block, $container) {
  if (isMultiple) {
    block.dataset.activeSlide = '0';
    const $prev = button({
      class: 'prev',
      'aria-label': 'Previous Slide',
    });
    $prev.addEventListener('click', () => {
      showSlide(block, -1);
      if (isAuto) resetAuto(block);
    });
    const $next = button({
      class: 'next',
      'aria-label': 'Next Slide',
    });
    $next.addEventListener('click', () => {
      showSlide(block, 1);
      if (isAuto) resetAuto(block);
    });
    $container.append(div({ class: 'btns' }, $prev, $next));
  }
}

export default async function decorate(block) {
  const autoClass = block.className.split(' ').find((className) => className.startsWith('auto-'));
  const hasGallery = block.classList.contains('gallery-enabled');

  // get duration from auto class
  if (autoClass) {
    // protect against bad input and see if we can find a number, if not default to 6000 ms
    const match = autoClass.match(/\d+/);
    const [duration] = match || [6000];
    if (duration) {
      autoDuration = Number.parseInt(duration, 10);
    }
    isAuto = true;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  let isMultiple = false;
  const rows = block.querySelectorAll(':scope > div');
  const $slides = ul({ class: 'slides' });

  if (rows.length === 1) {
    const $slide = createSlide(rows[0], 1);
    $slides.appendChild($slide);
  } else {
    // check to see if there is any default content in the first row if there is no
    // picture then we have default content
    if (rows.length > 1 && !rows[0].querySelector(':scope > div picture')) {
      defaultContent = getSlideText(rows[0].querySelector(':scope > div').nextElementSibling);
    }

    Array.from(rows).splice(1).forEach((row, i) => {
      const index = i + 1;
      const $slide = createSlide(row, index);
      $slides.appendChild($slide);
      isMultiple = i >= 1;
    });
  }

  if (isMultiple) {
    registerTouchHandlers(
      block,
      () => showSlide(block, -1),
      () => showSlide(block, 1),
    );
  }

  const $container = div(
    { class: 'slides-container' },
    $slides,
  );

  createNavButtons(isMultiple, block, $container);

  if (hasGallery) {
    createGallery($container, block);
  }

  block.innerHTML = '';
  block.append($container);

  // auto slide functionality
  if (isAuto && isMultiple) {
    initAuto(block);
  }

  if (hasGallery) {
    initializeGallery(block);
  }
}
