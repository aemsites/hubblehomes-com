import { div, button } from './dom-helpers.js';
import { createOptimizedPicture } from './aem.js';

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

function createImageOverlay(index) {
  currentIndex = index;
  const overlay = div({ class: 'image-overlay' });
  const overlayHeader = div({ class: 'image-overlay-header' });
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

  const closeButton = button({ class: 'overlay-close' }, 'Close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
    document.body.classList.remove('gallery-active');
    restoreScrollPosition();
  });

  overlayHeader.appendChild(closeButton);

  const btnsContainer = div({ class: 'btns' });
  const prevButton = button({ class: 'prev', 'aria-label': 'Previous Image' });
  const nextButton = button({ class: 'next', 'aria-label': 'Next Image' });

  prevButton.addEventListener('click', () => navigateOverlay(-1));
  nextButton.addEventListener('click', () => navigateOverlay(1));

  btnsContainer.appendChild(prevButton);
  btnsContainer.appendChild(nextButton);

  content.appendChild(optimizedPicture);
  content.appendChild(btnsContainer);
  overlay.appendChild(overlayHeader);
  overlay.appendChild(content);
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

function createGallery(images) {
  const gallery = div({ class: 'gallery' });
  const galleryHeader = div({ class: 'gallery-header' });
  const closeButton = button({ class: 'gallery-close' }, 'Close');
  closeButton.addEventListener('click', () => {
    gallery.classList.remove('active');
  });

  galleryHeader.appendChild(closeButton);

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
      createImageOverlay(i);
    });

    galleryContent.appendChild(galleryItem);
  });

  gallery.appendChild(galleryHeader);
  gallery.appendChild(galleryContent);
  return gallery;
}

export default function initGallery(images) {
  const gallery = createGallery(images);
  document.body.appendChild(gallery);
  gallery.classList.add('active');
  document.body.classList.add('gallery-active');
  document.documentElement.style.top = `-${window.scrollY}px`;
  document.documentElement.style.position = 'fixed';

  const closeButton = gallery.querySelector('.gallery-close');
  closeButton.addEventListener('click', () => {
    gallery.classList.remove('active');
    document.body.classList.remove('gallery-active');
    restoreScrollPosition();
    setTimeout(() => {
      document.body.removeChild(gallery);
    }, 300);
  });

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
