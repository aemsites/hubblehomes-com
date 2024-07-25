import {
  div, button, h2, img,
} from './dom-helpers.js';
import { createOptimizedPicture } from './aem.js';
import loadSVG from './svg-helper.js';
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
    ],
  );

  content.replaceChild(newOptimizedPicture, oldPicture);
}

function restoreScrollPosition() {
  const scrollY = document.documentElement.style.top;
  document.documentElement.style.position = '';
  document.documentElement.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
}

function createImageOverlay(index, title) {
  currentIndex = index;
  const overlayHeader = div({ class: 'gallery-header' });
  const overlayHeaderContainer = div({ class: 'gallery-header-container' }, overlayHeader);
  const content = div({ class: 'image-overlay-content' });

  const optimizedPicture = createOptimizedPicture(
    galleryImages[currentIndex].src,
    galleryImages[currentIndex].alt,
    false,
    [
      { width: '1200' },
      { width: '1600' },
      { width: '2000' },
    ],
  );

  let titleEl;
  if (title) {
    titleEl = h2({ class: 'gallery-title' }, title);
  }

  const closeButton = button({ class: 'close btn white rounded small', 'aria-label': 'Close banner' });
  closeButton.addEventListener('click', () => {
    // eslint-disable-next-line no-use-before-define
    document.body.removeChild(overlay);
    document.body.classList.remove('gallery-active');
    restoreScrollPosition();
  });

  safeAppend(overlayHeader, titleEl, closeButton);

  const btnsContainer = div({ class: 'btns' });
  const prevButton = button({ class: 'btn white rounded small', 'aria-label': 'Previous Image' });
  const nextButton = button({ class: 'next', 'aria-label': 'Next Image' });

  prevButton.addEventListener('click', () => navigateOverlay(-1));
  nextButton.addEventListener('click', () => navigateOverlay(1));

  btnsContainer.appendChild(prevButton);
  btnsContainer.appendChild(nextButton);

  content.appendChild(optimizedPicture);
  content.appendChild(btnsContainer);

  const overlay = div({ class: 'image-overlay' }, overlayHeaderContainer, content);

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
