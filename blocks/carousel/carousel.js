/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li, button, p } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

let auto;
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
  const cl = block.classList;
  const slideIndex = parseInt(block.dataset.activeSlide, 10) + dir;
  block.dataset.activeSlide = slideIndex;
  const $slides = block.querySelectorAll('.slide');

  // handle wrap around
  const activeSlideIndex = (slideIndex + $slides.length) % $slides.length;
  const $activeSlide = $slides[activeSlideIndex];

  if (cl.contains('slide')) {
    block.querySelector('.slides').scrollTo({
      top: 0,
      left: $activeSlide.offsetLeft,
      behavior: 'smooth',
    });
    isAnimating = false;
  }

  if (cl.contains('fade')) {
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

  // reset auto when clicked
  if (auto) {
    stopAuto();
    setTimeout(() => { startAuto(block); }, autoDuration);
  }
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

function decorateSlideContent(column) {
  const fragment = document.createDocumentFragment();

  const cta = column.querySelector('a');
  if (cta) cta.classList.add('button');

  // create top content from h2 elements
  const h2s = column.querySelectorAll('h2');
  if (h2s.length !== 0) {
    const $top = div({ class: 'content top' });
    h2s.forEach((h2) => {
      const $p = p();
      $p.innerHTML = h2.innerHTML.replace(/<br>/g, '');
      $top.append($p);
      h2.remove();
    });
    fragment.append($top);
  }

  // creat bottom content
  const $bottom = div({ class: 'content bottom' });
  $bottom.innerHTML = column.innerHTML.replace(/<br>/g, '');

  fragment.append($bottom);

  return fragment;
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
      // use default content if column is empty
      const content = (col.textContent === '') ? defaultContent.cloneNode(true) : decorateSlideContent(col);
      $slide.append(content);
    }
  });
  return $slide;
}

export default async function decorate(block) {
  const autoClass = block.className.split(' ').find((className) => className.startsWith('auto-'));

  // get duration from auto- block class
  if (autoClass) {
    auto = true;
    [autoDuration] = autoClass.match(/\d+/);
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = block.querySelectorAll(':scope > div');
  const $slides = ul({ class: 'slides' });

  rows.forEach((row, i) => {
    // if multiple slides set default content
    if (i === 0 && rows.length > 1) {
      defaultContent = decorateSlideContent(row.querySelector(':scope > div').nextElementSibling);
    } else {
      $slides.appendChild(createSlide(row, i));
    }
  });

  let $slideBtns;
  // check if there is more than one slide
  if (rows.length > 2) {
    block.dataset.activeSlide = 0;
    const $prev = button({ class: 'prev', 'aria-label': 'Previous Slide' });
    $prev.addEventListener('click', () => showSlide(block, -1));
    const $next = button({ class: 'next', 'aria-label': 'Previous Slide' });
    $next.addEventListener('click', () => showSlide(block, 1));
    $slideBtns = div({ class: 'btns' }, $prev, $next);
  }

  const $container = div({ class: 'slides-container' },
    $slides,
    $slideBtns,
  );

  block.innerHTML = '';
  block.append($container);

  // auto slide functionality
  if (auto) {
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
    $slides.addEventListener('mouseenter', () => stopAuto());
    $slides.addEventListener('mouseleave', () => startAuto(block));

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
}
