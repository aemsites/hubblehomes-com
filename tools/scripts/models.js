// Import necessary modules
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

fs.unlink('models.csv', () => {});
let useDelay = true;

const writer = getWriter();
function getWriter() {
  return createCsvWriter({
    fieldDelimiter: ';',
    path: 'models.csv',
    header: [
      { id: 'path', title: 'path' },
      { id: 'community', title: 'community' },
      { id: 'model name', title: 'model name' },
      { id: 'price', title: 'price' },
      { id: 'square feet', title: 'square feet' },
      { id: 'beds', title: 'beds' },
      { id: 'baths', title: 'baths' },
      { id: 'cars', title: 'cars' },
      { id: 'home style', title: 'home style' },
      { id: 'primary bed', title: 'primary bed' },
      { id: 'full bath main', title: 'full bath main' },
      { id: 'full bed on first', title: 'full bed on first' },
      { id: 'den/study', title: 'den/study' },
    ],
  });
}

function delay(ms) {
  if (!useDelay) return Promise.resolve();

  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function appendToCsv(newRecords) {
  try {
    await writer.writeRecords(newRecords);
  } catch (err) {
    console.error('Error appending data to CSV file:', err);
  }
}

// Function to fetch and parse the HTML
async function fetchAndParseHTML(community, url) {
  // delay between 5 and 10 seconds
  await delay(Math.floor(Math.random() * (10 - 5 + 1)) + 5);

  try {
    const response = await fetch(`https://www.hubblehomes.com${url}`);

    if (!response.ok) {
      console.error(`Failed to fetch page ${url}:`, response.statusText);
      return;
    }

    const body = await response.text();
    const $ = cheerio.load(body);
    // get the model name
    const model = $('.col-sm-6 h2').first().text().replace('The', '')
      .trim();

    function findValue(term) {
      const dtElement = $('dt').filter(function () {
        return $(this).text().trim() === term;
      });
      return dtElement.next('dd').text().trim().replace('  ', ' ');
    }

    // Find values for "Primary Bed" and "Full Bed on First"
    const price = findValue('From');
    const sqFt = findValue('Square Feet');
    const beds = findValue('Beds');
    const baths = findValue('Baths');
    const cars = findValue('Cars');
    const dens = findValue('Den/Study');
    const primaryBed = findValue('Primary Bed');
    const fullBedOnFirst = findValue('Full Bed on First');
    const fullBathOnMain = findValue('Full Bath Main');
    const homeStyle = findValue('Home Style');

    return {
      path: url,
      community,
      'model name': model,
      price,
      'square feet': sqFt,
      beds,
      baths,
      cars,
      'home style': homeStyle,
      'primary bed': primaryBed,
      'full bath main': fullBathOnMain,
      'full bed on first': fullBedOnFirst,
      'den/study': dens,
    };
  } catch (error) {
    console.error('Error fetching or parsing the HTML:', error);
  }
}

async function gatherUrls(url) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch page ${url}:`, response.statusText);
    return;
  }

  const body = await response.text();

  // Load the HTML into cheerio
  const $ = cheerio.load(body);
  const community = $('h1').text();
  const modelsElements = $('#models');
  const lastModelsElement = modelsElements.last();

  if (lastModelsElement.length === 0) {
    console.error('No models found');
    return;
  }

  const anchorTags = lastModelsElement.find('a');
  const moreLinks = anchorTags.filter(function () {
    return $(this).text().trim() === 'More';
  });

  const links = [];

  moreLinks.each((index, element) => {
    links.push($(element).attr('href'));
  });

  function sortAnchorsByHref(anchor1, anchor2) {
    if (anchor1 < anchor2) return -1;
    if (anchor1 > anchor2) return 1;
    return 0;
  }

  const sortedAnchors = links.sort(sortAnchorsByHref);

  const results = await Promise.all(sortedAnchors.map((item) => fetchAndParseHTML(community, item)));
  results.forEach((item) => {
    console.log(item.path);
  });

  await appendToCsv(results);
}

/**
 * Load up the main landing page for Boise Metro that has all the communities.
 *
 * @param url
 * @returns {Promise<void>}
 */
async function walkCommunities(url) {
  const response = await fetch(url);
  const body = await response.text();
  const $ = cheerio.load(body);
  const listItems = $('[data-mh="listitem"]');
  const anchorTags = listItems.find('a');
  const moreLinks = anchorTags.filter(function () {
    return $(this).text().trim() === 'More';
  });

  const links = [];
  moreLinks.each((index, element) => {
    console.log($(element).attr('href'));
    links.push($(element).attr('href'));
  });

  for (let i = 0; i < links.length; i++) {
    await gatherUrls(`https://www.hubblehomes.com${links[i]}`);
    await delay(5000);
  }
}

if (process.argv[2] === 'no-delay') {
  useDelay = false;
}

walkCommunities('https://www.hubblehomes.com/new-homes/idaho/boise-metro');

// gatherUrls(`https://www.hubblehomes.com${process.argv[2]}`);
