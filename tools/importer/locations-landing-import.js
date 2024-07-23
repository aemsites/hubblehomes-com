/* eslint-disable no-undef */

import {
  createCarouselBlock,
  updateCommonMetadata,
} from './common.js';

const createMetadata = (document, url, html) => {
  const meta = updateCommonMetadata(document, url, html);

  return WebImporter.Blocks.getMetadataBlock(document, meta);
};

export default {
  transformDOM: ({
    document, url, html,
  }) => {
    const main = document.body;

    createCarouselBlock(document, main, ['carousel']);

    let description = document.querySelector('.col-md-12.text-center');
    // check if the description element has  an H1 and has a p
    if (description && description.querySelector('h1')) {
      description.classList.add('description');
      main.append(description);
    } else {
      description = null;
    }

    const meta = createMetadata(document, url, html);
    main.append(meta);

    // only keep tables or elements with a .description class
    WebImporter.DOMUtils.remove(main, [
      ':scope > :not(table):not(.description)',
    ]);

    return main;
  },

  generateDocumentPath: ({
    url,
  }) => WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
  ),
};
