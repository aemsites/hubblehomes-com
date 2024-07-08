import buildBreadcrumbs from '../../scripts/breadcrumbs.js';

export default async function decorate(doc) {
  const mainSection = doc.querySelector('main > .section');

  const $breadCrumbs = await buildBreadcrumbs();

  const $carousel = mainSection.querySelector('.carousel-wrapper');
  if ($carousel) {
    $carousel.insertAdjacentElement('afterend', $breadCrumbs);
  } else {
    mainSection.insertAdjacentElement('afterbegin', $breadCrumbs);
  }
}
