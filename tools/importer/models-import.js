/* eslint-disable no-undef */
import {
  createDisclaimerFragment,
  createLinksBlock,
  createDescriptionBlock,
  createOverviewBlock,
  createActionButtonBlock,
  createFloorplanTabsBlock,
  createEmbedBlock,
  cleanupImageSrc,
  createCarouselBlock,
  convertRelativeLinks,
  updateCommonMetadata,
} from './common.js';

const createElevationGalleryBlock = (document, main) => {
  const elevationGallerySection = document.querySelectorAll(
    '.col-sm-3 a.fancybox',
  );
  if (elevationGallerySection?.length > 0) {
    const cells = [['Elevations']];

    elevationGallerySection.forEach((section) => {
      const imgElement = section.querySelector('img');
      const imgSrc = imgElement ? imgElement.src : '';
      const imgAlt = imgElement ? imgElement.alt : '';
      const imgHtml = `<img src="${cleanupImageSrc(imgSrc)}" alt="${imgAlt}">`;

      const label = section.querySelector('.carousel-caption')?.textContent.trim() || '';

      cells.push([label, imgHtml]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const createMetadata = (main, document, url, html) => {
  const meta = updateCommonMetadata(document, url, html);

  const homeStyleElement = document.querySelector('.col-sm-6 h2 + h4');
  if (homeStyleElement) {
    meta.Homestyle = homeStyleElement.textContent.trim();
    homeStyleElement.remove();
  }

  // Create Metadata Block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  return block;
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
  /* eslint-disable no-unused-vars */
  transformDOM: ({
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    const meta = createMetadata(main, document, url, html);

    // Use helper methods to create and append various blocks to the main element
    createCarouselBlock(document, main, ['gallery', 'carousel'], true, false);
    createDescriptionBlock(document, main);
    createOverviewBlock(document, main);
    createElevationGalleryBlock(document, main);
    createActionButtonBlock(document, main);
    createFloorplanTabsBlock(document, main);
    createEmbedBlock(document, main);
    createLinksBlock(document, main);
    createDisclaimerFragment(document, main);
    convertRelativeLinks(main);

    main.append(meta);

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
    document,
    url,
    html,
    params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
