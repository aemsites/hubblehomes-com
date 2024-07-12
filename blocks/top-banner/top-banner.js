import { readBlockConfig } from '../../scripts/aem.js';
import { div, a, button } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const variant = config.variant || '';

  // Check if the banner was dismissed in this navigation session
  if (sessionStorage.getItem('topBannerDismissed')) {
    document.body.classList.remove('has-top-banner');
    block.remove();
    return;
  }

  const contentText = block.textContent.trim();

  // If there's no content, don't render the banner
  if (!contentText) {
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
    closeButton = button({ class: 'top-banner-close', 'aria-label': 'Close banner' });
    closeButton.addEventListener('click', () => {
      block.classList.add('dismissed');
      document.body.classList.remove('has-top-banner');
      // Use setTimeout to remove the banner after the transition
      setTimeout(() => {
        block.remove();
      }, 300); // 300ms matches the transition duration in CSS
      // Set a flag in sessionStorage
      sessionStorage.setItem('topBannerDismissed', 'true');
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

  // Add a class to the body to indicate the presence of the banner
  document.body.classList.add('has-top-banner');
}
