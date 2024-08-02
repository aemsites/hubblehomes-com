import { readBlockConfig } from '../../scripts/aem.js';
import { div, a, button } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const variant = config.variant || '';

  const contentText = block.textContent.trim();

  // no content or banner was dismissed don't show it
  if (sessionStorage.getItem('topBannerDismissed') || contentText === '') {
    document.documentElement.style.setProperty('--banner-height', '0px');
    block.remove();
    return;
  }

  const bannerContent = div({ class: 'top-banner-content' }, contentText);

  const linkElement = block.querySelector('a');
  if (linkElement) {
    const linkText = linkElement.textContent.trim();
    const linkHref = linkElement.getAttribute('href');
    if (linkText && linkHref) {
      // Replace plain text with link element if it exists
      bannerContent.innerHTML = '';
      bannerContent.appendChild(
        a({ href: linkHref, class: 'top-banner-link' }, linkText),
      );
    }
  }

  let closeButton;
  if (variant === 'dismissible') {
    closeButton = button({ class: 'close btn white rounded small', 'aria-label': 'Close banner' });
    closeButton.addEventListener('click', () => {
      block.classList.add('dismissed');
      block.remove();
      sessionStorage.setItem('topBannerDismissed', 'true');
      document.documentElement.style.setProperty('--banner-height', '0px');
    });
  }

  // Clear the existing content
  block.innerHTML = '';

  const bannerWrapper = div(
    { class: `top-banner-wrapper ${variant}` },
    bannerContent,
    closeButton,
  );

  block.appendChild(bannerWrapper);
}
