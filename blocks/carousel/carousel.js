/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li, button } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

let isAuto;
let autoInterval;
let autoDuration = '6000'; // default if not set in block
const fadeDuration = 700; // match time in css -> .carousel.fade .slide
let isInitialLoad = true;
const initialLoadDelay = 4000;
let defaultContent;
let isAnimating = false;

function showSlide(block, dir) {
  // wait till current animation is compeleted
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

function decorateSlideContent(col) {
  const frag = document.createDocumentFragment();
  let top = '';
  let bottom = '';
  let isTop = true;

  // decorate CTA
  col.querySelectorAll('a').forEach((cta) => cta.classList.add('button'));

  // decorate top & bottom content
  col.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'hr') {
      // if node is an <hr> switch to the bottom section
      isTop = false;
    } else if (isTop) {
      top += node.outerHTML || node.textContent;
    } else {
      bottom += node.outerHTML || node.textContent;
    }
  });

  if (top.trim()) {
    const $top = div({ class: 'content top' });
    $top.innerHTML = top.trim();
    frag.append($top);
  }

  if (bottom.trim() || !isTop) {
    const $bottom = div({ class: 'content bottom' });
    $bottom.innerHTML = bottom.trim();
    frag.append($bottom);
  }

  return frag;
}

function createSlide(row, i) {
  const isFirst = i === 1;
  const $slide = li({ 'data-slide-index': i, class: `slide ${isFirst ? 'active' : ''}` });

  row.querySelectorAll(':scope > div').forEach((col, c) => {
    // decorate image
    if (c === 0) {
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
        col.append(createOptimizedPicture(img.src, img.alt || `slide ${c}`, true, imgSizes));
        $slide.append(col);
      }
    }
    // decorate content
    if (c === 1) {
      // use default content if col is empty
      const content = (col.textContent === '' && defaultContent !== undefined) ? defaultContent.cloneNode(true) : decorateSlideContent(col);
      $slide.append(content);
    }
  });
  return $slide;
}

export default async function decorate(block) {
  const autoClass = block.className.split(' ').find((className) => className.startsWith('auto-'));

  // get duration from auto class
  if (autoClass) {
    [autoDuration] = autoClass.match(/\d+/);
    isAuto = true;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = block.querySelectorAll(':scope > div');
  const isMultiple = rows.length > 2;
  const $slides = ul({ class: 'slides' });

  rows.forEach((row, i) => {
    if (i === 0 && isMultiple) { // is more than 2 rows - get default content from 1st row
      defaultContent = decorateSlideContent(row.querySelector(':scope > div').nextElementSibling);
    } else if (i === 0 && rows.length <= 2) { // is 2 rows - single slide
      // do nothing if slide lenght is 2 or less
    } else { // 2nd row or greater - decorate each slide
      $slides.appendChild(createSlide(row, !isMultiple ? 1 : i));
    }
  });

  const $container = div({ class: 'slides-container' },
    $slides,
  );

  // add buttons if multiple slides
  if (isMultiple) {
    block.dataset.activeSlide = 0;
    const $prev = button({ class: 'prev', 'aria-label': 'Previous Slide' });
    $prev.addEventListener('click', () => {
      showSlide(block, -1);
      if (isAuto) resetAuto(block);
    });
    const $next = button({ class: 'next', 'aria-label': 'Next Slide' });
    $next.addEventListener('click', () => {
      showSlide(block, 1);
      if (isAuto) resetAuto(block);
    });
    $container.append(div({ class: 'btns' }, $prev, $next));
  }

  block.innerHTML = '';
  block.append($container);

  // auto slide functionality
  if (isAuto && isMultiple) initAuto(block);
}
