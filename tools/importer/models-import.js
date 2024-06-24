import {
  createDisclaimerFragment,
  createLinksBlock,
  createDescriptionBlock,
  createOverviewBlock,
  createActionButtonBlock,
  createFloorplanTabsBlock,
  createEmbedBlock
} from './common.js';

/** Create Carousel block */
const createCarouselBlock = (document, main) => {
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
      ? `<h2>${communityTitleTop.querySelector('#communitytitle-1')?.innerHTML || ''
      }</h2>${communityTitleTop.querySelector('#communitytitle-2')?.innerHTML || ''
      }`
      : '';

    let title2Html = communityTitleBottom
      ? `<h2>${communityTitleBottom.querySelector('#communitytitle-3')?.innerHTML ||
      communityTitleBottom.querySelector('.communitytitle-large')
        ?.innerHTML ||
      ''
      }</h2>${communityTitleBottom.querySelector('#communitytitle-4')?.innerHTML ||
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
    main.append(table); // Replace the original carousel section with the new table
  }
};


const createElevationGalleryBlock = (document, main) => {
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
    main.append(table);
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

  // nameElement
  const nameElement = document.querySelector('.col-sm-6 h2');
  if (nameElement) {
    meta.Name = nameElement.textContent.trim();
    nameElement.remove();
  }

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

    // Use helper methods to create and append various blocks to the main element
    createCarouselBlock(document, main);
    createDescriptionBlock(document, main);
    createOverviewBlock(document, main);
    createElevationGalleryBlock(document, main);
    createActionButtonBlock(document, main);
    createFloorplanTabsBlock(document, main);
    createEmbedBlock(document, main);
    createLinksBlock(document, main);
    createDisclaimerFragment(document, main);
    createMetadata(main, document, url, html);

    WebImporter.DOMUtils.remove(main, [
      ':scope > :not(table)',
    ]);

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
