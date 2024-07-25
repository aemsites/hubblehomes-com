import { getMetadata } from '../../scripts/aem.js';
import initGallery from '../../scripts/gallery.js';
import { button, span } from '../../scripts/dom-helpers.js';

let galleryImages = [];
let galleryInitialized = false;

function createGalleryButton() {
  const icon = document.createElement('img');
  icon.src = '/icons/gallery.svg';
  icon.alt = 'Gallery icon';

  return button(
    { class: 'gallery-button' },
    icon,
    span({}, 'Gallery'),
  );
}

function adjustGalleryPosition() {
  const topBanner = document.querySelector('.top-banner');
  const topBannerHeight = topBanner ? topBanner.offsetHeight : 0;
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10);
  const adjustedNavHeight = navHeight + topBannerHeight;

  document.documentElement.style.setProperty('--adjusted-nav-height', `${adjustedNavHeight}px`);

  const galleryElement = document.querySelector('.gallery.active');
  if (galleryElement) {
    galleryElement.style.top = `${adjustedNavHeight}px`;
  }

  const imageOverlay = document.querySelector('.image-overlay');
  if (imageOverlay) {
    imageOverlay.style.top = `${adjustedNavHeight}px`;
  }
}

function openGallery() {
  const pageName = getMetadata('page-name');
  initGallery(galleryImages, pageName);
  setTimeout(() => {
    adjustGalleryPosition();
  }, 0);
}

function createGallery($container, block) {
  const galleryButton = createGalleryButton();
  $container.appendChild(galleryButton);

  galleryButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    openGallery();
  });

  // Collect all images for the gallery
  galleryImages = Array.from(block.querySelectorAll('.slide-image img'))
    .map((img) => ({
      src: img.src,
      alt: img.alt,
    }));
}

function initializeGallery(block) {
  if (galleryInitialized) return;

  galleryImages = Array.from(block.querySelectorAll('.slide-image img'))
    .map((img) => ({ src: img.src, alt: img.alt }));

  new MutationObserver((mutations) => {
    mutations.some((mutation) => {
      if (mutation.attributeName === 'class') {
        const { classList } = mutation.target;
        if (classList.contains('gallery-active')) {
          adjustGalleryPosition();
          return true;
        }
      }
      return false;
    });
  }).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#gallery') openGallery();
  });

  if (window.location.hash === '#gallery') setTimeout(openGallery, 100);

  galleryInitialized = true;
}

export {
  initializeGallery,
  createGallery,
};
