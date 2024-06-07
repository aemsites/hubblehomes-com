/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { div, a } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  // breadcrumbs
  const $breadCrumbs = div({ class: 'section nopad' },
    div({ class: 'breadcrumbs' },
      a({ href: '/', 'arial-lable': 'View Home Page' }, 'Home'),
      ' > ',
      'About Us',
    ),
  );

  const $carousel = doc.querySelector('div.carousel');

  // inject after carousel if it exists
  if ($carousel) {
    $carousel.insertAdjacentElement('afterend', $breadCrumbs);
  } else {
    const $firstDiv = document.body.querySelector('div');
    $firstDiv.insertBefore($breadCrumbs, $firstDiv.firstChild);
  }
}
