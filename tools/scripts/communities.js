const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { createObjectCsvWriter: createCsvWriter } = require('csv-writer');
const fs = require('fs');
const {
  findCommunityCardValue,
} = require('./card-helper.js');

const writer = getWriter();
function getWriter() {
  return createCsvWriter({
    fieldDelimiter: ';',
    path: `communities-${Date.now()}.csv`,
    header: [
      { id: 'path', title: 'path' },
      { id: 'name', title: 'name' },
      { id: 'city', title: 'city' },
      { id: 'region', title: 'region' },
      { id: 'state', title: 'state' },
      { id: 'zip-code-abbr', title: 'zip-code-abbr' },
      { id: 'phone', title: 'phone' },
      { id: 'status', title: 'status' },
      { id: 'latitude', title: 'latitude' },
      { id: 'longitude', title: 'longitude' },
      { id: 'price', title: 'price' },
      { id: 'square feet', title: 'square feet' },
      { id: 'beds', title: 'beds' },
      { id: 'baths', title: 'baths' },
      { id: 'cars', title: 'cars' },
    ],
  });
}

async function appendToCsv(newRecords) {
  try {
    await writer.writeRecords(newRecords);
  } catch (err) {
    console.error('Error appending data to CSV file:', err);
  }
}

async function findDrivingDirections(card) {
  const drivingLink = card.find('.gtm-communitylistdrivingdirections')
    .attr('href');
  const url = await fetch(`https://www.hubblehomes.com${drivingLink}`);

  if (!url.ok) {
    throw new Error(`Failed to fetch page ${drivingLink}`);
  }

  const body = await url.text();
  const $ = cheerio.load(body);
  const href = $('.gtm-getdrivingdirections').attr('href');
  // get the longitude and latitude from the href
  const [lat, lon] = href.split('/').pop().split(',');
  return { lat, lon };
}

async function getCommunities() {
  const state = 'Idaho';
  const region = 'Boise Metro';
  const zipCode = 'ID';

  const response = await fetch('https://www.hubblehomes.com/new-homes/idaho');
  if (!response.ok) {
    throw new Error(`Failed to fetch page https://www.hubblehomes.com/new-homes/idaho ${response.statusText}`);
  }

  const body = await response.text();
  const $ = cheerio.load(body);

  const cityBlocks = $('.communityrowpadding');

  const csv = await Promise.all(cityBlocks.map(async (index, element) => {
    const city = $(element).find('.gtm-city').text().replace(/,/g, '');

    const cards = $(element).find('.item');

    return Promise.all(cards.map(async (i, e) => {
      // find the h3 in the card
      const card = $(e);
      const title = card.find('h3.text-uppercase').text().trim();
      const path = card.find('a').attr('href');
      const phone = card.find('.gtm-communitylistphone').text().trim().replace('(', '')
        .replace(')', '')
        .replace(/-/g, '')
        .replace(' ', '');
      const status = card.find('.itemmarketingstatus').text().trim();
      const price = card.find('.itemtaglineprice').text().trim();

      const beds = findCommunityCardValue($, card, 'BEDS');
      const sqft = findCommunityCardValue($, card, 'SQ FT');
      const baths = findCommunityCardValue($, card, 'BATHS');
      const cars = findCommunityCardValue($, card, 'CARS');

      const {
        lat,
        lon,
      } = await findDrivingDirections(card);

      console.log(`City: ${city} Title: ${title} Phone: ${phone} Status: ${status} Price: ${price} 
      Beds: ${beds} Sqft: ${sqft} Baths: ${baths} Cars: ${cars} Lat: ${lat} Lon: ${lon} Path: ${path} `);

      return {
        path,
        name: title,
        city,
        region,
        state,
        'zip-code-abbr': zipCode,
        phone,
        status,
        latitude: lat,
        longitude: lon,
        price,
        'square feet': sqft,
        beds,
        baths,
        cars,
      };
    }));
  }));

  await appendToCsv(csv.flat());
}

getCommunities();
