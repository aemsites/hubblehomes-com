# How To - Managing Communities
The following document describes how to manage communities in Hubble Homes.  

## Creating a New Community
The following are the steps to create a new community:

1. Follow the steps in the [Communities](../communities.md) documentation to create a new community. 
2. A community must have a sales center associated with it, see the [Sales Centers](../sales-centers.md) documentation for more information on 
creating and maintaining sales centers.  
3. Once a community and sales center have been created, preview the community to ensure that the content is correct.
4. If the community is rendering as expected, at this point consider adding models and inventory homes to the community.  See the 
[Models](../models.md) and [Inventory](../inventory-homes) documentation for more information on creating models and inventory homes.

## Checklist
The following is a checklist of items that must be completed when creating a new community:
1. community page exists
2. community has a sales center
3. sales agents have been assigned to the sale center
4. the community has models, and maybe inventory homes

Once the checklist has been completed and the community, models, inventory homes are ready, preview everything to verify. If everything looks good,
and the powers at be would like to publish the community, go through and publish in reverse order the inventory homes, models, sales center, 
and community.


## Removing a Community (Admin Only)
The following are the steps to remove a community:

1. Remove the community from the communities sheet in hubblehomes.xlsx.
2. Remove the community from the sales center spreadsheet in hubblehomes.xlsx.
3. You may publish the changes to the hubblehomes.xlsx file to update the website at this point.
4. Using the AEM Admin API we need to obtain a list of pages that are associated with a community to unpublish.

We can use the preview API to get a list of pages that are associated with a community.
```
POST https://admin.hlx.page/preview/aemsites/hubblehomes-com/main/*
{
  "forceUpdate": false,
  "paths": [
    "/hubblehomes/new-homes/idaho/boise-metro/meridian/<community>"
   ],
  "delete": true
}
```
The result of this API call will return a list of pages that are associated with the community, including models, and inventory homes.

The next step is to [unpublish](https://www.aem.live/docs/admin.html#tag/publish/operation/unpublishResource) the pages that were returned from the previous step.
You could create a script to iterate over the list of pages and unpublish them, or you could manually unpublish each page.
```
DELETE https://admin.hlx.page/preview/aemsites/hubblehomes-com/main/<path/to/page>
```

5. Once the pages have been unpublished, the communities pages should be removed from the website and no longer available. 
