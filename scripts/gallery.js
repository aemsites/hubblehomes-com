import {
  div, button, h2,
} from './dom-helpers.js';
import { createOptimizedPicture } from './aem.js';
import { safeAppend } from './block-helper.js';
import registerTouchHandlers from '../blocks/carousel/carousel-touch.js';

let galleryImages = [];
let currentIndex = 0;

function getItemClasses(index) {
  const position = index % 9;
  if (position === 2 || position === 6) {
    return ['large'];
  }
  return ['small'];
}

function createOptimizedImage(image) {
  return createOptimizedPicture(
    image.src,
    image.alt,
    false,
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

function openGallery() {
  const gallery = document.querySelector('.gallery');
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
  const overlayHeader = div({ class: 'gallery-header' });
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
      // eslint-disable-next-line no-use-before-define
      document.body.removeChild(overlay);
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
  const imageOverlayContent = div({ class: 'image-overlay-content' }, buttonContainer, optimizedPicture);

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

  document.body.appendChild(overlay);

  openGallery();
}

function closeGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.classList.remove('active');
  document.body.classList.remove('gallery-active');
  setTimeout(() => {
    document.body.removeChild(gallery);
  }, 300);
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

  const galleryHeader = div({ class: 'gallery-header' });

  safeAppend(galleryHeader, titleEl, closeButton);

  const galleryContent = div({ class: 'gallery-content' });

  // cache the images for future lookup
  galleryImages = images;

  images.forEach((image, i) => {
    const galleryItem = div({ class: 'gallery-item' });
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

    galleryItem.appendChild(picture);

    const classes = getItemClasses(i);
    classes.forEach((cls) => galleryItem.classList.add(cls));

    galleryItem.addEventListener('click', () => {
      createImageOverlay(i, title);
    });

    galleryContent.appendChild(galleryItem);
  });

  return div({ class: 'gallery' }, galleryHeader, galleryContent);
}

export default async function initGallery(images, pageName) {
  const gallery = await createGallery(images, pageName);
  document.body.appendChild(gallery);
  openGallery();
}
