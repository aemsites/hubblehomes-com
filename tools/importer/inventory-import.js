/* eslint-disable no-unused-vars, no-undef */

import {
  createDisclaimerFragment,
  createLinksBlock,
  createDescriptionBlock,
  createOverviewBlock,
  createActionButtonBlock,
  createFloorplanTabsBlock,
  createEmbedBlock,
  createCarouselBlock,
  updateCommonMetadata,
  convertRelativeLinks,
} from './common.js';

const createMetadata = (main, document, url, html) => {
  // Get common metadata
  const meta = updateCommonMetadata(document, url, html);

  // nameElement
  const nameElement = document.querySelector('.col-sm-6 h2');
  if (nameElement) {
    meta.Name = nameElement.textContent.trim();
    nameElement.remove();
  }

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
  transformDOM: ({
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // Use helper methods to create and append various blocks to the main element
    createCarouselBlock(document, main, ['gallery'], true, false);
    createDescriptionBlock(document, main);
    createOverviewBlock(document, main);
    createLinksBlock(document, main);
    createActionButtonBlock(document, main);
    createFloorplanTabsBlock(document, main);
    createEmbedBlock(document, main);
    createDisclaimerFragment(document, main);
    createMetadata(main, document, url, html);

    convertRelativeLinks(main);

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
  }) => WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
  ),
};
