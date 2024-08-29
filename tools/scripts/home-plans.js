// Import necessary modules
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// load the models.csv file
function loadModels() {
  // if the file doesn't exist, throw an error
  if (!fs.existsSync('models.csv')) {
    throw new Error('models.csv file does not exist!');
  }

  const models = fs.readFileSync('models.csv', 'utf8').split('\n');
  return models.map((model) => model.split(';'));
}

const allModels = loadModels().reduce((acc, model, currentIndex) => {
  if (currentIndex === 0) return acc;

  if (model.length > 1) {
    const name = model[2].toLowerCase().replace(' ', '-');
    if (!acc.includes(name)) {
      acc.push(name);
    }
  }
  return acc;
}, []);

const FILE_NAME = `home-plans-${Date.now()}.csv`;

fs.unlink(FILE_NAME, () => {});
const useDelay = true;

const modelToImage = [
  { name: 'monarch', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/monarch.jpg' },
  { name: 'ridenbaugh', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/ridenbaugh.jpeg' },
  { name: 'alturas', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/alturas.jpeg' },
  { name: 'ashton', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/ashton.jpeg' },
  { name: 'tamarack', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/tamarack.jpeg' },
  { name: 'bradshaw', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/bradshaw.jpg' },
  { name: 'charlotte', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/charlotte.jpg' },
  { name: 'birch', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/birch.jpeg' },
  { name: 'monarch-bonus', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/monarch-bonus.jpg' },
  { name: 'tamarack-loft', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/tamarack-loft.jpeg' },
  { name: 'payette', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/payette.jpeg' },
  { name: 'brookfield', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/brookfield.jpeg' },
  { name: 'amethyst', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/amethyst.jpg' },
  { name: 'crestwood', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/crestwood.jpeg' },
  { name: 'belmont', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/belmont.jpg' },
  { name: 'phoenix', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/phoenix.jpg' },
  { name: 'alder', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/alder.jpg' },
  { name: 'brookfield-bonus', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/brookfield-bonus.jpeg' },
  { name: 'sierra', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/sierra.jpg' },
  { name: 'hemlock', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/hemlock.jpg' },
  { name: 'glendale', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/glendale.jpg' },
  { name: 'emerald', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/emerald.jpg' },
  { name: 'maple-loft', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/maple-loft.jpeg' },
  { name: 'oak', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/oak.jpg' },
  { name: 'mesa', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/mesa.jpg' },
  { name: 'opal-bonus', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/opal-bonus.jpg' },
  { name: 'ponderosa', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/ponderosa.jpg' },
  { name: 'garnet', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/garnet.jpeg' },
  { name: 'trinity', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/trinity.jpg' },
  { name: 'sedona', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/sedona.jpg' },
  { name: 'topaz', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/topaz.jpg' },
  { name: 'spruce', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/spruce.jpg' },
  { name: 'yosemite', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/yosemite.jpg' },
  { name: 'agate', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/agate.jpg' },
  { name: 'orchid', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/orchid.jpg' },
  { name: 'lotus', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/lotus.jpg' },
  { name: 'iris', url: 'https://main--hubblehomes-com--aemsites.hlx.live/images/models/card/iris.jpg' },
];

// verify that we have all the images for the models
allModels.forEach((modelName) => {
  const found = modelToImage.find((item) => item.name === modelName);
  if (!found) {
    console.error(`Missing a mapping image for ${modelName}!`);
  }
});

if (modelToImage.length !== allModels.length) {
  console.error('The models to model image mapping is not complete! There are missing models!');
}

const homePlans = { };
function getWriter() {
  return createCsvWriter({
    fieldDelimiter: ';',
    path: FILE_NAME,
    header: [
      { id: 'path', title: 'path' },
      { id: 'model name', title: 'model name' },
      { id: 'price', title: 'price' },
      { id: 'square feet', title: 'square feet' },
      { id: 'beds', title: 'beds' },
      { id: 'baths', title: 'baths' },
      { id: 'cars', title: 'cars' },
      { id: 'den/study', title: 'den/study' },
      { id: 'primary bed', title: 'primary bed' },
      { id: 'full bath main', title: 'full bath main' },
      { id: 'full bed on first', title: 'full bed on first' },
      { id: 'home style', title: 'home style' },
      { id: 'image', title: 'image' },
      { id: 'planNumber', title: 'planNumber' },
      { id: 'type', title: 'type' },
    ],
  });
}

const writer = getWriter();

function delay(ms) {
  if (!useDelay) return Promise.resolve();
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function appendToCsv(newRecords) {
  try {
    await writer.writeRecords(newRecords);
  } catch (err) {
    console.error('Error appending data to CSV file:', err);
  }
}

async function getHomePlanDetails(plan) {
  console.log(`Fetching details for ${plan.path}`);

  const response = await fetch(`https://www.hubblehomes.com${plan.path}`);

  if (!response.ok) {
    console.error(`Failed to fetch page ${plan.path}:`, response.statusText);
    return {};
  }

  const body = await response.text();
  const $ = cheerio.load(body);

  function findValue(term) {
    const dtElement = $('dt').filter(function () {
      return $(this).text().trim() === term;
    });
    return dtElement.next('dd').text().trim().replace('  ', ' ');
  }

  const formId = $('form[id^="CompareForm"]').attr('id');

  let planNumber;
  try {
    planNumber = formId.split('_')[2];
    console.log(`plan number ${planNumber}`);
  } catch (e) {
    console.log(`failed for ${plan.path}`);
    process.exit(1);
  }

  // Find values for "Primary Bed" and "Full Bed on First"
  const sqFt = findValue('Square Feet');
  const beds = findValue('Beds');
  const baths = findValue('Baths');
  const cars = findValue('Cars');
  const dens = findValue('Den/Study');
  const primaryBed = findValue('Primary Bed');
  const fullBedOnFirst = findValue('Full Bed on First');
  const fullBathOnMain = findValue('Full Bath Main');
  const homeStyle = findValue('Home Style');
  const type = homeStyle === 'Townhome' ? 'Townhome' : 'Single Family';

  const m2i = modelToImage.find((item) => item.name === plan.name.toLowerCase().replace(' ', '-'));
  const image = m2i ? m2i.url : '';

  return {
    path: plan.path,
    'model name': plan.name,
    price: plan.price,
    'square feet': sqFt,
    beds,
    baths,
    cars,
    'den/study': dens,
    'primary bed': primaryBed,
    'full bed on first': fullBedOnFirst,
    'full bath main': fullBathOnMain,
    'home style': homeStyle,
    image,
    planNumber,
    type,
  };
}

/**
 * Load up the main landing page for Boise Metro that has all the communities.
 *
 * @param url
 * @returns {Promise<void>}
 */
async function walkHomePlans(url) {
  const response = await fetch(url);
  const body = await response.text();
  const $ = cheerio.load(body);
  const listItems = $('[data-mh="listitem"]');

  // for each listItem find the model name
  listItems.each((index, element) => {
    const modelName = $(element).find('h3').text().trim();
    const textContent = $(element).text().trim();
    const priceMatch = textContent.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : null;

    // eslint-disable-next-line func-names
    const link = $(element).find('a').filter(function () {
      return $(this).text().trim().startsWith('View');
    });

    const path = $(link).attr('href');
    homePlans[modelName] = { name: modelName, price, path };
  });

  function sortPlansByName(planA, planB) {
    if (planA.name < planB.name) return -1;
    if (planA.name > planB.name) return 1;
    return 0;
  }

  const sortedHomePlans = Object.values(homePlans).sort(sortPlansByName);
  const results = await Promise.all(sortedHomePlans.map(async (plan) => {
    await delay(Math.floor((Math.random() * (20)) + 5) * 1000);
    return getHomePlanDetails(plan);
  }));

  await appendToCsv(results);
}
//
// if (process.argv[2] === 'no-delay') {
//   useDelay = false;
// }

walkHomePlans('https://www.hubblehomes.com/home-plans');
