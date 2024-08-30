# Home Plans
The process of adding a new homes plan is a multi-step process that involves creating a Word document, creating an entry in the hubblehomes spreadsheet, and providing an 
image that represents the home plan on a card.  A home plan differs from a model in that a home plan is a specific design and communities can 
have multiple models based on the same home plan. As an author you can think of a home plan as the blueprint for a model, and models exist in communities. A home plan defines the basis for a model,
where all models refer back to the home plan to obtain the image representation for that model.

See the [models](./models.md) documentation for more information on models.

## Adding to Home Plans

### Authoring a Word Document
To add a new home plan, follow these steps:

1. Navigate to the folder hubblehomes > home-plans > plan-details
2. Copy an existing home plan Word document and rename it to the name of the home plan.
3. Open the Word document and update the content to reflect the new home plan.
4. Preview the Word document to ensure that the content is correct.
5. Copy the url path that the preview generated and keep it around for the next step.

### Modify the hubblehomes.xlsx File
After the home plan Word document has been created, the hubblehomes.xlsx file must be updated to reflect the new home plan.
The hubblehomes.xlsx file is located in the hubblehomes data folder. The hubblehomes.xlsx file contains a sheet called helix-home-plans that
needs to be updated with the new home plan details.  Update the helix-home-plans sheet with the following information:

* path - the url to the home plan word document that was created in the previous step.
* model name - the name of the model that the home plan is based on.
* price - the price of the home plan.
* square feet - the square feet of the home plan.
* beds - the number of beds in the home plan.
* baths - the number of baths in the home plan.
* cars - the number of cars in the home plan.
* den/study - if the house has a den/study.
* primary bed - the primary bedroom location.
* full bed on first - full bed on first floor.
* full bath main - full bath on main.
* home style - the style of the home.
* image - the image url for the home plan card.
* plan number - the plan number for the home plan used in the XML Feed.
* type - the type of home plan used in the XML Feed.

#### Home Plan Image
The home plan image is used to display the home plan card on the website.  The home plan image should be added to the `card` image folder located
in Sharepoint under hubblehomes > images > models > card. Once the image has been uploaded to the card folder, select the image and click preview 
and then publish the image.  Once the image has been published, copy the url path that the publish operation generated and update the 
hubblehomes.xlsx helix-home-plans sheet with the new home plan's image path.
