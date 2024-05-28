/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** Create Carousel block */
const createCarouselBlock = (document) => {
    const carousel = document.querySelector('#myCarousel');
    if (carousel) {
      const cells = [['Carousel']]; // Title row

      const items = carousel.querySelectorAll('.item');
      items.forEach((item) => {
        const picture = item.querySelector('picture img');
        const imgSrc = picture ? picture.src : '';
        const imgElement = `<img src="${imgSrc}" alt="${picture.alt}">`;

        const title = item.querySelector('.carousel-caption .carousel-header div')?.textContent || '';
        const description = item.querySelector('.carousel-caption .carousel-copy div')?.textContent || '';

        const content = `${imgElement}<h3>${title}</h3><p>${description}</p>`;

        cells.push([content]); // Add the concatenated content as a new row with HTML

        // Check for a PDF link
        const btnLink = item.querySelector('.carousel-button a');
        if (btnLink) {
          const btnUrl = btnLink.href;
          const btnLabel = btnLink.textContent.trim();
          cells.push(['url', btnUrl]); // Add the PDF link as a new row
        }
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      carousel.replaceWith(table); // Replace the original carousel section with the new table
    }
  };
  
  const createMetadata = (main, document, url) => {
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
  
    // Path, State, Metro, Area from URL
    const urlParts = new URL(url).pathname.split('/').filter(part => part);
    if (urlParts.length >= 4) {
      meta.State = urlParts[1];
      meta.Metro = urlParts[2];
      meta.Area = urlParts[3];
    }
    meta.Path = new URL(url).pathname;

    // Template
    if (url.includes('/news/')) {
      meta.Template = 'news';
    } else {
      meta.Template = 'location';
    }

    // Published Date
    const postDateElement = document.querySelector('.text-center small strong');
    if (postDateElement && postDateElement.textContent.includes('Posted:')) {
      meta.PublishedDate = postDateElement.nextSibling.textContent.split('|')[0].trim();
      postDateElement.remove();
    }

    // Categories
    const categoriesElement = document.querySelector('.text-center small');
    if (categoriesElement) {
      const categoriesText = categoriesElement.textContent;
      const categoriesLabelIndex = categoriesText.indexOf('Categories:');
      if (categoriesLabelIndex !== -1) {
        const categoriesString = categoriesText.substring(categoriesLabelIndex + 'Categories:'.length).trim();
        const categoriesArray = categoriesString
          .split(/\s*[/|]\s*/)
          .map((category) => category.trim());
        meta.Categories = categoriesArray.join(', ');
      }
      categoriesElement.remove();
    }

    // Create Metadata Block
    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);
  
    return meta;
  };

  const removeUnwantedSections = (document) => {
    // Remove filters section
    const filtersSection = document.querySelector('.well small');
    if (filtersSection) {
        filtersSection.parentElement.remove();
    }

    // Remove any <img> directly inside the <body> tag
    const bodyImages = Array.from(document.body.querySelectorAll(':scope > img'));
    bodyImages.forEach((img) => img.remove());
  };

  export default {
    transformDOM: ({
      document,
      url,
      html,
      params,
    }) => {
      const main = document.body;

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
      ]);

      removeUnwantedSections(document);
      createCarouselBlock(document);
      createMetadata(main, document, url);
  
      return main;
    },

    generateDocumentPath: ({
      document,
      url,
      html,
      params,
    }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
  };
