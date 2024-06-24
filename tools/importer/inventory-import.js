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
  const carousel = document.querySelector('.homesearchmap');
  if (carousel) {
    const cells = [['Carousel (auto-2000)']]; // Title row

    const communityTitleTop = document.querySelector('.communitytitle-top');
    const communityTitleBottom = document.querySelector(
      '.communitytitle-bottom',
    );
    const defaultText = `Default Slide Text
      (optional)`;

    cells.push([defaultText, '']);

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
    main.append(table);
  }
}


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
    createLinksBlock(document, main);
    createActionButtonBlock(document, main);
    createFloorplanTabsBlock(document, main);
    createEmbedBlock(document, main);
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
