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
let galleryImages = [];
let currentIndex = 0;

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

function createGalleryButton() {
  const button = document.createElement('button');
  button.classList.add('gallery-button');
  
  const icon = document.createElement('img');
  icon.src = '/icons/gallery.svg';
  icon.alt = 'Gallery icon';
  
  const text = document.createElement('span');
  text.textContent = 'Gallery';
  
  button.appendChild(icon);
  button.appendChild(text);
  
  return button;
}

function getItemClasses(index) {
  const position = index % 9;
  if (position === 2 || position === 6) {
    return ['large'];
  } else {
    return ['small'];
  }
}

function createGallery(block) {
  const gallery = div({ class: 'gallery' });
  const closeButton = button({ class: 'gallery-close' }, 'Close');
  closeButton.addEventListener('click', () => {
    gallery.classList.remove('active');
  });

  const galleryContent = div({ class: 'gallery-content' });

  const slides = block.querySelectorAll('.slide');
  console.log('Total slides:', slides.length);

  galleryImages = []; // Reset the array

  slides.forEach((slide, i) => {
    const picture = slide.querySelector('.slide-image picture');
    if (picture) {
      const galleryItem = div({ class: 'gallery-item' });
      const img = picture.querySelector('img');
      
      if (img) {
        // Use the original image instead of createOptimizedPicture
        const clonedPicture = picture.cloneNode(true);
        galleryItem.appendChild(clonedPicture);
        
        galleryImages.push({ src: img.src, alt: img.alt });
      }
      
      const classes = getItemClasses(i);
      classes.forEach(cls => galleryItem.classList.add(cls));
      
      galleryItem.addEventListener('click', () => {
        createImageOverlay(i);
      });
      
      galleryContent.appendChild(galleryItem);
    }
  });

  gallery.appendChild(closeButton);
  gallery.appendChild(galleryContent);
  return gallery;
}

function navigateOverlay(direction) {
  currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
  
  const overlay = document.querySelector('.image-overlay');
  const content = overlay.querySelector('.image-overlay-content');
  const oldPicture = content.querySelector('picture');
  
  const newOptimizedPicture = createOptimizedPicture(
    galleryImages[currentIndex].src, 
    galleryImages[currentIndex].alt, 
    false, 
    [
      { width: '1200' },
      { width: '1600' },
      { width: '2000' },
    ]
  );
  
  content.replaceChild(newOptimizedPicture, oldPicture);
}

function createImageOverlay(index) {
  currentIndex = index; // Set the initial index
  const overlay = div({ class: 'image-overlay' });
  const content = div({ class: 'image-overlay-content' });
  
  const optimizedPicture = createOptimizedPicture(
    galleryImages[index].src, 
    galleryImages[index].alt, 
    false, 
    [
      { width: '1200' },
      { width: '1600' },
      { width: '2000' },
    ]
  );
  
  const closeButton = button({ class: 'overlay-close' }, 'Close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  const btnsContainer = div({ class: 'btns' });
  const prevButton = button({ class: 'prev', 'aria-label': 'Previous Image' });
  const nextButton = button({ class: 'next', 'aria-label': 'Next Image' });
  
  prevButton.addEventListener('click', () => navigateOverlay(-1));
  nextButton.addEventListener('click', () => navigateOverlay(1));
  
  btnsContainer.appendChild(prevButton);
  btnsContainer.appendChild(nextButton);
  
  content.appendChild(optimizedPicture);
  content.appendChild(btnsContainer);
  overlay.appendChild(content);
  overlay.appendChild(closeButton);
  document.body.appendChild(overlay);
}


function createSlide(row, i) {
  const isFirst = i === 1;
  const $slide = li({ 'data-slide-index': i, class: `slide ${isFirst ? 'active' : ''}` });

  // Create a wrapper for the slide content
  const $slideWrapper = div({ class: 'slide-wrapper' });

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
        $slideWrapper.append(col);
      }
    }
    // decorate content
    if (c === 1) {
      // use default content if col is empty
      const content = (col.textContent === '' && defaultContent !== undefined) ? defaultContent.cloneNode(true) : decorateSlideContent(col);
      $slideWrapper.append(content);
    }
  });

  $slide.appendChild($slideWrapper);

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
  console.log('Rows found:', rows.length);
  const isMultiple = rows.length > 2;
  const $slides = ul({ class: 'slides' });

  rows.forEach((row, i) => {
    // set default content
    if (i === 0 && isMultiple) {
      defaultContent = decorateSlideContent(row.querySelector(':scope > div').nextElementSibling);
    } else {
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

  // Create and add gallery button
  const galleryButton = createGalleryButton();
  $container.appendChild(galleryButton);

  block.innerHTML = '';
  block.append($container);

  // Add click event to gallery button
  galleryButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const gallery = createGallery(block);
    block.appendChild(gallery);
    
    gallery.classList.add('active');
    console.log('Gallery opened');
  });

  // auto slide functionality
  if (isAuto && isMultiple) initAuto(block);
}