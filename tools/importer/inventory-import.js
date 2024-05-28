  /* eslint-disable max-len */
  /* eslint-disable no-unused-vars */
  /* eslint-disable no-undef */
  /** Create Carousel block */
  const createCarouselBlock = (document) => {
    const carousel = document.querySelector('.homesearchmap');
    if (carousel) {
      const cells = [['Carousel (map)']]; // Title row
  
      const communityTitleTop = document.querySelector('.communitytitle-top');
      const communityTitleBottom = document.querySelector('.communitytitle-bottom');
      const defaultText = 
      `Default Slide Text
      (optional)`;
      
      let title1Html = communityTitleTop ? 
      `<h2>${communityTitleTop.querySelector('#communitytitle-1')?.innerHTML 
      || communityTitleTop.querySelector('.communitytitle-large')?.innerHTML || 
      ''}</h2>${communityTitleTop.querySelector('#communitytitle-2')?.innerHTML
      || communityTitleBottom.querySelector('.communitytitle-small')?.innerHTML || ''}` : '';

      let title2Html = communityTitleBottom ? 
      `<h2>${communityTitleBottom.querySelector('#communitytitle-3')?.innerHTML || 
      communityTitleBottom.querySelector('.communitytitle-large')?.innerHTML || 
      ''}</h2>${communityTitleBottom.querySelector('#communitytitle-4')?.innerHTML 
      || communityTitleBottom.querySelector('.communitytitle-medium')?.innerHTML || ''}` : '';
    

      
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
  
        const title = item.querySelector('.carousel-caption .carousel-header div')?.textContent || '';
        const description = item.querySelector('.carousel-caption .carousel-copy div')?.textContent || '';
  
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
  
    const createRenderingImagesBlock = (document) => {
        const renderingImagesSection = document.querySelectorAll('.col-sm-3 a.fancybox');
        if (renderingImagesSection?.length > 0) {
            const cells = [['RenderingImages']];

            renderingImagesSection.forEach((section) => {
                const sectionHtml = section.innerHTML;
                cells.push([sectionHtml]);
            });

            const table = WebImporter.DOMUtils.createTable(cells, document);
            renderingImagesSection[0]?.closest('.container.topbuffer').replaceWith(table); // Replace the original section with the new table
        }
    };

    const createFloorplanBlock = (document) => {
        const floorplanContainer = document.querySelector('.responsive-tabs');
        if (floorplanContainer) {
            const cells = [['Floorplan']];
        
            // Find the correct PDF link
            const pdfLink = document.querySelector('a.gtm-interactivefloorplan');
            if (pdfLink) {
                cells.push(['pdfLink', `<a href="${pdfLink.href}" target="_blank">Interactive Floor Plan</a>`]);
            }
        
            // Floorplan levels
            const levels = floorplanContainer.querySelectorAll('h4');
            levels.forEach((level) => {
            const img = level.nextElementSibling.querySelector('img');
            if (img) {
                cells.push([`<h4>${level.textContent}</h4><img src="${img.src}" alt="${img.alt}">`]);
            }
            });
        
            const table = WebImporter.DOMUtils.createTable(cells, document);
            floorplanContainer.replaceWith(table); // Replace the original floorplan section with the new table
        }
    };
      

  const createEmbedBlock = (document) => {
    const matterportIframe = document.querySelector('.embed-responsive-item[src*="matterport.com"]');
    const matterportSrc = matterportIframe?.src;
    if (matterportIframe) {
      const cells = [['embed (Matterport)']];
      cells.push(['URL', matterportSrc]);
  
      const table = WebImporter.DOMUtils.createTable(cells, document);
      const container = matterportIframe.closest('.container.topbuffer');
      if (container) {
        container.replaceWith(table);
      }
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
        meta.Community = urlParts[4];
    }
    meta.Path = new URL(url).pathname;

    // Template
    meta.Template = 'inventory';

    // Published Date
    const postDateElement = document.querySelector('.text-center small strong');
    if (postDateElement && postDateElement.textContent.includes('Posted:')) {
        meta.PublishedDate = postDateElement.nextSibling.textContent.split('|')[0].trim();
        postDateElement.remove();
    }

    const pdfLinkElement = document.querySelector('a[href$=".pdf"]');
    if (pdfLinkElement) {
        meta.PdfLink = pdfLinkElement.getAttribute('href').trim();
    }

    // Address, MLS, Estimated Monthly Payment
    const addressElement = document.querySelector('.col-sm-6 h4 a.gtm-getdrivingdirectionsinventory');
    if (addressElement) {
        meta.Address = addressElement.textContent.trim();
    }

    const mlsElement = document.querySelector('.col-sm-6 h5');
    if (mlsElement) {
        meta.MLS = mlsElement.textContent.trim().replace('MLS#', '').trim();
    }

    const estimatedPaymentElement = document.querySelector('.col-md-6 h3 span');
    if (estimatedPaymentElement) {
        const paymentText = estimatedPaymentElement.parentNode.textContent.trim();
        meta.EstimatedMonthlyPayment = paymentText.replace('/mo*', '').trim();
    }

    // Overview section - extracting each item individually
    const overviewSection = document.querySelector('#overview');
    if (overviewSection) {
        const dlItems = overviewSection.querySelectorAll('dl > dt');
        dlItems.forEach((dt, index) => {
            const dd = dt.nextElementSibling;
            if (dd) {
                const text = dd.textContent.trim();
                switch (dt.textContent.trim()) {
                    case 'Price':
                        meta.Pricing = text;
                        break;
                    case 'Square Feet':
                        meta.SquareFeet = text;
                        break;
                    case 'Beds':
                        meta.Beds = text;
                        break;
                    case 'Baths':
                        meta.Baths = text;
                        break;
                    case 'Cars':
                        meta.Cars = text;
                        break;
                    case 'Den/Study':
                        meta.DenStudy = text;
                        break;
                    case 'Primary Bed':
                        meta.PrimaryBed = text;
                        break;
                    case 'Full Bed on First':
                        meta.FullBedOnFirst = text;
                        break;
                    case 'Full Bath Main':
                        meta.FullBathMain = text;
                        break;
                    case 'Home Style':
                        meta.HomeStyle = text;
                        break;
                    case 'Status':
                        meta.Status = text;
                }
            }
        });
    }

    const statusElement = document.querySelector('.col-sm-6 > h3');
    if (statusElement) {
        meta.Status = statusElement.textContent.trim() || '';
    }

    // Add Virtual Tour images to metadata and remove the section
    const videoPhotosSection = document.querySelector('#videophotos');
    if (videoPhotosSection) {
        const virtualTourImages = Array.from(videoPhotosSection.querySelectorAll('img'));
        const metaImages = virtualTourImages.map(img => `<img src="${img.src}" alt="${img.alt}">`);
        meta.VirtualTourImages = metaImages;

        videoPhotosSection.remove();
    }

    // Create Metadata Block
    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    return meta;
  }

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

    const detailAccordion = document.querySelector('.detailaccordioncontent');
    detailAccordion?.remove();

    const detailAccordionThirdColumn = document.querySelector('.detailthirdcolumncontent');
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
      transformDOM: ({
        document,
        url,
        html,
        params,
      }) => {
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
            '.container > .row > .col-sm-6 > small > a',
            '.modal',
            '.graydivider',
            ':scope > img',
            '#inventoryshowhide',
        ]);
    
        // Use helper methods to create and append various blocks to the main element
        // Add other blocks creation calls here, e.g., createTabs(main, document);
        createCarouselBlock(document);
        createRenderingImagesBlock(document);
        createFloorplanBlock(document);
        createEmbedBlock(document);
        createMetadata(main, document, url);
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
      }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
    };
    