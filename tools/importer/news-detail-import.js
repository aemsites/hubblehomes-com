/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** Create Embed block */
const createEmbedBlock = (document) => {
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer) {
    const iframe = videoContainer.querySelector('iframe');
    if (iframe) {
      const videoUrl = iframe.src;
      let source = '';

      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        source = 'YouTube';
      } else if (videoUrl.includes('canva.com')) {
        source = 'Canva';
      } else if (videoUrl.includes('aws')) {
        source = 'AWS';
      } else {
        source = 'Unknown';
      }

      const cells = [[`Embed (${source})`], ['URL', videoUrl]];

      const table = WebImporter.DOMUtils.createTable(cells, document);
      videoContainer.replaceWith(table);
    }
  }
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
    panelGroups.forEach((panelGroup) => panelGroup.replaceWith(table)); // Replace the original panel groups with the new table
  }
};

const getThumbnailImage = (url) => {
  const newsurl = new URL(url);
  const pathname = newsurl.pathname;
  let thumbnailUrl = null;

  // Synchronous XMLHttpRequest to fetch the mapping file
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://main--hubblehomes-com--aemsites.hlx.live/data/news-thumbails.json', false);
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
  const postDateElement = document.querySelector('.text-center small strong');
  if (postDateElement && postDateElement.textContent.includes('Posted:')) {
    meta.PublishedDate = postDateElement.nextSibling.textContent.split('|')[0].trim();
    postDateElement.remove();
  }

  meta['Page Name'] = getPageName(document);

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
  const tagsElements = Array.from(document.querySelectorAll('small strong')).filter((el) => el.textContent === 'Tags:');
  if (tagsElements.length) {
    tagsElements[0].parentElement.remove();
  }

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


    createAboutColumnBlock(document);
    createEmbedBlock(document);
    removeUnwantedSections(document);›
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
