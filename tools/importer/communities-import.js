/* eslint-disable no-undef, no-unused-vars  */

import {
  createLinksBlock,
  createDisclaimerFragment,
  createOverviewBlock,
  createCarouselBlock,
  updateCommonMetadata,
  convertRelativeLinks,
} from './common.js';

const createCommunityDescriptionBlock = (document, main) => {
  const descriptionContainer = document.querySelector('.col-sm-6.col-xs-6');

  descriptionContainer?.querySelector('h1')?.remove();
  descriptionContainer?.querySelector('h4')?.remove();
  descriptionContainer?.querySelector('.row')?.remove();

  const descriptionText = descriptionContainer?.innerHTML.trim();

  const cells = [['Description'], [descriptionText]];

  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
};

const handleSchoolsTab = (tab) => {
  const schoolDistrict = tab.querySelector('p')?.textContent.trim() || '';
  const schoolDetails = Array.from(tab.querySelectorAll('dl'))
    .map((dl) => {
      const title = dl.querySelector('dt')?.textContent.trim() || '';
      const value = dl.querySelector('dd')?.textContent.trim() || '';
      return `<li>${title}<ul><li>${value}</li></ul></li>`;
    })
    .join('');
  return `<p>${schoolDistrict}</p><ul>${schoolDetails}</ul>`;
};

const handleAmenitiesTab = (tab) => {
  const amenitiesTitle = 'Amenities';
  const ddElements = Array.from(tab.querySelectorAll('dd'));
  const amenities = ddElements
    .flatMap((dd) => Array.from(dd.querySelectorAll('p'))
      .flatMap((p) => p.textContent.split(/[\n]/)
        .map((line) => line.trim()))
      .filter((text) => text.length > 0));

  const amenitiesListItems = amenities.map((amenity) => `<li>${amenity}</li>`).join('');

  return `
    <ul>
      <li>${amenitiesTitle}
        <ul>
          ${amenitiesListItems}
        </ul>
      </li>
    </ul>`;
};

const handleHoaTab = (tab) => {
  const hoaTitle = 'HOA Info';
  const hoaInfoElement = tab.querySelector('.blueheader');
  const hoaInfo = hoaInfoElement.textContent
    .split(/\n/)
    .map((info) => info.trim())
    .filter((info) => info)
    .map((info) => `<li>${info}</li>`)
    .join('');

  const ampTitle = tab.querySelector('.blueheader + br + strong').textContent.trim();
  const ampTitleElement = tab.querySelector('.blueheader + br + strong');

  let nextElement = ampTitleElement.nextSibling;
  const elementsAfterAmpTitle = [];
  while (nextElement) {
    if (nextElement.nodeType === Node.ELEMENT_NODE) {
      elementsAfterAmpTitle.push(`<div>${nextElement.outerHTML}</div>`);
    } else if (nextElement.nodeType === Node.TEXT_NODE) {
      const trimmedText = nextElement.textContent.trim();
      if (trimmedText) {
        elementsAfterAmpTitle.push(`<div>${trimmedText}</div>`);
      }
    }
    nextElement = nextElement.nextSibling;
  }

  const hoaContactInfo = elementsAfterAmpTitle.join('');
  return `
  <ul>
    <li>${hoaTitle}
      <ul>${hoaInfo}</ul>
    </li>
  </ul>
  <div>${ampTitle}</div>
  ${hoaContactInfo}`;
};

const handleInteractiveSitemapTab = (tab) => {
  let tabContent = '';
  let dlChild = tab.querySelector('dl').firstElementChild;
  while (dlChild) {
    if (dlChild.tagName === 'DT') {
      const title = dlChild.textContent.trim();
      if (!title.toLowerCase().includes('interactive')) {
        const ddElement = dlChild.nextElementSibling;
        const links = Array.from(ddElement.querySelectorAll('a'));
        const linksHtml = Array.from(links).map((link) => `<li>${link.outerHTML}</li>`).join('\n');
        const listHtml = `<ul>${linksHtml}</ul>`;
        tabContent += `<ul><li>${title}${listHtml}</li></ul>`;
      }
    }
    dlChild = dlChild.nextElementSibling;
  }
  return tabContent;
};

const createMinimalTabsBlock = (document, main) => {
  const tabs = document.querySelectorAll('.detailaccordioncontent > .accordion-group > .collapse');
  if (tabs.length > 0) {
    const cells = [['Tabs (minimal)']];

    tabs.forEach((tab) => {
      const tabId = tab.id;
      const tabTitleElement = document.querySelector(`button[data-target="#${tabId}"]`);
      let tabTitle = tabTitleElement ? tabTitleElement.textContent.trim() : tabId;

      let tabContent = '';

      switch (tabId) {
        case 'schools':
          tabContent = handleSchoolsTab(tab);
          break;
        case 'amenities':
          tabContent = handleAmenitiesTab(tab);
          break;
        case 'hoa':
          tabContent = handleHoaTab(tab);
          break;
        case 'interactivesitemap':
          tabTitle = 'Site Details';
          tabContent = handleInteractiveSitemapTab(tab);
          break;
        default:
          break;
      }

      if (tabContent) {
        cells.push([tabTitle, tabContent]);
      }
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const createMetadata = (document, url, html) => {
  const meta = updateCommonMetadata(document, url, html);

  // Community Name
  const nameElement = document.querySelector('h1.h1');
  meta.Name = nameElement?.textContent.trim();
  nameElement?.remove();

  // const location = document.querySelector('h4 .gtm-drivingdirections');
  // location?.remove();

  // Create Metadata Block
  return WebImporter.Blocks.getMetadataBlock(document, meta);
};

export default {
  transformDOM: ({ document, url, html }) => {
    const main = document.body;
    const meta = createMetadata(document, url, html);

    createCarouselBlock(document, main, ['carousel'], true);
    createOverviewBlock(document, main);
    createCommunityDescriptionBlock(document, main);
    createMinimalTabsBlock(document, main);
    createLinksBlock(document, main);
    createDisclaimerFragment(document, main);

    convertRelativeLinks(main);

    main.append(meta);

    WebImporter.DOMUtils.remove(main, [
      ':scope > :not(table)',
    ]);

    // Remove text nodes from `main`
    Array.from(main.childNodes).forEach((node) => {
      if (node.nodeType === 3) { // Node.TEXT_NODE === 3
        main.removeChild(node);
      }
    });

    return main;
  },

  generateDocumentPath: ({
    document,
    url,
    html,
    params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
