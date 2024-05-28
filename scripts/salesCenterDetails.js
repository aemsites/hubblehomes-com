/**
 * Fetch the sales center data from the given URL.
 * @param {string} url - The URL to load the models JSON from.
 * @returns {Promise<Object|null>} The promise that resolves to the models JSON
 * or null if an error occurs.
 */
async function loadSalesCenterData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading sales center data:', error);
    return null;
  }
}

/**
 * Extracts the slug from a given URL.
 * @param {string} url - The URL to extract the slug from.
 * @returns {string} The extracted slug.
 */
function getUrlSlug(url) {
  const parts = url.split('/');
  return parts.pop() || parts.pop(); // Handles trailing slash
}

/**
 * Fetches the sales center details for a given model URL.
 * @param {string} url - The model URL.
 * @returns {Promise<Object|null>} The sales center details or null if an error occurs.
 */
async function getSalesCenterDetailsForModel(url) {
  const data = await loadSalesCenterData('http://localhost:3000/data/sales-office-and-specialists.json');

  if (!data) {
    return null;
  }

  const { 'sales-office': { data: salesOffice }, specialists: { data: salesSpecialists } } = data;
  const urlSlug = getUrlSlug(url);
  const salesOfficeDetails = salesOffice.find((office) => office['url-slug'] === urlSlug);

  if (!salesOfficeDetails || !salesOfficeDetails.area) {
    return null;
  }

  const area = salesOfficeDetails.area.toLowerCase();

  const specialists = salesSpecialists.filter((specialist) => {
    const officeLocations = Object.keys(specialist).filter((key) => key.startsWith('office location'));
    return officeLocations.some(
      (officeLocation) => specialist[officeLocation].toLowerCase() === area,
    );
  });

  return {
    sales_center: {
      phone: salesOfficeDetails['phone-number'],
      name: salesOfficeDetails['sc-name'],
      subdivision: salesOfficeDetails.subdivision,
      address: salesOfficeDetails.address,
      city: salesOfficeDetails['sc-city'],
      state: salesOfficeDetails['sc-state'],
      zip: salesOfficeDetails['sc-zipcode'],
      model: salesOfficeDetails.model,
      latitude: salesOfficeDetails['sc-latitude'],
      longitude: salesOfficeDetails['sc-longitude'],
      specialists: specialists.map((specialist) => ({
        name: specialist.name,
        email: specialist.email,
        phone: specialist.phone,
        headshotImage: specialist.headshot,
      })),
    },
  };
}

/**
 * Fetches and logs the sales center details for a list of URLs.
 * @param {string[]} urls - The list of URLs.
 */
async function fetchAndLogSalesCenterDetails(urls) {
  try {
    const results = await Promise.all(urls.map((url) => getSalesCenterDetailsForModel(url)));
    results.forEach((result, index) => {
      console.log(`Result for URL ${urls[index]}:`, result);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// URLs to process for testing
const urls = [
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/caldwell/brittany-heights-at-windsor-creek',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/caldwell/mason-creek',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/caldwell/windsor-creek-east',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/kuna/sera-sol',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/meridian/canyons-at-prescott-ridge',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/meridian/ridgelines-at-prescott-ridge',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/meridian/woodcrest-townhomes',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/middleton/waterford',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/nampa/adams-ridge',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/nampa/franklin-village-north',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/nampa/southern-ridge',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/nampa/sunnyvale',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/star/greendale-grove',
  'https://www.hubblehomes.com/new-homes/idaho/boise-metro/star/sellwood',
];

// Fetch and log sales center details for all URLs
fetchAndLogSalesCenterDetails(urls);
