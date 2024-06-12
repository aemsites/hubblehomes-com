/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** Create Carousel block */
const createCarouselBlock = (document) => {
  const carousel = document.querySelector('#myCarousel');
  if (carousel) {
    const cells = [['Carousel (auto-2000)']]; // Title row

    const communityTitleTop = document.querySelector('.communitytitle-top');
    const communityTitleBottom = document.querySelector(
      '.communitytitle-bottom',
    );
    const defaultText = `Default Slide Text
      (optional)`;

    let title1Html = communityTitleTop
      ? `<h2>${
          communityTitleTop.querySelector('#communitytitle-1')?.innerHTML || ''
        }</h2>${
          communityTitleTop.querySelector('#communitytitle-2')?.innerHTML || ''
        }`
      : '';

    let title2Html = communityTitleBottom
      ? `<h2>${
          communityTitleBottom.querySelector('#communitytitle-3')?.innerHTML ||
          communityTitleBottom.querySelector('.communitytitle-large')
            ?.innerHTML ||
          ''
        }</h2>${
          communityTitleBottom.querySelector('#communitytitle-4')?.innerHTML ||
          communityTitleBottom.querySelector('.communitytitle-medium')
            ?.innerHTML ||
          ''
        }`
      : '';

    if (title1Html || title2Html) {
      let combinedTitleHtml = `${title1Html}<hr>${title2Html}`;
      cells.push([defaultText, combinedTitleHtml]);
    }

    communityTitleTop?.remove();
    communityTitleBottom?.remove();

    const items = carousel.querySelectorAll('.item');
    items.forEach((item) => {
      const picture = item.querySelector('picture img');
      const imgSrc = picture ? picture.src : '';
      const imgElement = `<img src="${imgSrc}" alt="${picture?.alt || ''}">`;

      const title =
        item.querySelector('.carousel-caption .carousel-header div')
          ?.textContent || '';
      const description =
        item.querySelector('.carousel-caption .carousel-copy div')
          ?.textContent || '';

      let content = `${imgElement}<h3>${title}</h3><p>${description}</p>`;

      cells.push([content, '']); // Add the concatenated content as a new row with HTML

      // Check for a PDF link
      const btnLink = item.querySelector('.carousel-button a');
      if (btnLink) {
        const btnUrl = btnLink.href;
        cells.push(['url', btnUrl]); // Add the PDF link as a new row
      }
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    carousel.replaceWith(table); // Replace the original carousel section with the new table
  }
};

const createDescriptionBlock = (document) => {
  const descriptionContainer = document.querySelector('.col-sm-6.col-xs-6');
  const descriptionText = descriptionContainer?.innerHTML.trim();

  const cells = [['Description'], [descriptionText]];

  const table = WebImporter.DOMUtils.createTable(cells, document);
  descriptionContainer?.replaceWith(table);
};

const createSubNavBlock = (document) => {
  const tabs = document.querySelectorAll(
    '.detailaccordioncontent > .accordion-group > .collapse',
  );
  if (tabs.length > 0) {
    const cells = [['SubNav']];

    tabs.forEach((tab) => {
      const tabId = tab.id;
      const tabTitleElement = document.querySelector(
        `button[data-target="#${tabId}"]`,
      );
      const tabTitle = tabTitleElement
        ? tabTitleElement.textContent.trim()
        : tabId;

      let tabContent = '';
      if (tabId === 'overview') {
        const overviewCategories = Array.from(tab.querySelectorAll('dt'))
          .map((el) => el.textContent.trim().toLowerCase())
          .join(', ');
        tabContent = `<p>${overviewCategories}</p>`;
      } else if (tabId === 'interactivesitemap') {
        const interactiveSitePlan = tab.querySelector(
          'a.gtm-interactivesiteplan',
        )
          ? 'interactive site plan'
          : '';
        const staticSitemap = tab.querySelector('a.gtm-siteplanpdf')
          ? 'static sitemap'
          : '';
        const sitemapCategories = [interactiveSitePlan, staticSitemap]
          .filter(Boolean)
          .join(', ');
        tabContent = `<p>${sitemapCategories}</p>`;
      } else if (tabId === 'schools') {
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
        const amenities = Array.from(tab.querySelectorAll('dd p'))
          .map((el) => el.textContent.trim())
          .join(', ');
        tabContent = `<ul><li>${amenitiesTitle}<ul><li>${amenities}</li></ul></li></ul>`;
      } else if (tabId === 'hoa') {
        const hoaTitle = 'HOA Info';
        const hoaInfo = Array.from(tab.querySelectorAll('.blueheader'))
          .map((el) => el.innerHTML.split('<br>'))
          .flat()
          .map((info) => info.trim())
          .filter((info) => info)
          .map((info) => `<li>${info}</li>`)
          .join('');
        const ampTitle = 'AMP (Alliance Management Partners)';
        const hoaContactInfo = Array.from(tab.querySelectorAll('a, small'))
          .map((el) => el.textContent.trim())
          .join('\n');
        tabContent = `<ul><li>${hoaTitle}<ul>${hoaInfo}</ul></li></ul>\n${ampTitle}\n${hoaContactInfo}`;
      } else if (tabId === 'ebrochure') {
        const eBrochureTitle = 'eBrochure';
        const eBrochureLink = tab.querySelector('a.gtm-ebrochure')
          ? tab.querySelector('a.gtm-ebrochure').outerHTML
          : '';
        tabContent = `<ul><li>${eBrochureTitle}<ul><li>${eBrochureLink}</li></ul></li></ul>`;
      } else if (tabId !== 'videophotos') {
        tabContent = tab.innerHTML.trim();
      }

      if (tabTitle && tabId !== 'videophotos') {
        cells.push([tabTitle, tabContent]);
      }
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    document.querySelector('.detailaccordioncontent').replaceWith(table);
  }
};

const createElevationGalleryBlock = (document) => {
  const elevationGallerySection = document.querySelectorAll(
    '.col-sm-3 a.fancybox',
  );
  if (elevationGallerySection?.length > 0) {
    const cells = [['Elevation Gallery']];

    elevationGallerySection.forEach((section) => {
      const imgElement = section.querySelector('img');
      const imgSrc = imgElement ? imgElement.src : '';
      const imgAlt = imgElement ? imgElement.alt : '';
      const imgHtml = `<img src="${imgSrc}" alt="${imgAlt}">`;

      const label =
        section.querySelector('.carousel-caption')?.textContent.trim() || '';

      cells.push([label, imgHtml]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    elevationGallerySection[0]
      ?.closest('.container.topbuffer')
      .replaceWith(table); // Replace the original section with the new table
  }
};

const createFloorplanLinksBlock = (document) => {
  const linksContainer = document.querySelector(
    '.container.topbuffer .row .col-sm-12.text-center',
  );
  if (linksContainer) {
    const cells = [['Floorplan Links']];
    const interactiveFloorPlanLink = linksContainer.querySelector(
      'a.gtm-interactivefloorplan',
    );
    const floorPlanHandoutLink = linksContainer.querySelector(
      'a.gtm-printablefloorplan',
    );

    if (interactiveFloorPlanLink) {
      cells.push([
        'Interactive Floor Plan',
        interactiveFloorPlanLink.outerHTML,
      ]);
    }
    if (floorPlanHandoutLink) {
      cells.push(['Floor Plan Handout', floorPlanHandoutLink.outerHTML]);
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    linksContainer.replaceWith(table);
  }
};

const createFloorplanImagesBlock = (document) => {
  const floorplanContainer = document.querySelector('.responsive-tabs');
  if (floorplanContainer) {
    const cells = [['Floorplan Images']];

    // Floorplan levels
    const levels = floorplanContainer.querySelectorAll('h4');
    levels.forEach((level) => {
      const img = level.nextElementSibling.querySelector('img');
      if (img) {
        cells.push([
          `<h4>${level.textContent}</h4>`,
          `<img src="${img.src}" alt="${img.alt}">`,
        ]);
      }
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    floorplanContainer.replaceWith(table); // Replace the original floorplan section with the new table
  }
};

const createEmbedBlock = (document) => {
  const matterportIframe = document.querySelector(
    '.embed-responsive-item[src*="matterport.com"]',
  );
  const matterportSrc = matterportIframe?.src;
  if (matterportIframe) {
    const cells = [['Embed (Matterport)']];
    cells.push(['URL', matterportSrc]);

    const table = WebImporter.DOMUtils.createTable(cells, document);
    const container = matterportIframe.closest('.container.topbuffer');
    if (container) {
      container.replaceWith(table);
    }
  }
};

const createDisclaimerBlock = (document) => {
  const cells = [['Fragment (disclaimer)']];
  cells.push([
    'https://main--hubblehomes-com--aemsites.hlx.page/fragments/disclaimer',
  ]);

  const table = WebImporter.DOMUtils.createTable(cells, document);

  const disclaimerContainer = document.querySelector(
    '.col-sm-12.text-center small small',
  );
  if (disclaimerContainer) {
    disclaimerContainer.replaceWith(table);
  }
};

const createLinksBlock = (document) => {
  const linksContainer = document.querySelector('.detaillinks');
  if (linksContainer) {
    const links = Array.from(linksContainer.querySelectorAll('a'))
      .map((link) => link.outerHTML)
      .join('<br>');

    const cells = [['Links'], [links]];

    const table = WebImporter.DOMUtils.createTable(cells, document);

    const detailAccordionThirdColumn = document.querySelector(
      '.detailthirdcolumncontent',
    );
    detailAccordionThirdColumn.replaceWith(table);
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

        meta.Spec = dataLayer.spec || '';
      } catch (e) {
        console.error('Error parsing dataLayer JSON:', e);
      }
    }
  }

  meta.Path = new URL(url).pathname;

  // Template
  meta.Template = 'models';

  // nameElement
  const nameElement = document.querySelector('.col-sm-6 h2');
  if (nameElement) {
    meta.Name = nameElement.textContent.trim();
    nameElement.remove();
  }

  // nameElement
  const homeStyleElement = document.querySelector('.col-sm-6 h4');
  if (homeStyleElement) {
    meta.Homestyle = homeStyleElement.textContent.trim();
    homeStyleElement.remove();
  }

  // Create Metadata Block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const removeUnwantedSections = (document) => {
  // Remove filters section
  const filtersSection = document.querySelector('.well small');
  filtersSection?.parentElement.remove();

  // Remove specific .container elements but not the ones containing home specialists
  const containers = document.querySelectorAll('.container');
  containers.forEach((container) => {
    if (container.querySelector('.panel-group')) {
      container.remove();
    }
  });

  // const detailAccordion = document.querySelector('.detailaccordioncontent');
  // detailAccordion?.remove();

  const detailAccordionThirdColumn = document.querySelector(
    '.detailthirdcolumncontent',
  );
  detailAccordionThirdColumn?.remove();
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({ document, url, html, params }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      '.navholder',
      '#skiptocontent',
      '.footerrow',
      '.subfooter',
      '.breadcrumb',
      '.sidebar',
      '.sharethis-inline-share-buttons',
      'form',
      '#chat-widget-container',
      '.mobile-footer',
      '.modal-footer',
      '.cd-top',
      '#buttonClickModal',
      'noscript',
      '#communities',
      '.homesearchform',
      '.container > .row > .col-sm-12 > .btn-group',
      '.container > .row > .col-sm-12 > small > a',
      '.modal',
      '.graydivider',
      ':scope > img',
      '#inventoryshowhide',
      '.btn-fancy',
      '.modeldetailbuyerschoice',
      '.btn-primary',
    ]);

    // Use helper methods to create and append various blocks to the main element
    // Add other blocks creation calls here, e.g., createTabs(main, document);
    createCarouselBlock(document);
    createDescriptionBlock(document);
    createSubNavBlock(document);
    createElevationGalleryBlock(document);
    createFloorplanLinksBlock(document);
    createFloorplanImagesBlock(document);
    createEmbedBlock(document);
    createLinksBlock(document);
    createDisclaimerBlock(document);
    createMetadata(main, document, url, html);
    removeUnwantedSections(document);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) =>
    WebImporter.FileUtils.sanitizePath(
      new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
    ),
};
