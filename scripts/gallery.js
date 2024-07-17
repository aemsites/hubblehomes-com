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

function createImageOverlay(index) {
  currentIndex = index;
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
    ],
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

function createGallery(images) {
  const gallery = div({ class: 'gallery' });
  const closeButton = button({ class: 'gallery-close' }, 'Close');
  closeButton.addEventListener('click', () => {
    gallery.classList.remove('active');
  });

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

  gallery.appendChild(closeButton);
  gallery.appendChild(galleryContent);
  return gallery;
}

export default function initGallery(images) {
  const gallery = createGallery(images);
  document.body.appendChild(gallery);
  gallery.classList.add('active');
}
