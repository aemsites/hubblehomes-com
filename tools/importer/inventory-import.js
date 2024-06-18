/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** Create Carousel block */
const createCarouselBlock = (document) => {
  const carousel = document.querySelector('.homesearchmap');
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
          communityTitleTop.querySelector('#communitytitle-1')?.innerHTML ||
          communityTitleTop.querySelector('.communitytitle-large')?.innerHTML ||
          ''
        }</h2>${
          communityTitleTop.querySelector('#communitytitle-2')?.innerHTML ||
          communityTitleBottom.querySelector('.communitytitle-small')
            ?.innerHTML ||
          ''
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

    const imageGalleryElements =
      document.querySelectorAll('#imagegallery2 img');
    if (imageGalleryElements.length > 0) {
      imageGalleryElements.forEach((img) => {
        const imgElement = `<img src="${img.src}" alt="${img.alt}" style="display:block;">`;
        cells.push([imgElement, '']);
      });
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    carousel?.replaceWith(table); // Replace the original carousel section with the new table
    imageGalleryElements[0].closest('.container.topbuffer')?.remove();
  }
};

const createDescriptionBlock = (document) => {
  const descriptionContainer = document.querySelector('.col-sm-6.col-xs-6');
  const headerInfo = document.querySelector('.col-sm-6.col-xs-6 .row');
  headerInfo.remove();

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
        tabContent = `<code>${overviewCategories}</code>`;
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
      } else if (tabId === 'ebrochure' || tabId === 'interactivefloorplan') {
        const title =
          tabId === 'ebrochure' ? 'eBrochure' : 'Interactive Floor Plan';
        const linkClass =
          tabId === 'ebrochure' ? 'gtm-ebrochure' : 'gtm-interactivefloorplan';
        const linkElement = tab.querySelector(`a.${linkClass}`);
        const linkHtml = linkElement ? linkElement.outerHTML : '';
        tabContent = `<ul><li>${title}<ul><li>${linkHtml}</li></ul></li></ul>`;
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
  const renderingImagesSection = document.querySelectorAll(
    '.col-sm-3 a.fancybox',
  );
  if (renderingImagesSection?.length > 0) {
    const cells = [['Elevation Gallery']];

    renderingImagesSection.forEach((section) => {
      const sectionHtml = section.innerHTML;
      cells.push([sectionHtml]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    renderingImagesSection[0]
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

  // nameElement
  const nameElement = document.querySelector('.col-sm-6 h2');
  if (nameElement) {
    meta.Name = nameElement.textContent.trim();
    nameElement.remove();
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

  // Published Date
  const postDateElement = document.querySelector('.text-center small strong');
  if (postDateElement && postDateElement.textContent.includes('Posted:')) {
    meta.PublishedDate = postDateElement.nextSibling.textContent
      .split('|')[0]
      .trim();
    postDateElement.remove();
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

  const subnav = document.querySelector(
    '.container > .row > .col-sm-12 > .btn-group',
  );
  subnav?.remove();

  const rowElement = document.querySelector(
    '.row .col-sm-6 .row, .row .col-sm-6 .gtm-getdrivingdirectionsinventory, .row .col-sm-6 h4, .row .col-sm-6 h5, .row .col-sm-6 .rightdivider, .row .col-sm-6 .padding-0',
  );
  if (rowElement) {
    rowElement.remove();
  }
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
      '.container > .row > .col-sm-12 > small > a',
      '.container > .row > .col-sm-6 > small > a',
      '.modal',
      '.graydivider',
      ':scope > img',
      '#inventoryshowhide',
      '.container.topbuffer small',
      '.btn-fancy',
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
