/* eslint-disable no-undef,max-len,no-param-reassign  */

const createDisclaimerFragment = (document, main) => {
  const cells = [['Fragment (disclaimer)'], ['https://main--hubblehomes-com--aemsites.hlx.live/fragments/disclaimer']];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
};

const cleanupImageSrc = (src) => {
  const imgUrl = new URL(src);
  return `${imgUrl.protocol}//${imgUrl.host}${imgUrl.pathname}`;
};

const createLinksBlock = (document, main) => {
  const linksContainer = document.querySelector('.detaillinks');

  if (linksContainer) {
    const links = Array.from(linksContainer.querySelectorAll('a'))
      .map((link) => link.outerHTML) // Get the outer HTML of each link
      .join('<br>'); // Join them with a line break

    const cells = [['Links'], [links]]; // Create cells for the table
    const table = WebImporter.DOMUtils.createTable(cells, document); // Create the table
    main.append(table); // Append the table to the main container
  }
};

const createDescriptionBlock = (document, main) => {
  const descriptionContainer = document.querySelector('.col-sm-6.col-xs-6');
  descriptionContainer.querySelector('h1')?.remove();
  descriptionContainer.querySelector('h4')?.remove();
  descriptionContainer.querySelectorAll('.row')?.forEach((el) => el.remove());

  const descriptionText = descriptionContainer.innerHTML.trim();

  const cells = [['Description'], [descriptionText]];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
};

const createOverviewBlock = (document, main) => {
  const overviewElement = document.querySelector('#overview');
  if (overviewElement) {
    const overviewCategories = Array.from(overviewElement.querySelectorAll('dt'))
      .map((el) => {
        let key = el.textContent.trim().toLowerCase();
        if (key.includes('from') || key.includes('pricing')) {
          key = 'price';
        }
        return key;
      }).join(', ');

    const cells = [['Overview'], [overviewCategories]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const createActionButtonBlock = (document, main) => {
  const buttonsRows = document.querySelectorAll('.row > .col-sm-12.text-center');
  let tableAppended = false;

  buttonsRows.forEach((buttonsRow) => {
    if (tableAppended) return;

    const isValidChild = (child) => {
      if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) return true;
      return ['BR', 'A'].includes(child.tagName);
    };

    if (Array.from(buttonsRow.childNodes).every(isValidChild)) {
      const linksHtml = Array.from(buttonsRow.children)
        .filter((child) => child.tagName === 'A')
        .map((link) => `<div>${link.outerHTML}</div>`)
        .join('');

      const cells = [['Action Buttons'], [linksHtml]];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.append(table);

      tableAppended = true;
    }
  });
};

const createFloorplanTabsBlock = (document, main) => {
  const floorplanContainer = document.querySelector('.responsive-tabs');
  if (floorplanContainer) {
    const cells = [['Tabs (floorplan)']];

    const levels = floorplanContainer.querySelectorAll('h4');
    levels.forEach((level) => {
      const img = level.nextElementSibling.querySelector('img');
      if (img) {
        cells.push([
          `${level.textContent}`,
          `<img src="${img.src}" alt="${img.alt}">`,
        ]);
      }
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const createEmbedBlock = (document, main) => {
  const matterportIframe = document.querySelector('.embed-responsive-item[src*="matterport.com"]');
  if (matterportIframe) {
    const cells = [['Embed (matterport)'], ['URL', matterportIframe.src]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const getCarouselDefaultText = (carousel) => {
  const communityTitleTop = carousel.querySelector('.communitytitle-top');
  const communityTitleBottom = carousel.querySelector('.communitytitle-bottom');
  communityTitleBottom?.querySelector('a')?.remove();

  const defaultText = 'Default Slide Text (optional)';

  const title1Html = communityTitleTop
    ? `<h2>${communityTitleTop.querySelector('.communitytitle-large')?.innerHTML || ''}</h2>
      ${communityTitleTop.querySelector('.communitytitle-small')?.innerHTML || ''}`
    : '';

  const title2Html = communityTitleBottom
    ? `<h3>${communityTitleBottom.querySelector('.communitytitle-large')?.innerHTML || ''}</h3>
      ${communityTitleBottom.querySelector('.communitytitle-medium')?.innerHTML || ''}`
    : '';

  const combinedTitleHtml = title1Html || title2Html
    ? `${title1Html}${title2Html}`
    : '';

  communityTitleTop?.remove();
  communityTitleBottom?.remove();

  return {
    defaultText,
    combinedTitleHtml,
  };
};

const getGalleryImages = (document) => {
  const imageGalleryElements = document.querySelectorAll('#imagegallery2 img');
  return Array.from(imageGalleryElements).map((img) => `<img src="${cleanupImageSrc(img.src)}" alt="${img.alt}" style="display:block;">`);
};

const getCarouselImages = (carousel) => {
  const items = carousel.querySelectorAll('.item');
  return Array.from(items).map((item) => {
    const picture = item.querySelector('picture img');
    const imgSrc = picture ? picture.src : '';
    return `<img src="${cleanupImageSrc(imgSrc)}" alt="${picture?.alt || ''}">`;
  });
};

const createCarouselBlock = (document, main, imageSources, galleryEnabled = false, includeDefaultText = true) => {
  const carousel = document.querySelector('.homesearchmapwrapper');
  if (carousel) {
    const cells = [['Carousel']];
    let variants = ' (auto 4000';
    if (galleryEnabled) {
      variants += ', gallery)';
    } else {
      variants += ')';
    }
    cells[0][0] += variants;
    if (includeDefaultText) {
      const { defaultText, combinedTitleHtml } = getCarouselDefaultText(carousel);
      cells.push([defaultText, combinedTitleHtml]);
    }

    if (imageSources.includes('carousel')) {
      const carouselImages = getCarouselImages(carousel);
      carouselImages.forEach((imgElement) => {
        cells.push([imgElement, '']);
      });
    } else if (imageSources.includes('gallery')) {
      const galleryImages = getGalleryImages(document);
      galleryImages.forEach((imgElement) => {
        cells.push([imgElement, '']);
      });
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const getPageName = (document) => {
  const breadcrumbElement = document.querySelector('.breadcrumb');
  if (!breadcrumbElement) return '';

  const textNode = Array.from(breadcrumbElement.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE && !/^\s*$/.test(node.nodeValue))
    .map((node) => node.nodeValue.trim().replace(/[^a-zA-Z0-9\s]/g, ''))
    .find((value) => value !== '');

  return textNode || '';
};

const processDataLayer = (jsonString) => {
  const parts = jsonString.split(',');

  const modifiedParts = parts.map((part) => {
    let value = part.match(/:\s*(.*)/)?.[1];
    const firstQuotePosition = value.indexOf("'");
    const lastQuotePosition = value.lastIndexOf("'");

    if (firstQuotePosition !== -1
      && lastQuotePosition !== -1
      && lastQuotePosition > firstQuotePosition) {
      // Extract the substring to be replaced
      let substringToReplace = value.substring(firstQuotePosition + 1, lastQuotePosition);
      // Perform the replacement on the substring
      substringToReplace = substringToReplace.replace(/'/g, "\\'");
      // Reconstruct the part with the replaced substring
      value = value.substring(0, firstQuotePosition + 1) + substringToReplace + value.substring(lastQuotePosition);
      part = part.replace(/:\s*(.*)/, `: ${value}`);
    }
    // Replace only unescaped single quotes with double quotes
    part = part.replace(/(?<!\\)'/g, '"');

    return part;
  });

  return modifiedParts.join(',');
};

const extractWord = (str) => str.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').trim();

const updateCommonMetadata = (document, url, html) => {
  const meta = {};

  // title
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  // description
  const desc = document.querySelector("[property='og:description']");
  if (desc) {
    meta.Description = desc.content;
  }

  // image
  const img = document.querySelector("[property='og:image']");
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  // path
  meta.Path = new URL(url).pathname;

  // page name
  meta['Page Name'] = getPageName(document);

  const scriptMatch = html.match(/<script>(.*?)<\/script>/s);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const dataLayerMatch = scriptContent.match(/dataLayer\s*=\s*(\[\{.*?\}\]);/s);
    if (dataLayerMatch) {
      let jsonString = dataLayerMatch[1];

      jsonString = processDataLayer(jsonString);

      jsonString = jsonString
        .replace(/\\'/g, "'") // Convert escaped single quotes to regular single quotes
        .replace(/\s+/g, ' ') // Replace multiple whitespace characters (tabs, newlines) with a single space
        .replace(/(?<=\s):\s/g, ': ') // Ensure space after colon
        .replace(/\s+(?=,|{|}|:)/g, ''); // Remove extra spaces before certain characters

      const dataLayer = JSON.parse(jsonString)[0];

      const properties = ['city', 'state', 'region', 'spec'];
      properties.forEach((prop) => {
        if (dataLayer[prop]) {
          if (prop === 'state' && dataLayer[prop] === 'ID') {
            dataLayer[prop] = 'Idaho';
          }
          meta[prop.charAt(0).toUpperCase() + prop.slice(1)] = dataLayer[prop];
        }
      });

      const matchProperties = {
        community: 'Community',
        model: 'Model',
      };

      Object.keys(matchProperties).forEach((prop) => {
        if (dataLayer[prop]) {
          const value = extractWord(dataLayer[prop]);
          if (value) {
            // eslint-disable-next-line prefer-destructuring
            meta[matchProperties[prop]] = value;
          }
        }
      });
    }
  }

  return meta;
};

function sanitizeHref(href) {
  // Decode any percent-encoded characters
  let sanitizedPathname = decodeURIComponent(href);

  // to lowercase
  sanitizedPathname = sanitizedPathname.toLowerCase();

  // Normalize path separators
  sanitizedPathname = sanitizedPathname.replace(/\\/g, '/');

  // Remove dot segments to prevent directory traversal attacks
  const segments = sanitizedPathname.split('/').filter((segment) => segment !== '.' && segment !== '..');
  sanitizedPathname = segments.join('/');

  // This regex allows letters, digits, and a few special characters.
  const whitelistPattern = /^[a-zA-Z0-9\-.~/]+$/;
  if (!whitelistPattern.test(sanitizedPathname)) {
    // Replace non-whitelisted characters with a hyphen
    return sanitizedPathname.replace(/[^a-zA-Z0-9\-.~/]/g, '-');
  }

  return sanitizedPathname;
}

const convertRelativeLinks = (main) => {
  const prefix = 'https://main--hubblehomes-com--aemsites.hlx.page/assets';
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && !href.startsWith('http') && /(\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.webp|\.mp4|\.avi|\.mov|\.mkv|\.mp3|\.wav|\.pdf)$/i.test(href)) {
      a.href = prefix + sanitizeHref(href);
    }
  });
  return main;
};

export {
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
  updateCommonMetadata,
  convertRelativeLinks,
};
