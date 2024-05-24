/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
  /** Create Carousel block */
  const createCarouselBlock = (document) => {
    const carousel = document.querySelector('#myCarousel');
    if (carousel) {
      const cells = [['Carousel (auto-2000)']]; // Title row
  
      const communityTitleTop = document.querySelector('.communitytitle-top');
      const communityTitleBottom = document.querySelector('.communitytitle-bottom');
      const defaultText = 
      `Default Slide Text
      (optional)`;
      
      let title1Html = communityTitleTop ? `<h2>${communityTitleTop.querySelector('#communitytitle-1')?.innerHTML 
      || ''}</h2>${communityTitleTop.querySelector('#communitytitle-2')?.innerHTML || ''}` : '';
      let title2Html = communityTitleBottom ? `<h2>${communityTitleBottom.querySelector('#communitytitle-3')?.innerHTML 
      || ''}</h2>${communityTitleBottom.querySelector('#communitytitle-4')?.innerHTML || ''}` : '';
      
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

  const createSpecialistsBlock = (document) => {
    const specialistsSection1 = document.querySelectorAll('.detailthirdcolumncontent .agents-right');
    const specialistsSection2 = document.querySelectorAll('.container.topbuffer .row .text-center');
  
    const specialistsInfo = [];
  
    specialistsSection1?.forEach((specialist) => {
      const name = specialist.childNodes[0].textContent.trim();
      const email = specialist.querySelector('a[aria-label^="Send Email"]')?.textContent.trim() || '';
      const phone = specialist.querySelector('a[aria-label^="Call"]')?.textContent.trim() || '';
      specialistsInfo.push({ name, email, phone, photo: '' }); // Temporarily push without photo
    });
  
    specialistsSection2?.forEach((specialist, index) => {
      const photo = specialist.querySelector('img')?.src || '';
      if (specialistsInfo[index]) {
        specialistsInfo[index].photo = photo; // Update the corresponding specialist info with photo
      }
    });
  
    const tables = [];
    specialistsInfo.forEach((specialist) => {
      const cells = [
        ['Specialists'],
        ['Photo', `<img src="${specialist.photo}" alt="${specialist.name}">`],
        ['Name', specialist.name],
        ['Email', specialist.email],
        ['Phone', specialist.phone]
      ];
  
      const table = WebImporter.DOMUtils.createTable(cells, document);
      tables.push(table);
    });
  
    // Create a container to hold all the new tables
    const container = document.createElement('div');
    tables.forEach((table) => {
      container.appendChild(table);
    });
  
    // Append the new tables to the original specialists container
    const specialistsContainer = document.querySelector('.container.topbuffer .row');
    if (specialistsContainer) {
      specialistsContainer.append(container);
    }
  
    // Remove the original specialist elements
    const specialistsToRemove = document.querySelectorAll('.container.topbuffer .row .text-center');
    specialistsToRemove?.forEach((ele) => {
      ele.remove();
    });
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
    meta.Template = 'community';
  
    // Published Date
    const postDateElement = document.querySelector('.text-center small strong');
    if (postDateElement && postDateElement.textContent.includes('Posted:')) {
      meta.PublishedDate = postDateElement.nextSibling.textContent.split('|')[0].trim();
      postDateElement.remove();
    }
  
    const overviewSection = document.querySelector('#overview');
    if (overviewSection) {
      meta.Pricing = overviewSection.querySelector('dd:nth-of-type(1)')?.textContent.trim() || '';
      meta.SquareFeet = overviewSection.querySelector('dd:nth-of-type(2)')?.textContent.trim() || '';
      meta.Beds = overviewSection.querySelector('dd:nth-of-type(3)')?.textContent.trim() || '';
      meta.Baths = overviewSection.querySelector('dd:nth-of-type(4)')?.textContent.trim() || '';
      meta.Cars = overviewSection.querySelector('dd:nth-of-type(5)')?.textContent.trim() || '';
    }
  
    const statusElement = document.querySelector('.col-sm-6 > h3');
    if (statusElement) {
      meta.Status = statusElement.textContent.trim() || '';
    }
    
    const schoolsSection = document.querySelector('#schools');
    if (schoolsSection) {
      meta.SchoolDistrict = schoolsSection.querySelector('p')?.textContent.trim() || '';
      meta.ElementarySchool = schoolsSection.querySelector('dl:nth-of-type(1) dd')?.textContent.trim() || '';
      meta.MiddleSchool = schoolsSection.querySelector('dl:nth-of-type(2) dd')?.textContent.trim() || '';
      meta.HighSchool = schoolsSection.querySelector('dl:nth-of-type(3) dd')?.textContent.trim() || '';
    }    
  
    const communityPhoneElement = document.querySelector('.gtm-communityphone h2');
    if (communityPhoneElement) {
      meta.CommunityPhone = communityPhoneElement.textContent.trim() || '';
    }
  
    const amenitiesSection = document.querySelector('#amenities');
    if (amenitiesSection) {
      meta.Amenities = amenitiesSection.querySelector('dd p')?.textContent.trim() || '';
    }
  
    const hoaSection = document.querySelector('#hoa');
    if (hoaSection) {
      const hoaInfo = hoaSection.querySelector('.blueheader');
      if (hoaInfo) {
        const hoaText = hoaInfo.innerText.split('\n').map(text => text.trim()).filter(text => text);
        hoaText.forEach(text => {
          if (text.includes('Setup Fee:')) {
            meta.SetupFee = text.split(': ')[1];
          } else if (text.includes('Annual Dues:')) {
            meta.AnnualDues = text.split(': ')[1];
          } else if (text.includes('Transfer Fees:')) {
            meta.TransferFees = text.split(': ')[1];
          }
        });
      }
  
      const ampInfo = hoaSection.querySelector('strong:nth-of-type(2)');
      if (ampInfo) {
        const ampName = ampInfo.nextSibling?.nextSibling || '';
        const ampPhone = ampName?.nextSibling?.nextSibling?.nextSibling;
        const ampEmail = ampPhone?.nextSibling.nextSibling?.nextSibling;
        const ampAddress = ampEmail?.nextSibling?.nextSibling?.nextSibling;
        if (ampPhone && ampEmail && ampAddress) {
          meta.AMPName = ampName.textContent.trim() || '';
          meta.AMPPhone = ampPhone.textContent.trim() || '';
          meta.AMPEmail = ampEmail.textContent.trim() || '';
          meta.AMPAddress = ampAddress.textContent.trim() || '';
        }
      }
    }

    // Sales Center Address
    const salesCenterElement = document.querySelector('.detailthirdcolumncontent strong');
    if (salesCenterElement) {
      const salesCenterAddressNodes = [];
      let nextNode = salesCenterElement.nextSibling;

      while (nextNode) {
        if (nextNode.nodeType === Node.TEXT_NODE) {
          salesCenterAddressNodes.push(nextNode.textContent.trim());
        }
        nextNode = nextNode.nextSibling;
      }

      meta.SalesCenterAddress = salesCenterAddressNodes.join(' ').trim();
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
  };  
  
  const removeUnwantedSections = (document) => {
    // Remove filters section
    const filtersSection = document.querySelector('.well small');
    if (filtersSection) {
        filtersSection.parentElement.remove();
    }

    // Remove specific .container elements but not the ones containing home specialists
    const containers = document.querySelectorAll('.container');
    containers.forEach((container) => {
      if (container.querySelector('#models')) {
        container.remove();
      }
    });

    const detailAccordion = document.querySelector('.detailaccordioncontent');
    detailAccordion?.remove();

    const detailAccordionThirdColumn = document.querySelector('.detailthirdcolumncontent');
    detailAccordionThirdColumn?.remove();

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
        '.container > .row > .col-sm-12 > .btn-group',
        '.container > .row > .col-sm-12 > small > a',
        '.container > .row > .topbuffer',
        '.modal',
        '.graydivider',
        ':scope > img',
        '#inventoryshowhide',
      ]);
  
      createCarouselBlock(document);
      createMetadata(main, document, url);
      createSpecialistsBlock(document);
      removeUnwantedSections(document);
  
      return main;
    },
  
    generateDocumentPath: ({
      document,
      url,
      html,
      params,
    }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
  };
  