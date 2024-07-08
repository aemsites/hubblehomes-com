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
  getPageName,
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

// Function to extract only the words
const extractWord = (str) => {
  // Regular expression to match and remove non-alphabetical characters at the beginning and end
  return str.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').trim();
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

        if (dataLayer.city) {
          meta.City = dataLayer.city;
        }

        if (dataLayer.state) {
          meta.State = dataLayer.state;
        }

        if (dataLayer.region) {
          meta.Metro = dataLayer.region;
        }

        if (dataLayer.spec) {
          meta.Spec = dataLayer.spec;
        }

        if (dataLayer.community) {
          const community = extractWord(dataLayer.community);
          if (community) {
            meta.Community = community;
          }
        }

        if (dataLayer.model) {
          const model = extractWord(dataLayer.model);
          if (model) {
            meta.Model = model;
          }
        }

      } catch (e) {
        console.error('Error parsing dataLayer JSON:', e);
      }
    }
  }

  meta.Path = new URL(url).pathname;

  const homeStyleElement = document.querySelector('.col-sm-6 h2 + h4');
  if (homeStyleElement) {
    meta.Homestyle = homeStyleElement.textContent.trim();
    homeStyleElement.remove();
  }

  // Page Name
  meta['Page Name'] = getPageName(document);

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
  transformDOM: ({ document, url, html, params }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    const meta = createMetadata(main, document, url, html);

    // Use helper methods to create and append various blocks to the main element
    createCarouselBlock(document, main, ['gallery', 'carousel']);
    createDescriptionBlock(document, main);
    createOverviewBlock(document, main);
    createElevationGalleryBlock(document, main);
    createActionButtonBlock(document, main);
    createFloorplanTabsBlock(document, main);
    createEmbedBlock(document, main);
    createLinksBlock(document, main);
    createDisclaimerFragment(document, main);

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
