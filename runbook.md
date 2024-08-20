# Introduction
This runbook provides all project specific details for hubblehomes.com now running on Adobe Edge Delivery Services

For latest updates on the product related features, please refer to https://www.aem.live/docs/

## Environment Setup

- Public site : https://www.hubblehomes.com/

- Code Repository : https://github.com/aemsites/hubblehomes-com
- Content Repository : https://woodsidegroup.sharepoint.com/:f:/r/sites/HubbleHomesWebsite/Shared%20Documents/Website/hubblehomes

- Preview URL: https://main--hubblehomes-com--aemsites.hlx.page/
- Live URL: https://main--hubblehomes-com--aemsites.hlx.live/

hubblehomes.com is BYODNS setup where Adobe CDN(hlxcdn.adobeaemcloud.com) is being is used. 
- BYODNS setup was completed at the time of golive by following : https://www.aem.live/docs/byo-dns
- Redirects rules are being set on EDS level to help make legacy urls work.

## Development Collaboration and Good Practices

Working with a large number of development teams across many projects and organizations we found that it is useful to collect some of our insights. Some of those are related to AEM, but the majority are related to general purpose frontend development or are just general guidelines on how to collaborate in a team of developers.

You may read some of those items and think that it is generally understood as common sense amongst developers. We agree, and that’s a great sign that you are ready to work in a collaborative way on AEM projects together with other developers.

Please review https://www.aem.live/docs/dev-collab-and-good-practices for additional information and update this section you may want your developers to follow.

## Anatomy of project

Please review general guidelines on how a typical project looks like from a code standpoint : https://www.aem.live/developer/anatomy-of-a-franklin-project

### What's different in hubblehomes.com 
- article-list.js : contains helper methods for fetching news articles
- communities.js : contains helper methods for fetching communities data based on specific filters
- dom-helpers.js : contains helper method for creating common html elements.
- gallery-rules.js: contains rules defining number of images to be rendered in gallery view.
- home-plans.js: contains helper method to fetch home plans
- models.js: contains helper method to fetch models based on specific filter conditions.
- inventory.js: contains helper methods to fetch inventory homes based on communities, home plans, city etc. 
sales-center.js: contains helper method to reterieve sales center information. 
- templates : Loads CSS and JS specific to a template, allowing for template specific styling and auto-blocking, without intermingling that code into global scripts/styles.
 
Sidekick plugins
- Block Library :  See https://www.aem.live/docs/sidekick-library for more details
- Open HubbleHomes Sheet: Provides an easy access to [Hubble Homes Master Spreadsheet](https://main--hubblehomes-com--aemsites.hlx.live/data/hubblehomes.json)



## Customization and Variations | hubblehomes.com 

### Indexing

Adobe Experience Manager offers a way to keep an index of all the published pages in a particular section of your website. This is commonly used to build lists, feeds, and enable search and filtering use cases for your pages.  AEM keeps this index in a spreadsheet and offers access to it using JSON. 

For hubblehomes.com, page-index.xlsx is available in sharepoint and the JSON is exposed at https://main--hubblehomes-com--aemsites.hlx.live/data/page-index.json. 
Furthermore, a news index containing data for all news article is available at https://main--hubblehomes-com--aemsites.hlx.live/news/news-index.json. 
Also, Index definition for hubblehomes.com is available in the github, See helix-query.yaml

```
Index definitions are auto updated. 

page-index.xlsx and news-index.xlsx files should not be modified or removed by the author/end user. 
```

In context of Hubble Homes, [Hubble Homes Master Spreadsheet](https://main--hubblehomes-com--aemsites.hlx.live/data/hubblehomes.json) is used to build
- Homepage, Communities, Home Plans, Inventory pages
- Search
- XML feeds

Please review the official documentation around Indexing on AEM Edge delivery services : https://www.aem.live/developer/indexing

## Search Functionality and Data Management

### How Search Works

The search functionality on hubblehomes.com is powered by data from the Hubble Homes Master Spreadsheet. This spreadsheet contains multiple sheets that provide data for different aspects of the site:

- Communities
- Staff
- Models
- Inventory
- Home Plans
- Cities

The search bar in the header uses this data to provide autocomplete suggestions as users type. It combines results from all these data sources to offer a comprehensive search experience.

### Updating Data for Authors

Authors can update the site's data by modifying the Hubble Homes Master Spreadsheet `hubblehomes.xlsx`. This spreadsheet is located at:

`https://woodsidegroup.sharepoint.com/:f:/r/sites/HubbleHomesWebsite/Shared%20Documents/Website/hubblehomes/data/`

To update the data:

1. Open the hubblehomes.xlsx spreadsheet in SharePoint.
2. Navigate to the appropriate sheet (e.g., helix-communities, helix-staff, helix-models, etc.) depending on what data needs to be updated.
3. Make the necessary changes or additions to the data.
4. Save the spreadsheet.

After updating the spreadsheet, the changes need to be published for them to take effect on the live site:

1. Open the [Hubble Homes Master Spreadsheet](https://main--hubblehomes-com--aemsites.hlx.live/data/hubblehomes.json) in a web browser.
2. Use the Sidekick to preview and publish the updated spreadsheet.

Once published, the new data will be available for the search functionality and other parts of the website that use this data.

Note: It may take a few minutes for the changes to propagate and be reflected in the search results on the live site.


### Technical Details of Search Implementation

The search functionality on hubblehomes.com is implemented using JavaScript and relies on data from the Hubble Homes Master Spreadsheet. Here's a more detailed breakdown of the search process:

1. Data Fetching:

The search data is fetched from various sheets in the Hubble Homes Master Spreadsheet using functions defined in the `workbook.js`   file. These functions include `getCommunitiesSheet()`, `getStaffSheet()`, `getModelsSheet()`, `getInventorySheet()`, `getHomePlansSheet()`, and `getCitySheet()`.

2. Data Formatting:

The fetched data is then formatted for use in the autocomplete functionality. This is done using helper functions defined in the `search-helper.js` file:

These functions transform the raw data into a consistent format suitable for display in the autocomplete suggestions.

3. Autocomplete Implementation:

The autocomplete functionality is set up in the `header.js` file. It uses a debounced input event listener to trigger the search as the user types:


### Templates

Load CSS and JS specific to a template, allowing for template specific styling and auto-blocking, without intermingling that code into global scripts/styles. 

Note: because the template js is loaded before blocks are loaded, but after sections/blocks are decorated, auto blocking needs to be done with that in mind (that is, build and decorate your blocks, and add them to a section, but do not load them).

Templates such as communities, inventory, locations, home-plans, news-detail etc. are all based on this and js/css code is available in github under /templates. There is a `decorate` function in these templates where you can load elements.


### 3rd Party Integrations
Below are the 3rd party integrations which are included as part of delayed.js. 

- Google Tag Manager
- Google Maps
- Hubspot

Other integrations are included as distinct blocks which can be added by authors while authoring content
- Youtube
- Animoto
- Twitter

### XML Feeds 
XML feed implementation has 2 different facets:

1. XML feed generator
    ---
    - This is a nodejs application available at .github/xml-feed/generate-xml-feed.js
    - Code relies on node js fs & jsdom api. Dependencies are defined in package.json file available at .github/xml-feed/package.json
    - XML feed is generated and stored within the GitHub and file is available at /admin/aIncludeInZillow/HubbleHomes_zillow_feed.xml
    - Code for XML feed generation can run locally by using the below command:
    
    -  ``` 
        cd .github/xml-feed
        npm install
        node generate-xml-feed.js
2. GitHub Workflow
    ---
    - GitHub workflow is used to trigger RSS feed generation.
    - Workflows are available under .github/workflows directory and XML feed generation is controlled by generate-xml-feed.yaml
   - Workflow can be maually triggered by going to https://github.com/aemsites/hubblehomes-com/actions/workflows/generate-xml-feed.yaml
   - Click on `Run Workflow`
   - Select a branch other than `main`
   - Click `Run Workflow`
   - This will create the XML file under the specified branch.
   - As a next step, a Pull Request needs to be created to merge XML file to the main branch.
    
 


### Sitemaps
Sitemap definition is available in the github under helix-sitemap.yaml. Sitemap-index is available at https://main--hubblehomes-com--aemsites.hlx.live/sitemap.xml

Please review https://www.aem.live/developer/sitemap for additional information for sitemaps.

## Monitoring and Logging
You can review https://www.aemstatus.net/ to monitor all internal status for AEM sites, services, and components relating to Edge Delivery Services, document-based authoring, integrations, and related services.

Admin and indexing operations are recorded in an audit log that can be queried via an Admin endpoint. 
Please review https://www.aem.live/docs/auditlog for more details.

Admin API is available at https://www.aem.live/docs/admin.html


### Data Dashboard - Real User Monitoring 

Core web vitals trends : https://treo.sh/sitespeed/www.hubblehomes.com/



## Maintenance and Support

Follow the official support process by logging tickets with AEM Support team. Before creating a case with Adobe, fully qualify the issue to understand if it's a product level  or project level problem. 

You could also try to engage with Adobe on Slack channel #aem-sekisuihouse in the Adobe Enterprise Support space. 
