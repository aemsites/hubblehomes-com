import { a, div } from './dom-helpers.js';

export default function createNewsletterLink() {
  const newsletterLink = a(
    {
      href: '/contact-us/subscribe',
      class: 'newsletter-link',
    },
    'Subscribe to Newsletter',
  );

  return div(
    { class: 'newsletter-container' },
    newsletterLink,
  );
}
