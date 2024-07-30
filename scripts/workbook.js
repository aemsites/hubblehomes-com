const { hh } = window;

const Sheets = {
  COMMUNITIES: 'communities',
  SALES_OFFICES: 'sales-offices',
  STAFF: 'staff',
  INVENTORY: 'inventory',
  RATES: 'rates',
  MODELS: 'models',
  HOME_PLANS: 'home-plans',
  CITIES: 'cities',
};

/**
 * Fetch the workbook by default or by the list of sheet names
 * @param sheetNames the names of the sheets to fetch
 * @returns {Promise<any>}
 */
async function fetchWorkbook(sheetNames) {
  const sheets = Array.isArray(sheetNames) ? sheetNames : [sheetNames];
  const url = sheets.includes('all') ? '/data/hubblehomes.json' : `/data/hubblehomes.json?${sheets.map((sheetName) => `sheet=${sheetName}`).join('&')}`;
  const request = await fetch(url);
  if (request.ok) {
    return request.json();
  }
  throw new Error('Failed to fetch workbook');
}

/**
 * Fetches the sheet data from the workbook.
 * @param sheetNames
 * @returns {Promise<any | undefined>}
 */
async function getSheet(sheetNames) {
  const sheets = Array.isArray(sheetNames) ? sheetNames : [sheetNames];
  const cachedSheets = sheets.filter((sheetName) => hh[sheetName]);
  if (cachedSheets.length === sheets.length) {
    return Object.fromEntries(cachedSheets.map((sheetName) => [sheetName, hh[sheetName]]));
  }

  const data = await fetchWorkbook(sheets.length === Object.keys(Sheets).length ? 'all' : sheets);

  // we could look at the sheets.length to determine if we have a single sheet or multi sheet
  // workbook but the result also tells us that it's a sheet, or multi-sheet response
  if (data[':type'] === 'sheet') {
    hh[sheets[0]] = data;
    return { [sheets[0]]: data };
  }

  // we have a multi sheet workbook
  Object.entries(data).forEach(([key, value]) => {
    if (!key.startsWith(':')) hh[key] = value;
  });

  return Object.fromEntries(sheets.map((sheetName) => [sheetName, hh[sheetName]]));
}

/**
 * Fetches the sheet data by loading the sheets from the workbook.
 * @param sheetNames the name(s) of the sheet to fetch
 * @param property the property of the sheet to return
 * @returns {Promise<*|undefined>}
 */
async function getSheetData(property, ...sheetNames) {
  const sheets = await getSheet(sheetNames);
  return Object.fromEntries(Object.entries(sheets)
    .map(([key, value]) => [key, property ? value[property] : value]));
}

/**
 * Fetches the communities sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getCommunitiesSheet(property) {
  const result = await getSheetData(property, Sheets.COMMUNITIES);
  return result[Sheets.COMMUNITIES];
}

/**
 * Fetches the staff sheet data, includes the total, offset, limit, and data fields.
 * @param role the role of the staff to filter by
 * @returns {Promise<*|undefined>}
 */
async function getStaffSheet(role = 'sales') {
  const result = await getSheetData('data', Sheets.STAFF);
  return result[Sheets.STAFF].filter((staff) => staff.role.toLowerCase() === role.toLowerCase());
}

/**
 * Fetches the sales offices sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getSalesOfficesSheet(property = undefined) {
  const result = await getSheetData(property, Sheets.SALES_OFFICES);
  return result[Sheets.SALES_OFFICES];
}

/**
 * Fetches the inventory sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getInventorySheet(property) {
  const result = await getSheetData(property, Sheets.INVENTORY);
  return result[Sheets.INVENTORY];
}

/**
 * Fetches the city sheet data, includes the total, offset, limit, and data fields.
 * @param property the property of the sheet to return
 * @returns {Promise<*>} the city sheet data.
 */
async function getCitySheet(property) {
  const result = await getSheetData(property, Sheets.CITIES);
  return result[Sheets.CITIES];
}

/**
 * Fetches the rates sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getRatesSheet(property) {
  const result = await getSheetData(property, Sheets.RATES);
  return result[Sheets.RATES];
}

/**
 * Fetches the models sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getModelsSheet(property) {
  const result = await getSheetData(property, Sheets.MODELS);
  return result[Sheets.MODELS];
}

/**
 * Fetches the home plans sheet data, includes the total, offset, limit, and data fields.
 * @returns {Promise<*|undefined>}
 */
async function getHomePlansSheet(property) {
  const result = await getSheetData(property, Sheets.HOME_PLANS);
  return result[Sheets.HOME_PLANS];
}

async function loadWorkbook() {
  return getSheetData(
    'data',
    Sheets.STAFF,
    Sheets.SALES_OFFICES,
    Sheets.COMMUNITIES,
    Sheets.INVENTORY,
    Sheets.RATES,
    Sheets.MODELS,
    Sheets.HOME_PLANS,
    Sheets.CITIES,
  );
}

async function getStaffAndSalesOffices() {
  return getSheetData('data', Sheets.STAFF, Sheets.SALES_OFFICES);
}

export {
  loadWorkbook,
  getCommunitiesSheet,
  getStaffSheet,
  getSalesOfficesSheet,
  getInventorySheet,
  getRatesSheet,
  getModelsSheet,
  getStaffAndSalesOffices,
  getHomePlansSheet,
  getCitySheet,
};
