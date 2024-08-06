const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

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
        <SpecBaths>${inventoryhome.baths}</SpecBaths>
        <SpecHalfBaths></SpecHalfBaths>
        <SpecBedrooms MasterBedLocation="${inventoryhome['primary bed']}">${inventoryhome.beds}</SpecBedrooms>
        <SpecGarage>${inventoryhome.cars}</SpecGarage>`;
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
      let description = '<SpecDescription>';
      const ptags = body.querySelectorAll(".description > div > div > p ");
      ptags.forEach((p) => description += p.innerHTML);
      description += '</SpecDescription>';
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
        </Spec>`;
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
  let description = '<Description>';
  const ptags = body.querySelectorAll(".description > div > div > p ");
  ptags.forEach((p) => description += p.innerHTML);
  description += '</Description>';
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
    if (a.href.includes('contradovip')) {
      contradovipURL = a.href;
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
    homePlanInfo += `<Plan Type="${value['Type']}">
            <PlanNumber>${value['PlanNumber']}</PlanNumber>
            <PlanName>${key['model name']}</PlanName>
            <PlanTypeName>Single Family</PlanTypeName>
            <BasePrice>${key['price']}</BasePrice>
            <BaseSqft>${key['square feet']}</BaseSqft>
            <Stories>${key['home style']}</Stories>
            <Baths>${key['baths']}</Baths>            
            <Bedrooms MasterBedLocation="${key['primary bed']}">${key['beds']}</Bedrooms>
            <Garage>${key['cars']}</Garage>         
          ${imagedata}
          <PlanWebsite>https://www.hubblehomes.com${value['path']}</PlanWebsite>
          ${inventoryHome}
          </Plan>`;
  }
  return homePlanInfo;
}

async function addSubDivison(subdivision, salesoffice, carouselImages) {
  let subImage = '';
  let planXML = await addPlanInfo(subdivision['SubdivisionName']);
  carouselImages.forEach((image, index) => {
    if (index + 1 == 1) {
      subImage += `<SubImage Type="Standard" SequencePosition="${index + 1}" Title="" 
                  Caption="" ReferenceType="URL" 
                  IsPreferredSubImage="1">${image}
                  </SubImage>`;
    } else {
      subImage += `<SubImage Type="Standard" SequencePosition="${index + 1}" Title="" 
                  Caption="" ReferenceType="URL">
                  ${image}
                  </SubImage>`;
    }
  });
  const subdivisionXML = `
  <Subdivision Status="Active">
    <SubdivisionNumber>${subdivision['SubdivisionNumber']}</SubdivisionNumber>
    <SubdivisionName>${subdivision['SubdivisionName']}</SubdivisionName>
    <SubParentName>${subdivision['SubParentName']}</SubParentName>
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
      <AreaCode>${salesoffice['phone']}</AreaCode>
      <Prefix>${salesoffice['phone']}</Prefix>
      <Suffix>${salesoffice['phone']}</Suffix>
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
    <DrivingDirections>${salesoffice['DrivingDirections']}</DrivingDirections>
    <SubDescription>${subdivision['SubDescription']}</SubDescription>
    ${subImage} 
    <SubVideoTour Title="Tour of ${subdivision['SubdivisionName']}">${subdivision['SubVideoTour']}</SubVideoTour>
    <SubWebsite>https://www.hubblehomes.com${subdivision['Path']}</SubWebsite>
    ${planXML}
    </Subdivision>`;

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
        <BuilderWebsite>${entry['BuilderWebsite']}</BuilderWebsite>`;
  });
  const subdivisionData = await fetchWorkbook([Sheets.SUBDIVISION, Sheets.SALES_OFFICES]);
  let subdivisionXML = '';
  for (const subdivision of subdivisionData.subdivision.data) {
    const carouselImages = await addCarouselImages(subdivision['Path']);
    for (const salesoffice of subdivisionData['sales-offices']['data']) {
      if (salesoffice['community'].toLowerCase() === subdivision['SubdivisionName'].toLowerCase()) {
        salesOfficehelper = salesoffice;
        subdivisionXML += await addSubDivison(subdivision, salesoffice, carouselImages);
      }
    }
  }


  const XMLdata = `<Builders DateGenerated = "${dateGenerated}">
  ${corporationXML}
  ${subdivisionXML}
  </Builder>
</Corporation>
</Builders>`;
  const parser = new XMLParser();
  let jObj = parser.parse(XMLdata);
  const builder = new XMLBuilder();
  const xmlContent = builder.build(jObj);
  const xml = `<?xml version="1.0"?>${xmlContent}`;
  fs.writeFileSync(`../../admin/aIncludeInZillow/${filename}`, XMLdata);
}

exports.main = main();