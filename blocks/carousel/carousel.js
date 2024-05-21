/* eslint-disable object-curly-newline, function-paren-newline */
import { div, ul, li, button } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

let auto;
let autoInterval;
let autoDuration = '6000'; // default if not set in block
const fadeDuration = 700; // match time in css -> .carousel.fade .slide
let isInitialLoad = true;
const initialLoadDelay = 3000;

function showSlide(block, dir) {
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
    }, fadeDuration);
  }
}

function createSlide(row, i) {
  const isFirst = i === 0;
  const $slide = li({ 'data-slide-index': i, class: `slide ${isFirst ? 'active' : ''}` });

  row.querySelectorAll(':scope > div').forEach((column, n) => {
    column.classList.add(`slide-${n === 0 ? 'image' : 'content'}`);
    if (n === 0) {
      const img = column.querySelector('img');
      if (img) {
        const imgSizes = [
          { media: '(max-width: 480px)', width: '480' },
          { media: '(min-width: 480px) and (max-width: 768px)', width: '768' },
          { media: '(min-width: 768px) and (max-width: 1024px)', width: '1024' },
          { media: '(min-width: 1024px)', width: '1920' },
        ];
        column.innerHTML = '';
        column.append(createOptimizedPicture(img.src, `slide ${n}`, !!isFirst, imgSizes));
      }
    }
    $slide.append(column);
  });
  const labeledBy = $slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) $slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));

  return $slide;
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

export default async function decorate(block) {
  const blockClasses = block.className.split(' ');
  const autoClass = blockClasses.find((className) => className.startsWith('auto-'));

  if (autoClass) {
    auto = true;
    // get auto duration from block class
    [autoDuration] = autoClass.match(/\d+/);
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = block.querySelectorAll(':scope > div');
  const isSingle = rows.length < 2;

  const $slides = ul({ class: 'slides' });
  rows.forEach((row, i) => {
    const slide = createSlide(row, i);
    $slides.append(slide);
    row.remove();
  });

  let $slideBtns;
  if (!isSingle) {
    const $prev = button({ class: 'prev', 'aria-label': 'Previous Slide' });
    $prev.addEventListener('click', () => showSlide(block, -1));
    const $next = button({ class: 'next', 'aria-label': 'Previous Slide' });
    $next.addEventListener('click', () => showSlide(block, 1));
    $slideBtns = div({ class: 'buttons' }, $prev, $next);

    block.dataset.activeSlide = 0;
  }

  const $container = div({ class: 'slides-container' },
    $slides,
    $slideBtns,
  );

  block.prepend($container);

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
