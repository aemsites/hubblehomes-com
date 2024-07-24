/* eslint-disable no-unused-vars, no-undef, max-len */

let result = '';

function getOverviewData(document, data) {
  const overviewDl = document.querySelector('#overview > dl');
  const dtElements = overviewDl.querySelectorAll('dt');

  for (let i = 0; i < dtElements.length; i += 1) {
    const dt = dtElements[i];
    const dd = dt.nextElementSibling;

    if (dt && dd) {
      const key = dt.textContent.trim().toLowerCase();
      let value = dd.textContent.trim();
      value = value.replace(/,/g, '');
      data[key] = value;
    }
  }

  return data;
}

function getAddressBlockData(document, data) {
  const addressBlock = document.querySelector('.col-sm-6.col-xs-6 .col-sm-6');
  if (addressBlock) {
    const mlsElement = addressBlock.querySelector('h5');
    if (mlsElement) {
      data.mls = mlsElement.textContent.split('#').pop().trim();
    }
    const googleMapsAnchor = addressBlock.querySelector('a');
    const address = googleMapsAnchor.textContent.trim();
    if (address) {
      data.address = address;
    }
    // get last part after the /, and then spilt by , and get the first and second part
    if (googleMapsAnchor) {
      const [latitude, longitude] = googleMapsAnchor.href.split('/').pop().split(',');
      data.latitude = latitude;
      data.longitude = longitude;
    }
  }
  return data;
}

function getBreadcrumbData(document, data) {
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const links = Array.from(breadcrumb.querySelectorAll('a'));
    // Check if there are at least 1 link and a text node after the last link
    if (links.length >= 1) {
      // Get the last link's text content
      data.community = links.pop().textContent.trim();

      // Get the last text node after the last link
      const textNodes = Array.from(breadcrumb.childNodes);
      for (let i = textNodes.length - 1; i >= 0; i -= 1) {
        if (textNodes[i].nodeType === Node.TEXT_NODE && textNodes[i].textContent.trim() !== '') {
          let textContent = textNodes[i].textContent.trim();
          // Remove all special characters before the text
          textContent = textContent.replace(/^[^a-zA-Z]+/, '');
          data['model name'] = textContent;
          break;
        }
      }
    }
  }
  return data;
}

export default {
  transformDOM: ({ document, url, html }) => {
    const main = document.body;
    let data = {};
    data.path = new URL(url).pathname;
    data = getBreadcrumbData(document, data);
    data = getOverviewData(document, data);
    data = getAddressBlockData(document, data);

    // go through the list of excel keys and get the data and format it in a csv format, one per line
    const excelKeys = ['path', 'community', 'model name', 'price', 'square feet', 'beds', 'baths', 'cars', 'primary bed', 'home style', 'full bed on first', 'full bath main', 'status', 'mls', 'address', 'latitude', 'longitude', 'youmayalsolike' ];
    result += excelKeys.map((key) => data[key] || '').join(',') + '\n';
    console.log(result);

    return main;
  },

  generateDocumentPath: ({
    document,
    url,
    html,
    params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
