import {
  div, button, h2,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { safeAppend } from '../../scripts/block-helper.js';
import registerTouchHandlers from './carousel-touch.js';
import rebuildImageStyles from '../../scripts/gallery-rules.js';

let galleryImages = [];
let currentIndex = 0;

function createOptimizedImage(image) {
  return createOptimizedPicture(
    image.src,
    image.alt,
    true,
    [{ media: '(min-width: 1024px)', width: '2000' },
      { media: '(max-width: 480px)', width: '480' },
      { media: '(min-width: 480px) and (max-width: 768px)', width: '768' },
      { media: '(min-width: 768px) and (max-width: 1024px)', width: '1024' },
    ],
  );
}

/**
 * Navigate the overlay to the next or previous image.
 * @param {number} direction - The direction to navigate. 1 for next, -1 for previous.
 */
function navigateOverlay(direction) {
  currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
  const overlay = document.querySelector('.image-overlay');
  const content = overlay.querySelector('.image-overlay-content');
  const oldPicture = content.querySelector('picture');
  const newOptimizedPicture = createOptimizedImage(galleryImages[currentIndex]);
  content.replaceChild(newOptimizedPicture, oldPicture);
}

/**
 * Rebuild the styles for the images in the gallery.  The window width will determine the rule to
 * apply to the images.
 */
function buildStyles() {
  const pictures = document.querySelectorAll('.image-gallery picture');
  rebuildImageStyles(pictures);
}

function openGallery() {
  buildStyles();
  const gallery = document.querySelector('.carousel-gallery');
  gallery.classList.add('active');
  document.body.classList.add('gallery-active');
}

/**
 * Create the overlay container for the gallery.  This will display the image in a larger format.
 * The overlay will contain the image, a title, and navigation buttons.
 * @param index - The index of the image to display.
 * @param title - The title of the gallery.
 */
function createImageOverlay(index, title) {
  currentIndex = index;
  const overlayHeader = div({ class: 'carousel-gallery-header' });
  const overlayHeaderContainer = div({ class: 'gallery-header-container' }, overlayHeader);
  const optimizedPicture = createOptimizedImage(galleryImages[currentIndex]);

  let titleEl;
  if (title) {
    titleEl = h2({ class: 'gallery-title' }, title);
  }

  const closeButton = button({
    class: 'close btn white rounded small',
    'aria-label': 'Close banner',
    onclick: () => {
      document.querySelector('.image-overlay').remove();
    },
  });

  safeAppend(overlayHeader, titleEl, closeButton);

  const prevButton = button({
    class: 'btn white rounded small',
    'aria-label': 'Previous Image',
    onclick: () => navigateOverlay(-1),
  });

  const nextButton = button({
    class: 'next',
    'aria-label': 'Next Image',
    onclick: () => navigateOverlay(1),
  });

  const buttonContainer = div({ class: 'btns' }, prevButton, nextButton);
  const imageOverlayContent = div({ class: 'image-overlay-content' }, optimizedPicture, buttonContainer);

  const overlay = div(
    { class: 'image-overlay' },
    overlayHeaderContainer,
    imageOverlayContent,
  );

  registerTouchHandlers(
    imageOverlayContent,
    () => navigateOverlay(1),
    () => navigateOverlay(-1),
  );

  imageOverlayContent.addEventListener('dragstart', (e) => e.preventDefault());

  document.querySelector('main').prepend(overlay);
  // document.body.appendChild(overlay);

  openGallery();
}

function closeGallery() {
  const gallery = document.querySelector('.carousel-gallery');
  gallery.classList.remove('active');
  document.body.classList.remove('gallery-active');

  setTimeout(() => {
    gallery.remove();
  }, 300);
}

function setGalleryPlacement(gallery) {
  const header = document.querySelector('header');
  const { scrollY } = window;
  const galleryGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gallery-gap-default'), 10) || 0;

  gallery.style.height = `calc(100vh - ${header.clientHeight + galleryGap}px)`;
  gallery.style.top = `${header.clientHeight + scrollY}px`;

  const observer = new MutationObserver(() => {
    if (header) {
      gallery.style.height = `calc(100vh - ${header.clientHeight + galleryGap}px)`;
      gallery.style.top = `${header.clientHeight + window.scrollY}px`;
    }
  });

  observer.observe(
    document.querySelector('header'),
    { childList: true, subtree: true },
  );
}

async function createGallery(images, title) {
  let titleEl;
  if (title) {
    titleEl = h2({ class: 'gallery-title' }, title);
  }

  const closeButton = button({
    class: 'close btn white rounded small',
    'aria-label': 'Close banner',
    onclick: () => closeGallery(),
  });

  const galleryHeader = div({ class: 'carousel-gallery-header' });

  safeAppend(galleryHeader, titleEl, closeButton);

  const galleryContent = div({ class: 'image-gallery' });

  // cache the images for future lookup
  galleryImages = images;

  // register a listener for the window resize event
  window.addEventListener('resize', () => {
    buildStyles();
  });

  images.forEach((image, index) => {
    const picture = createOptimizedPicture(
      image.src,
      image.alt,
      true,
      [{ media: '(min-width: 1024px)', width: '2000' },
        { media: '(max-width: 480px)', width: '480' },
        { media: '(min-width: 480px) and (max-width: 768px)', width: '768' },
        { media: '(min-width: 768px) and (max-width: 1024px)', width: '1024' },
      ],
    );

    picture.addEventListener('click', () => {
      createImageOverlay(index, title);
    });

    galleryContent.appendChild(picture);
  });

  return div({ class: 'carousel-gallery' }, galleryHeader, galleryContent);
}

export default async function initGallery(images, pageName) {
  const gallery = await createGallery(images, pageName);
  document.querySelector('main').prepend(gallery);

  openGallery();

  setGalleryPlacement(gallery);
}
