import { div, a } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  const mainSection = doc.querySelector('main > .section');

  const $breadCrumbs = div(
    { class: 'breadcrumbs' },
    a({ href: '/', 'arial-lable': 'View Home Page' }, 'Home'),
    ' > ',
    '--- PAGE ---',
  );

  const $carousel = mainSection.querySelector('.carousel-wrapper');
  if ($carousel) {
    $carousel.insertAdjacentElement('afterend', $breadCrumbs);
  } else {
    mainSection.insertAdjacentElement('afterbegin', $breadCrumbs);
  }
}
