# Communities
The process of creating a new community is a multi-step process that involves creating a folder, a Word document, and image that 
defines the community.

## Creating a New Community

### Authoring a Word Document
To create a new community, follow these steps:

1. Navigate to the folder hubblehomes > new-homes > idaho > boise-metro > city.
2. Copy an existing community word document and rename it to the name of the community.
3. Open the Word document and update the content to reflect the new community.
4. Preview the Word document to ensure that the content is correct. 
   NOTE: the page may not render correct as the sales center information is most likely missing at this point.  See the 
[Sales Centers](./sales-centers.md) documentation for more information on creating and maintaining sales centers. Even though the page
did not render correctly, continue with step 5.
5. Copy the url path that the preview generated and keep it around for the next step.
6. Create a folder for the community in the city folder that will contain the models and inventory homes associated with the community.

### Modify the hubblehomes.xlsx File
After the community word document has been created, the hubblehomes.xlsx file must be updated to reflect the new community.  
The hubblehomes.xlsx file is located in the hubblehomes data folder. The hubblehomes.xlsx file contains a sheet called helix-communities that
needs to be updated with the new community details.  Update the helix-community sheet with the following information:

* path - the url to the community word document that was created in the previous step.
* name - the name of the community.
* city - the city that the community is located in.
* region - the region that the community is located in.
* state - the state that the community is located in.
* zip-code-abbr - the zip code abbreviation for the community.
* phone - the phone number for the community.
* status - the status of the community.
* latitude - the latitude of the community.
* longitude - the longitude of the community.
* price - the price of the community.
* square feet - the range of square feet for the community.
* beds - the range of beds for the community.
* baths - the range of baths for the community.
* cars - the range of cars for the community.
* image - the image for the community card.
* lotmap - the lot map for the community.
* videotour - the video tour for the community.
* SubdivisionNumber - the subdivision number for the community used for the XML FEED
* UseDefaultLeadsEmail - the default leads email for the community used for the XML FEED
* BuildOnYourLot - the build on your lot flag for the community used for the XML FEED
* XML Feed - if the community is included in the XML feed

#### Community Image
The community image is used to display the community card on the website.  The community image should be added to the communities image folder located
in Sharepoint under [hubblehomes/images/communities](https://woodsidegroup.sharepoint.com/:f:/r/sites/HubbleHomesWebsite/Shared%20Documents/Website/hubblehomes/images/communities?csf=1&web=1&e=3hvoaw).

Once the image has been uploaded to the communities folder, select the image and click preview and then publish the image.  Once the image has been
published, copy the url path that the publish operation generated and update the hubblehomes.xlsx helix-communities sheet with the new image path for the
community.

## Next Steps
After the community has been created, the next step is to create models and inventory homes in the community.  See the [models](./models.md) 
documentation for more information on creating models and the [inventory](./inventory-homes) documentation for more information on creating 
inventory homes.
