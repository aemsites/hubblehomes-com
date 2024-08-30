# Models
**The term model refers to a specific home plan, that is available in a community.**  A model can be though of a snapshot of a home-plan, placed
in a community. See the [home-plans](./home-plans.md) documentation for more information on home plans.

The process of adding a model to a community is a multi-step process that involves creating a folder, a Word document.

## Creating a New Model
Navigate to the community which will contain the model.  Once in the correct community, follow the steps below to create a new model.

### Authoring a Word Document
1. Copy an existing model word document and rename it to the name of the model.
2. Open the Word document and update the content to reflect the new model.
3. Preview the Word document to ensure that the content is correct.
4. Copy the url path that the preview generated and keep it around for the next step.
5. Create a folder for the model in the community folder that will contain the inventory homes associated with the model.

### Modify the hubblehomes.xlsx File
After the model Word document has been created, the hubblehomes.xlsx file must be updated to reflect the new model.
The hubblehomes.xlsx file is located in the hubblehomes data folder. The hubblehomes.xlsx file contains a sheet called helix-models that
needs to be updated with the new model details.  Update the helix-models sheet with the following information:

* path - the url to the model word document that was created in the previous step.
* community - the community that the model is located in.
* model name - the name of the model.
* price - the price of the model.
* square feet - the square feet of the model.
* beds - the number of beds in the model.
* baths	cars - the number of baths in the model.
* home style - the style of the home.
* primary bed - the primary bedroom location.
* full bath main - full bath on main.
* full bed on first - full bed on first floor.
* den/study - if the house has a den/study.

## Next Steps
After the model has been created, the next step is to create inventory homes in the model.  See the [inventory](./inventory-homes) documentation for 
more information on creating inventory homes.
