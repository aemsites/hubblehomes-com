import { fetchPageIndex } from '../../scripts/pages.js';
import {
  a, div, li, span, ul,
} from '../../scripts/dom-helpers.js';

async function buildBreadcrumbs() {
  const data = await fetchPageIndex();

  const { pathname } = window.location;
  const pathParts = pathname.split('/').filter((part) => part);

  let currentPath = '';
  const breadcrumbItems = [];

  // Helper function to find all page names by path
  function getPageNamesByPath(path) {
    return data.filter((page) => page.path === path).map((page) => page['page name']);
  }

  const homeLink = a({ href: '/' }, 'Home');
  const homeCrumb = li(homeLink);
  const crumbList = ul({ class: 'breadcrumb-list' }, homeCrumb);
  const breadcrumbContainer = div({ class: 'section breadcrumbs' }, crumbList);

  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const pageNames = getPageNamesByPath(currentPath);

    if (pageNames.length === 0) return;

    // Check if the last breadcrumb item has the same name as the current segment
    const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
    const isParentSameAsChild = lastBreadcrumb && lastBreadcrumb.textContent === pageNames[0];

    if (isParentSameAsChild) {
      breadcrumbItems.pop(); // Remove the last item if parent and child names are the same
    }

    // Add all page names found for the current path
    pageNames.forEach((pageName, idx) => {
      const liEl = li();
      let link = a();

      // Set the href for all but the last part
      if (index < pathParts.length - 1 || idx < pageNames.length - 1) {
        link.setAttribute('href', currentPath);
      } else {
        link = span();
      }

      link.textContent = pageName;
      liEl.appendChild(link);
      breadcrumbItems.push(liEl);
    });
  });

  if (breadcrumbItems.length > 0) {
    // Append all breadcrumb items to the container if there are more than one
    breadcrumbItems.forEach((item) => {
      crumbList.appendChild(item);
    });
  } else {
    // if we're on the root page, display no breadcrumbs
    breadcrumbContainer.style.display = 'none';
  }

  return breadcrumbContainer;
}

export default async function decorate(block) {
  const breadcrumbs = await buildBreadcrumbs();
  block.innerHTML = '';

  const main = document.querySelector('main > div.section');
  const $carousel = main.querySelector('.carousel-wrapper');
  if ($carousel) {
    $carousel.insertAdjacentElement('afterend', breadcrumbs);
  } else {
    main.insertAdjacentElement('afterbegin', breadcrumbs);
  }
}
