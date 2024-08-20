const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const {XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');
const Sheets = {
  COMMUNITIES: 'communities',
  SALES_OFFICES: 'sales-offices',
  INVENTORY: 'inventory',
  MODELS: 'models',
  HOME_PLANS: 'home-plans',
  CORPORATION: 'corporation',
  SUBDIVISION: 'subdivision',
};

let salesOfficehelper = [];

function encodeString(text) {
  return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
}

function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters
  const cleaned = (`${phoneNumber}`).replace(/\D/g, '');

  // Check if the input is of correct length
  if (cleaned.length === 10) {
    // Group the numbers appropriately
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return [match[1], match[2], match[3]];
    }
  } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    // Check for and handle country code 1
    const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return [match[1], match[2], match[3]];;
    }
  }

  // Return the cleaned input if it doesn't match any format
  return phoneNumber;
}


async function fetchWorkbook(sheetNames) {
  const sheets = Array.isArray(sheetNames) ? sheetNames : [sheetNames];
  const url = `https://main--hubblehomes-com--aemsites.hlx.live/data/hubblehomes.json?${sheets.map((sheetName) => `sheet=${sheetName}`).join('&')}`;
  const request = await fetch(url);
  if (request.ok) {
    return request.json();
  }
  throw new Error('Failed to fetch workbook');
}

async function addInventoryData(model, community) {
  const inventoryData = await fetchWorkbook(Sheets.INVENTORY);
  let inventoryXml = '';
  for (const inventoryhome of inventoryData.data) {
    if (inventoryhome.community.toLowerCase() === community.toLowerCase() && inventoryhome['model name'].toLowerCase() === model.toLowerCase()) {
      const bedrooms = inventoryhome.beds.includes('-') ? inventoryhome.beds.split('-')[0] : inventoryhome.beds;
      const baths = inventoryhome.baths.includes('-') ? parseFloat(inventoryhome.baths.split('-')[0].trim()) : parseFloat(inventoryhome.baths.trim());
      const fullBaths = Math.floor(baths);
      const halfBaths = baths - fullBaths;
      const garage = inventoryhome.cars.includes('-') ? inventoryhome.cars.split('-')[0].trim() : inventoryhome.cars;      
      inventoryXml += ` <Spec Type="SingleFamily">
        <SpecNumber>${inventoryhome.mls}</SpecNumber>
        <SpecAddress>
        <SpecLot>${inventoryhome.address}</SpecLot>
        <SpecStreet1>${inventoryhome.address}</SpecStreet1>
        <SpecCity>${salesOfficehelper['city']}</SpecCity>
        <SpecState>${salesOfficehelper['zip-code-abbr']}</SpecState>
        <SpecZIP>${salesOfficehelper['zipcode']}</SpecZIP>
        <SpecCountry>USA</SpecCountry>
        <SpecGeocode>
        <SpecLatitude>${inventoryhome.latitude}</SpecLatitude>
        <SpecLongitude>${inventoryhome.longitude}</SpecLongitude>
        </SpecGeocode>
        </SpecAddress>
        <SpecStatus>${inventoryhome.status}</SpecStatus>
        <SpecPrice>${inventoryhome.price}</SpecPrice>
        <SpecSqft>${inventoryhome['square feet']}</SpecSqft>
        <SpecBaths>${fullBaths}</SpecBaths>
        <SpecHalfBaths>${halfBaths}</SpecHalfBaths>
        <SpecBedrooms MasterBedLocation="${inventoryhome['primary bed']}">${bedrooms}</SpecBedrooms>
        <SpecGarage>${garage}</SpecGarage>`;
      const pageURL = "https://main--hubblehomes-com--aemsites.hlx.live" + inventoryhome.path + ".plain.html";
      const response = await fetch(pageURL);
      const pageText = await response.text();
      const dom = new JSDOM(pageText);
      const body = dom.window.document.getElementsByTagName("body")[0];
      const allImageTags = body.querySelectorAll(".carousel > div > div > picture > img ");
      let imagexml = '';
      let elevations = '';
      allImageTags.forEach((img, index) => {
        const imgsrc = (img.src.substring(1)).split('?');
        imagexml += `<SpecInteriorImage SequencePosition="${index + 1}" Title="" 
          Caption="${model} New Home Plan by Hubble Homes Boise, Idaho" ReferenceType="URL">
          ${(`https://main--hubblehomes-com--aemsites.hlx.live${inventoryhome.path}${imgsrc[0]}`)}</SpecInteriorImage>`;
        if (index === 0) {
          elevations = `<SpecElevationImage SequencePosition="1" Title="${model}" Caption="" ReferenceType="URL">${(`https://main--hubblehomes-com--aemsites.hlx.live${inventoryhome.path}${imgsrc[0]}`)}</SpecElevationImage>`;
        }
      });
      imagexml += elevations;
      let description = '<SpecDescription><![CDATA[';
      const ptags = body.querySelectorAll(".description > div > div > p ");
      ptags.forEach((p) => description += (p.innerHTML));
      description += ']]></SpecDescription>';
      let floorPlanImages = '';
      const FloorPlanDiv = body.querySelectorAll(".floorplan > div");
      FloorPlanDiv.forEach((div, index) => {
        const label = div.querySelector(' div').innerHTML;
        const img = div.querySelector(' div > picture > img');
        const imgsrc = (img.src.substring(1)).split('?');
        floorPlanImages += `<SpecFloorPlanImage SequencePosition="${index}" Caption="${label}" Title="${label}" ReferenceType="URL"> 
          ${`https://main--hubblehomes-com--aemsites.hlx.live${inventoryhome.path}${imgsrc[0]}`}</SpecFloorPlanImage>` 
      });
      let matterportURL;
      const linksblock = body.querySelectorAll(".links > div > div > a");
      linksblock.forEach((a) => {
        if (a.href.includes('matterport')) {
          matterportURL = a.href;
        }
      });
      const links = `<SpecInteractiveMedia Type="InteractiveFloorplan" Title="${model} Interactive Floorplan" IsFlash="0"> 
        <WebsiteURL>${matterportURL}</WebsiteURL> 
        </SpecInteractiveMedia> 
        <SpecWebsite>https://www.hubblehomes.com${inventoryhome.path}</SpecWebsite> 
        </Spec> `;
      inventoryXml = `${inventoryXml}${description}${imagexml}${floorPlanImages}${links}`;
    }
  }
  return inventoryXml;
}

async function addImagesDescription(path, modelName) {
  const pageURL = "https://main--hubblehomes-com--aemsites.hlx.live" + path + ".plain.html";
  const response = await fetch(pageURL);
  const pageText = await response.text();
  const dom = new JSDOM(pageText);
  const body = dom.window.document.getElementsByTagName("body")[0];
  const allImageTags = body.querySelectorAll(".carousel > div > div > picture > img ");
  let imagexml = '';
  allImageTags.forEach((img, index) => {
    const imgsrc = (img.src.substring(1)).split('?');
    imagexml += `<InteriorImage SequencePosition="${index}" Title="" 
    Caption="${modelName} New Home Plan by Hubble Homes Boise, Idaho" ReferenceType="URL">
    ${(`https://main--hubblehomes-com--aemsites.hlx.live${path}${imgsrc[0]}`)}</InteriorImage>`;
  });
  let description = '<Description><![CDATA[';
  const ptags = body.querySelectorAll(".description > div > div > p ");
  ptags.forEach((p) => description += (p.innerHTML));
  description += ']]></Description>';
  let elevations = ''
  const allElevationdiv = body.querySelectorAll(".elevations > div ");
  allElevationdiv.forEach((div, index) => {
    const label = div.querySelector('div').innerHTML;
    const img = div.querySelector('div > picture > img');
    const imgsrc = (img.src.substring(1)).split('?');
    elevations = `<ElevationImage SequencePosition="${index}" Caption="${label}" Title="${label}" ReferenceType="URL">
    ${(`https://main--hubblehomes-com--aemsites.hlx.live${path}${imgsrc[0]}`)}</ElevationImage>`
  });
  let floorPlanImages = '';
  const FloorPlanDiv = body.querySelectorAll(".floorplan > div");
  FloorPlanDiv.forEach((div, index) => {
    const label = div.querySelector(' div').innerHTML;
    const img = div.querySelector(' div > picture > img');
    const imgsrc = (img.src.substring(1)).split('?');
    floorPlanImages += `<FloorPlanImage SequencePosition="${index}" Caption="${label}" Title="${label}" ReferenceType="URL">
    ${`https://main--hubblehomes-com--aemsites.hlx.live${path}${imgsrc[0]}`}</FloorPlanImage>`
  });
  let matterportURL;
  let contradovipURL;
  const linksblock = body.querySelectorAll(".links > div > div > a");
  linksblock.forEach((a) => {
    if (a.href.includes('pdf')) {
      contradovipURL = `https://main--hubblehomes-com--aemsites.hlx.live${a.href}`;
    } else if (a.href.includes('matterport')) {
      matterportURL = a.href;
    }
  });
  const links = `<VirtualTour>${matterportURL}</VirtualTour><PlanViewer>${contradovipURL}</PlanViewer>`;
  return `${description}<PlanImages>${elevations}${floorPlanImages}${imagexml}</PlanImages>${links}`;
}

async function addCarouselImages(path) {
  const pageURL = "https://main--hubblehomes-com--aemsites.hlx.live" + path + ".plain.html";
  const response = await fetch(pageURL);
  const pageText = await response.text();
  const dom = new JSDOM(pageText);
  const body = dom.window.document.getElementsByTagName("body")[0];
  const allImageTags = body.querySelectorAll(".carousel > div > div > picture > img ");
  const imagehref = [];
  allImageTags.forEach((img) => {
    const imgsrc = (img.src.substring(1)).split('?');
    imagehref.push(`https://main--hubblehomes-com--aemsites.hlx.live${path}${imgsrc[0]}`);
  });

  return imagehref;
}

async function addPlanInfo(community) {
  const data = await fetchWorkbook([Sheets.MODELS, Sheets.HOME_PLANS]);
  const modelHomePlanMap = new Map();

  for (const model of data.models.data) {
    if (model.community === community) {
      for (const homeplan of data['home-plans']['data']) {
        if (homeplan['model name'] === model['model name']) {
          modelHomePlanMap.set(model, homeplan);
        }
      }
    }
  }
  let homePlanInfo = '';
  for (const [key, value] of modelHomePlanMap.entries()) {
    const imagedata = await addImagesDescription(value['path'], key['model name']);
    const inventoryHome = await addInventoryData(key['model name'], key['community']);
    const bedrooms = key['beds'].includes('-') ? key['beds'].split('-')[0] : key['beds'];
    const baths = key['baths'].includes('-') ? parseFloat(key['baths'].split('-')[0].trim()) : parseFloat(key['baths'].trim());
    const fullBaths = Math.floor(baths);
    const halfBaths = baths - fullBaths;
    const garage = key['cars'].includes('-') ? key['cars'].split('-')[0].trim() : key['cars'];
    const stories = Math.ceil(key['home style'].split(' ')[0]) != NaN ?  Math.ceil(key['home style'].split(' ')[0]) : '';
    homePlanInfo += `<Plan Type="${value['type']}"> 
            <PlanNumber>${value['plan number']}</PlanNumber> 
            <PlanName>${key['model name']}</PlanName> 
            <PlanTypeName>Single Family</PlanTypeName> 
            <BasePrice>${key['price']}</BasePrice> 
            <BaseSqft>${key['square feet']}</BaseSqft> 
            <Stories>${stories}</Stories> 
            <Baths>${fullBaths}</Baths>
            <HalfBaths>${Math.ceil(halfBaths)}</HalfBaths>
            <Bedrooms MasterBedLocation="${key['primary bed']}">${bedrooms.trim()}</Bedrooms> 
            <Garage>${garage}</Garage> 
          ${imagedata} 
          <PlanWebsite>https://www.hubblehomes.com${key['path']}</PlanWebsite> 
          ${inventoryHome} 
          </Plan> `;
  }
  return homePlanInfo;
}

async function addSubDivison(subdivision, salesoffice, carouselImages) {
  let subImage = '';
  let planXML = await addPlanInfo(subdivision['name']);
  carouselImages.forEach((image, index) => {
    if (index + 1 == 1) {
      subImage += `<SubImage Type="Standard" SequencePosition="${index + 1}" Title="" 
                  Caption="" ReferenceType="URL" 
                  IsPreferredSubImage="1">${image}
                  </SubImage> `;
    } else {
      subImage += `<SubImage Type="Standard" SequencePosition="${index + 1}" Title="" 
                  Caption="" ReferenceType="URL">
                  ${image}
                  </SubImage> `;
    }
  });
  const pageURL = "https://main--hubblehomes-com--aemsites.hlx.live" + subdivision.path + ".plain.html";
  const response = await fetch(pageURL);
  const pageText = await response.text();
  const dom = new JSDOM(pageText);
  const body = dom.window.document.getElementsByTagName("body")[0];
  let description = '';
  const ptags = body.querySelectorAll(".description > div > div > p ");
  ptags.forEach((p) => description += (p.innerHTML));  
  const phoneNumber = formatPhoneNumber(salesoffice['phone']);
  const subdivisionXML = `
  <Subdivision Status="Active"> 
    <SubdivisionNumber>${subdivision['SubdivisionNumber']}</SubdivisionNumber> 
    <SubdivisionName>${subdivision['name']}</SubdivisionName> 
    <SubParentName>${subdivision['name']}</SubParentName> 
    <UseDefaultLeadsEmail>${subdivision['UseDefaultLeadsEmail']}</UseDefaultLeadsEmail> 
    <BuildOnYourLot>${subdivision['BuildOnYourLot']}</BuildOnYourLot> 
    <SalesOffice> 
    <Address OutOfCommunity="0"> 
    
    <Street1>${salesoffice['address']}</Street1> 
    <City>${salesoffice['city']}</City> 
    <State>${salesoffice['zip-code-abbr']}</State> 
    <ZIP>${salesoffice['zipcode']}</ZIP> 
    <Country>USA</Country> 
    
    <Geocode> 
      <Latitude>${salesoffice['latitude']}</Latitude> 
      <Longitude>${salesoffice['longitude']}</Longitude>
     </Geocode> 
    
    </Address> 
    
    <Phone> 
      <AreaCode>${phoneNumber[0]}</AreaCode> 
      <Prefix>${phoneNumber[1]}</Prefix> 
      <Suffix>${phoneNumber[2]}</Suffix> 
    </Phone> 
    
    <Hours>${salesoffice['hours']}</Hours> 
    </SalesOffice>  
    <SubAddress> 
    <SubStreet1>${salesoffice['address']}</SubStreet1> 
    <SubCity>${salesoffice['city']}</SubCity>  
    <SubState>${salesoffice['zip-code-abbr']}</SubState> 
    <SubZIP>${salesoffice['zipcode']}</SubZIP> 
    <SubGeocode> 
    <SubLatitude>${salesoffice['latitude']}</SubLatitude> 
    <SubLongitude>${salesoffice['longitude']}</SubLongitude> 
    </SubGeocode> 
    </SubAddress> 
    <DrivingDirections>${encodeString(salesoffice['DrivingDirections'])}</DrivingDirections> 
    <SubDescription><![CDATA[${description}]]></SubDescription> 
    ${subImage} v
    <SubVideoTour Title="Tour of ${subdivision['name']}">${subdivision['videotour']}</SubVideoTour> 
    <SubWebsite>https://www.hubblehomes.com${subdivision['path']}</SubWebsite> 
    ${planXML} 
    </Subdivision> `;  
  return subdivisionXML;
}

async function main() {  
  const dateGenerated = new Date().toJSON();
  const corporation = await fetchWorkbook([Sheets.CORPORATION]);
  const filename = 'HubbleHomes_zillow_feed.xml'
  let corporationXML;
  corporation.data.forEach((entry) => {
    corporationXML = `<Corporation> 
    <CorporateBuilderNumber>${entry['CorporateBuilderNumber']}</CorporateBuilderNumber> 
    <CorporateState>${entry['CorporateState']}</CorporateState> 
    <CorporateName>${entry['CorporateName']}</CorporateName> 
      <Builder> 
        <BuilderNumber>${entry['BuilderNumber']}</BuilderNumber> 
        <BrandName>${entry['BrandName']}</BrandName> 
        <ReportingName>${entry['ReportingName']}</ReportingName> 
        <DefaultLeadsEmail LeadsPerMessage="1">${entry['DefaultLeadsEmail']}</DefaultLeadsEmail> 
        <BuilderWebsite>${entry['BuilderWebsite']}</BuilderWebsite> `;
  });
  const subdivisionData = await fetchWorkbook([Sheets.COMMUNITIES, Sheets.SALES_OFFICES]);
  let subdivisionXML = '';
  const communities = subdivisionData.communities.data.filter((community) => community['XML Feed'] === 'TRUE');
  communities.sort(function(a,b){
    return a.SubdivisionNumber - b.SubdivisionNumber;
  });
  for (const subdivision of communities) {
    const carouselImages = await addCarouselImages(subdivision['path']);
    for (const salesoffice of subdivisionData['sales-offices']['data']) {
      if (salesoffice['community'].toLowerCase() === subdivision['name'].toLowerCase()) {
        salesOfficehelper = salesoffice;
        subdivisionXML += await addSubDivison(subdivision, salesoffice, carouselImages);
      }
    }
  }


  const XMLdata = `<?xml version='1.0' encoding='UTF-8'?> 
  <Builders DateGenerated = "${dateGenerated}"> 
  ${corporationXML} 
  ${subdivisionXML} 
  </Builder> 
  </Corporation> 
  </Builders>`;
  if(XMLValidator.validate(XMLdata)){
    const options = {
      ignoreAttributes : false,
      preserveOrder: true,
      unpairedTags: ["CR"],
      alwaysCreateTextNode: true,
      format: true
  };
    const parser = new XMLParser(options);
    let jsonObj = parser.parse(XMLdata);
    
    const builder = new XMLBuilder(options);
    let sampleXmlData = builder.build(jsonObj);
    fs.writeFileSync(`../../admin/aIncludeInZillow/${filename}`, sampleXmlData);
}
  
}

exports.main = main();