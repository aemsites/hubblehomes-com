/* eslint-disable no-unused-vars, no-undef */

import {
  getPageName,
  convertRelativeLinks,
} from './common.js';

/** Create Embed block */
const createEmbedBlock = (document) => {
  // Assuming `newsVideoContainers` is a NodeList of all video containers in the news
  const newsVideoContainers = document.querySelectorAll('.video-container');

  newsVideoContainers.forEach((videoContainer) => {
    // eslint-disable-next-line no-debugger
    debugger;

    const iframe = videoContainer.querySelector('iframe');
    if (iframe) {
      const videoUrl = iframe.getAttribute('src');

      // Create a new <a> element
      const videoLink = document.createElement('a');
      videoLink.setAttribute('href', videoUrl);
      videoLink.textContent = 'Video Source';

      // Wrap URL in inline code for Markdown
      const codeUrl = `${videoUrl}`;

      let source = '';

      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        source = 'YouTube';
      } else if (videoUrl.includes('canva.com')) {
        source = 'Canva';
      } else if (videoUrl.includes('animoto')) {
        source = 'animoto';
      } else {
        source = 'Unknown';
      }

      // const encodedUrl = encodeForHTML(videoUrl);

      // Prepare the cells content ---> Continue with this  tomorrow
      const cells = [[`Embed (${source})`], ['URL', videoLink]];

      const table = WebImporter.DOMUtils.createTable(cells, document);
      videoContainer.replaceWith(table);
    }
  });
};

const createAboutColumnBlock = (document) => {
  const panelGroups = document.querySelectorAll('.panel-group');
  if (panelGroups.length > 0) {
    const cells = [['Columns (About)']]; // Title row

    panelGroups.forEach((panelGroup) => {
      const content = panelGroup.outerHTML;
      cells.push([content]); // Add the panel group content as a new row with HTML
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    // Replace the original panel groups with the new table
    panelGroups.forEach((panelGroup) => panelGroup.replaceWith(table));
  }
};

const getThumbnailImage = (url) => {
  const newsurl = new URL(url);
  const { pathname } = newsurl;
  let thumbnailUrl = null;

  // Synchronous XMLHttpRequest to fetch the mapping file
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://main--hubblehomes-com--aemsites.aem.live/data/news-thumbails.json', false);
  xhr.send(null);

  if (xhr.status === 200) {
    const jsonObject = JSON.parse(xhr.responseText);
    const { data } = jsonObject;
    const mappingObject = data.find((item) => pathname.includes(item['news-detail-path']));
    if (mappingObject) {
      thumbnailUrl = mappingObject['thumbnail-url'];
    }
  }

  return thumbnailUrl;
};

const createMetadata = (main, document, url) => {
  const meta = {};

  // Page Name for Breadcrumb
  meta['Page Name'] = getPageName(document);

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

  // Thumbnail Image
  const imgUrl = getThumbnailImage(url);
  if (imgUrl) {
    const el = document.createElement('img');
    el.src = imgUrl;
    meta.Image = el;
  }

  // Published Date
  const postDateElement = document.querySelector('.sidebarbody .text-center small strong');
  if (postDateElement && postDateElement.textContent.includes('Posted:')) {
    const publishedDate = postDateElement.nextSibling.textContent.split('|')[0].trim();
    if (publishedDate) {
      meta['Published Date'] = publishedDate;
    }
    postDateElement.remove();
  } else {
    const hohDates = {
      '/heart-of-hubble/heart-detail/2020-hubble-hero-house-kickoff-event-13': 'July 29, 2020',
      '/heart-of-hubble/heart-detail/2022-hubble-hero-house-32': 'November 29, 2022',
      '/heart-of-hubble/heart-detail/2024-hubble-hero-home-50': 'February 16, 2024',
      '/heart-of-hubble/heart-detail/companymatched-employee-donations-5': 'January 1, 2020',
      '/heart-of-hubble/heart-detail/employee-matching-donation-to-hope-house-12': 'December 31, 2020',
      '/heart-of-hubble/heart-detail/employee-matching-hubble-homes-and-the-least-join-the-fight-against-cancer-4': 'July 6, 2020',
      '/heart-of-hubble/heart-detail/launch-pad-ministries-23': 'March 19, 2020',
      '/heart-of-hubble/heart-detail/the-2020-hubble-hero-house-1': 'December 31, 2020',
      '/heart-of-hubble/heart-detail/the-2021-hubble-hero-house-15': 'December 15, 2021',
    };

    const { pathname } = new URL(url);
    if (hohDates[pathname]) {
      meta['Published Date'] = hohDates[pathname];
    }
  }

  // Categories
  const categoriesElement = document.querySelector('.sidebarbody .text-center small');
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

  if (url.includes('heart-detail')) {
    meta.Categories = 'Heart of Hubble';
  }

  // Create Metadata Block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  return block;
};

const removeUnwantedSections = (document) => {
  const tagsElements = Array.from(document.querySelectorAll('small strong')).filter((el) => ['Tags:', 'Categories:', 'Posted:'].includes(el.textContent));

  tagsElements.forEach((el) => {
    el.parentElement.remove();
  });

  const leaveReplyHeaders = Array.from(document.querySelectorAll('h3')).filter((el) => el.textContent.toLowerCase() === 'leave a reply');
  if (leaveReplyHeaders.length) {
    leaveReplyHeaders[0].remove();
  }

  // Remove "By Hubble Homes, LLC" text directly
  const byTextNodes = Array.from(document.querySelectorAll('div.col-sm-9.sidebarbody'))
    .flatMap((el) => Array.from(el.childNodes))
    .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent
      .trim() === 'By Hubble Homes, LLC');
  if (byTextNodes.length) {
    byTextNodes[0].remove();
  }

  // Remove any <img> directly inside the <body> tag
  const bodyImages = Array.from(document.body.querySelectorAll(':scope > img'));
  bodyImages.forEach((img) => img.remove());

  // remove recapcha badge
  const recaptchaElements = document.querySelector('.grecaptcha-badge');
  recaptchaElements?.remove();
};

export default {
  transformDOM: ({
    document,
    url,
    html,
    params,
  }) => {
    const main = document.body;

    const metadataBlock = createMetadata(main, document, url);

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
      '.homesearchmapwrapper',
    ]);

    removeUnwantedSections(document);
    createAboutColumnBlock(document);
    createEmbedBlock(document);
    convertRelativeLinks(main);
    main.append(metadataBlock);

    return main;
  },
  generateDocumentPath: ({
    document, url, html, params,
  }) => {
    const pathsToSkip = [
      '/news/news-detail/hubble-hero-house-coming-soon-to-the-nampa-market-32',
      '/news/news-detail/test-blog-133/news/news-detail/interior-design-trends-2021-paint-colors-51',
      '/news/news-detail/interior-design-trends-2021-paint-colors-50',
      '/news/news-detail/hubble-grant-childrens-home-society-of-idaho-55',
    ];

    const importPath = new URL(url).pathname
      .replace(/\.html$/, '')
      .replace(/\/$/, '');

    // Normalize paths by replacing multiple hyphens with a single hyphen
    const normalizePath = (path) => path.replace(/-+/g, '-');

    // Skip processing if the normalized path matches one of the paths to skip
    if (pathsToSkip.some((path) => normalizePath(path) === normalizePath(importPath))) {
      return WebImporter.FileUtils.sanitizePath('');
    }

    // Handle "heart of hubble" pages
    if (url.includes('heart-detail')) {
      const lastPart = importPath.substring(importPath.lastIndexOf('/') + 1);
      return WebImporter.FileUtils.sanitizePath(`news/news-detail/${lastPart}`);
    }

    // Default sanitized path
    return WebImporter.FileUtils.sanitizePath(importPath);
  },
};
