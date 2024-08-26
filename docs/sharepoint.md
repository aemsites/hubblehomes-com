# Hubble Homes Share Point
The data for Hubble Homes is stored in Sharepoint where the data is structured in such a way that allows authors to create cities,
communities, models, inventory homes, home plans and staff. The authored word documents are stored in a hierarchy that defines cities, communities, 
models, and inventory homes. The hierarchy is defined in Sharepoint via the following folder structure. 

## Hubble Homes Sharepoint Folder Structure
The Hubble Homes Sharepoint folder structure is defined as follows:

```
hubblehomes
  |- new-homes
    |- idaho (state)
      |- boise-metro (region)
        |- cities (cities)
          |- communities (communities)
            |- models (models)
              |- inventory-homes (inventory homes)
  |- home-plans.docx (home plans)
```

The folder structure is essential to respect when creating new cities, communities, models, inventory homes, adding staff and updating available home
plans. The hierarchy defines the navigation, and the relationship used to generating the breadcrumb trails on the website. 

The following sections provide a detailed explanation of the folder structure and the data that is stored in each folder.

### States
The states are defined at the following level. The current implementation and design of hubble homes has been limited to the state of Idaho
at this time.
```
hubblehomes
  |- new-homes
    |- idaho (state folder)
    |- idaho.docx (state file)
```

### Regions
The regions are defined at the following level. The current implementation and design of hubble homes has been limited to the Boise Metro.
```
hubblehomes
  |- new-homes
    |- idaho
      |- boise-metro (region folder)
      |- boise-metro.docx (region file)
```

### Cities
The cities are defined at the following level.  Each city has a folder and a word document that defines the city. 
```
hubblehomes
  |- new-homes
    |- idaho
      |- boise-metro
        |- kuna (city folder)
        |- kuna.docx (city file)
                
```


### Communities
The communities are defined at the following level. Each community must have and a word document that defines the community, and 
may contain a folder that contains the models and inventory homes associated with the community.
```
hubblehomes
  |- new-homes
    |- idaho
      |- boise-metro
        |- middleton 
          |- waterford (community folder)
          |- waterford.docx (community file)
```

### Models
Every community may have a list of models that are associated with the community. The models are defined at the following level. Each model has a 
folder and a word document that defines the model.  
```
hubblehomes
  |- new-homes
    |- idaho
      |- boise-metro
        |- middleton 
          |- waterford 
            |- alturas.docx (model file)
```

### Inventory Homes
A community may have a list of inventory homes. Each inventory home is located in a folder that is named after the address of the inventory home, 
that resides in the model's folder.  
```
hubblehomes
  |- new-homes
    |- idaho
      |- boise-metro
        |- middleton 
          |- waterford 
            |- alturas (model folder)
              |- 12345-street-name (address of inventory home folder)
                |- 999.docx (inventory home file)
```


## HubbleHomes.xlsx
The data for Hubble Homes is stored in an Excel spreadsheet that is located in the `/data` folder of the Hubble Homes
project. The spreadsheet is named [hubblehomes.xlsx](https://woodsidegroup.sharepoint.com/:x:/r/sites/HubbleHomesWebsite/Shared%20Documents/Website/hubblehomes/data/hubblehomes.xlsx?d=w5eb9406180fd4a4ebdcbb02f9a4e06ba&csf=1&web=1&e=5nhbW4&nav=MTVfezBCMzc5RDVBLTkwMDEtNEMwMC05NEZDLTAxQTIwQkQ4OUJBMH0) 
and contains multiple sheets that are used to store the data for the website. The sheets in the workbook are used to store the data for 
cities, communities, models, inventory homes, staff and home plans. Each of these sheets contains columns that are used to store the data for the corresponding 
item. 


## Next Steps
Continue reading the documentation to learn more about how to create cities, communities, models, inventory homes, staff, and home plans.
See the [Getting Started guide](./getting-started.md).
