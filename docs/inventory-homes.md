# Inventory Homes
The process of creating a new inventory home is a multi-step process that involves creating a folder, a Word document, and image that defines 
the inventory home.

## Creating an Inventory Home
Navigate to the community which will contain the new inventory home.  Once in the correct community, follow the steps below to create a new inventory
home.

### Authoring a Word Document
1. Create if needed, a folder for the inventory home in the community folder with the same name as the model name.
2. In the inventory home folder, create a new folder, following a similar naming convention is in place, where the name of the folder is the address
of the inventory home.
3. Copy an existing inventory home Word document into the folder from step 2, and verify that the name of the file is 999.docx. Although the name
of the inventory home does not need to be named 999.docx, it's best to follow the existing naming conventions to avoid confusion.
4. Open the Word document and update the content to reflect the new inventory home.
5. Preview the Word document to ensure that the content is correct.
6. Copy the url path that the preview generated and keep it around for the next step.

### Modify the hubblehomes.xlsx File
After the inventory home Word document has been created, the hubblehomes.xlsx file must be updated to reflect the new inventory home.
The hubblehomes.xlsx file is located in the hubblehomes data folder. The hubblehomes.xlsx file contains a sheet called helix-inventory that
needs to be updated with the new inventory home details.  Update the helix-inventory sheet with the following information:

* path - the url to the inventory home word document that was created in the previous step.
* community - the community that the inventory home is located in.
* model name - the name of the model that the inventory home is based on.
* price - the price of the inventory home.
* square feet - the square feet of the inventory home.
* beds - the number of beds in the inventory home.
* baths - the number of baths in the inventory home.
* cars - the number of cars in the inventory home.
* primary bed - the primary bedroom location
* home style - the style of the home
* full bed on first - full bed on first floor
* full bath on main - full bath on main
* status - the status of the inventory home
* mls - the MLS number for the inventory home
* address - the address of the inventory home
* latitude - the latitude of the inventory home
* longitude - the longitude of the inventory home

## Next Steps
After the inventory home has been created, the next step is to verify that the inventory home is displayed correctly on the website.  Preview the
inventory home to ensure that the content is correct. 
