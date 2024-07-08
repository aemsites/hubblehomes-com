import {
  createLinksBlock,
  createDisclaimerFragment,
  createOverviewBlock,
  createCarouselBlock,
  getPageName,
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
}


const createMinimalTabsBlock = (document, main) => {
  const tabs = document.querySelectorAll(
    '.detailaccordioncontent > .accordion-group > .collapse',
  );
  if (tabs.length > 0) {
    const cells = [['Tabs (minimal)']];

    tabs.forEach((tab) => {
      const tabId = tab.id;
      const tabTitleElement = document.querySelector(
        `button[data-target="#${tabId}"]`,
      );
      const tabTitle = tabTitleElement
        ? tabTitleElement.textContent.trim()
        : tabId;

      let tabContent = '';

      if (tabId === 'schools') {
        const schoolDistrict = tab.querySelector('p')?.textContent.trim() || '';
        const schoolDetails = Array.from(tab.querySelectorAll('dl'))
          .map((dl) => {
            const title = dl.querySelector('dt')?.textContent.trim() || '';
            const value = dl.querySelector('dd')?.textContent.trim() || '';
            return `<li>${title}<ul><li>${value}</li></ul></li>`;
          })
          .join('');
        tabContent = `<p>${schoolDistrict}</p><ul>${schoolDetails}</ul>`;
      } else if (tabId === 'amenities') {
        const amenitiesTitle = 'Amenities';

        const ddElements = Array.from(tab.querySelectorAll('dd'));

        const amenities = ddElements
          .flatMap(dd =>
            Array.from(dd.querySelectorAll('p'))
              .flatMap(p => p.textContent.split(/[\n,]/).map(line => line.trim()))
          )
          .filter(text => text.length > 0);

        const amenitiesListItems = amenities.map(amenity => `<li>${amenity}</li>`).join('');

        tabContent = `
          <ul>
            <li>${amenitiesTitle}
              <ul>
                ${amenitiesListItems}
              </ul>
            </li>
          </ul>`;
      } else if (tabId === 'hoa') {
        const hoaTitle = 'HOA Info';
        const hoaInfoElement = tab.querySelector('.blueheader');
        const hoaInfo = hoaInfoElement.textContent
          .split(/\n/)
          .map((info) => info.trim())
          .filter((info) => info)
          .map((info) => `<li>${info}</li>`)
          .join('');

        const ampTitle = tab.querySelector(".blueheader + br + strong").textContent.trim();

        const ampTitleElement = tab.querySelector(".blueheader + br + strong");

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
        tabContent = `
        <ul>
          <li>${hoaTitle}
            <ul>${hoaInfo}</ul>
          </li>
        </ul>
        <div>${ampTitle}</div>
        ${hoaContactInfo}`;
      }

      if (tabContent) {
        cells.push([tabTitle, tabContent]);
      }

    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table)
  }
};

const createMetadata = (main, document, url, html) => {
  const meta = {};

  // Title
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  // Description
  const desc = document.querySelector("[property='og:description']");
  if (desc) {
    meta.Description = desc.content;
  }

  // Image
  const img = document.querySelector("[property='og:image']");
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  // Community Name
  const nameElement = document.querySelector('h1.h1');
  meta.Name = nameElement?.textContent.trim();
  nameElement?.remove();

  const location = document.querySelector('h4 .gtm-drivingdirections');
  location?.remove();

  // Parsing dataLayer script from html
  const scriptMatch = html.match(/<script>(.*?)<\/script>/s);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const dataLayerMatch = scriptContent.match(
      /dataLayer\s*=\s*(\[\{.*?\}\]);/s,
    );
    if (dataLayerMatch) {
      try {
        const jsonString = dataLayerMatch[1]
          .replace(/'/g, '"')
          .replace(/\s+/g, ' ')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*\]/g, ']');

        const dataLayer = JSON.parse(jsonString)[0];

        meta.City = dataLayer.city || '';
        meta.State = dataLayer.state || '';
        meta.Metro = dataLayer.region || '';

        if (dataLayer.community) {
          const communityMatch = dataLayer.community.match(/\d+\s\|\s(.+)/);
          if (communityMatch) {
            meta.Community = communityMatch[1];
          }
        }

        if (dataLayer.model) {
          const modelMatch = dataLayer.model.match(/\d+\s\|\s(.+)/);
          if (modelMatch) {
            meta.Model = modelMatch[1];
          }
        }

        if (dataLayer.spec) {
          meta.Spec = dataLayer.spec;
        }

      } catch (e) {
        console.error('Error parsing dataLayer JSON:', e);
      }
    }
  }

  meta.Path = new URL(url).pathname;

  // Page Name
  meta['Page Name'] = getPageName(document);

  // Create Metadata Block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  return block
};

export default {
  transformDOM: ({ document, url, html, params }) => {
    const main = document.body;
    const meta = createMetadata(main, document, url, html);

    createCarouselBlock(document, main, ['carousel']);
    createOverviewBlock(document, main);
    createCommunityDescriptionBlock(document, main);
    createMinimalTabsBlock(document, main);
    createLinksBlock(document, main);
    createDisclaimerFragment(document, main);

    main.append(meta);

    WebImporter.DOMUtils.remove(main, [
      ':scope > :not(table)',
    ]);
    
    // Remove text nodes from `main`
    Array.from(main.childNodes).forEach(node => {
      if (node.nodeType === 3) { // Node.TEXT_NODE === 3
        main.removeChild(node);
      }
    });

    return main;
  },

  generateDocumentPath: ({ document, url, html, params }) =>
    WebImporter.FileUtils.sanitizePath(
      new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
    ),
};
