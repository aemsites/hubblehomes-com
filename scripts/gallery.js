import {
  div, button, h2,
} from './dom-helpers.js';
import { createOptimizedPicture } from './aem.js';
import { safeAppend } from './block-helper.js';

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
    [
      {
        media: '(min-width: 1024px)',
        width: '2000',
      },
      {
        media: '(max-width: 480px)',
        width: '480',
      },
      {
        media: '(min-width: 480px) and (max-width: 768px)',
        width: '768',
      },
      {
        media: '(min-width: 768px) and (max-width: 1024px)',
        width: '1024',
      },
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

function restoreScrollPosition() {
  const scrollY = document.documentElement.style.top;
  document.documentElement.style.position = '';
  document.documentElement.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
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
      document.body.classList.remove('gallery-active');
      restoreScrollPosition();
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

  const btnsContainer = div({ class: 'btns' }, prevButton, nextButton);

  const overlay = div(
    { class: 'image-overlay' },
    overlayHeaderContainer,
    div({ class: 'image-overlay-content' }, optimizedPicture, btnsContainer),
  );

  document.body.appendChild(overlay);
  document.body.classList.add('gallery-active');
  document.documentElement.style.top = `-${window.scrollY}px`;
  document.documentElement.style.position = 'fixed';

  // Adjust overlay position when top banner is present
  const adjustOverlayPosition = () => {
    const topBanner = document.querySelector('.top-banner');
    if (topBanner) {
      const topBannerHeight = topBanner.offsetHeight;
      document.documentElement.style.setProperty('--top-banner-height', `${topBannerHeight}px`);
    }
  };

  adjustOverlayPosition();
  window.addEventListener('resize', adjustOverlayPosition);
}

async function createGallery(images, title) {
  const gallery = div({ class: 'gallery' });

  let titleEl;
  if (title) {
    titleEl = h2({ class: 'gallery-title' }, title);
  }

  const closeButton = button({ class: 'close btn white rounded small', 'aria-label': 'Close banner' });
  closeButton.addEventListener('click', () => {
    gallery.classList.remove('active');
    document.body.classList.remove('gallery-active');
    restoreScrollPosition();
    setTimeout(() => {
      document.body.removeChild(gallery);
    }, 300);
  });

  const galleryHeader = div({ class: 'gallery-header' });
  safeAppend(galleryHeader, titleEl, closeButton);

  const galleryContent = div({ class: 'gallery-content' });

  galleryImages = images;

  images.forEach((image, i) => {
    const galleryItem = div({ class: 'gallery-item' });

    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    picture.appendChild(img);

    galleryItem.appendChild(picture);

    const classes = getItemClasses(i);
    classes.forEach((cls) => galleryItem.classList.add(cls));

    galleryItem.addEventListener('click', () => {
      createImageOverlay(i, title);
    });

    galleryContent.appendChild(galleryItem);
  });

  gallery.appendChild(galleryHeader);
  gallery.appendChild(galleryContent);
  return gallery;
}

export default async function initGallery(images, pageName) {
  const gallery = await createGallery(images, pageName);
  document.body.appendChild(gallery);
  gallery.classList.add('active');
  document.body.classList.add('gallery-active');
  document.documentElement.style.top = `-${window.scrollY}px`;
  document.documentElement.style.position = 'fixed';

  // Adjust gallery position when top banner is present
  const adjustGalleryPosition = () => {
    const topBanner = document.querySelector('.top-banner');
    if (topBanner) {
      const topBannerHeight = topBanner.offsetHeight;
      document.documentElement.style.setProperty('--top-banner-height', `${topBannerHeight}px`);
    }
  };

  adjustGalleryPosition();
  window.addEventListener('resize', adjustGalleryPosition);
}
