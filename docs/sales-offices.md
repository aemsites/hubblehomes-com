# Sales Offices
Hubble Homes sales offices are managed in the `helix-sales-offices` sheet located in the hubblehomes.xlsx file.  The sales offices sheet is broken 
down into two different areas.  Communities that references a sales office as they do not have a physical sales office in that communities, and
sales offices that are in the same location as the community.

## Offsite Sales Center Locations
Sales offices that are not located in the same location as the community are defined in the `helix-sales-offices` sheet but have a subset of data 
as compared to the sales offices that are located in the same location as the community.  The following fields are required for a sales office that
is not located in the same location as the community:

* id - a row identifier, must be unique.
* url-slug - the url slug for the sales office.
* community - the community that the sales office is associated with.
* city - the city that the sales office is located in.
* sales-center-location - the location of the sales center.
* phone - the phone number for the sales office.
* address - the address of the sales office.
* DrivingDirections - the driving directions to the sales office, used in the XML feed.

## Onsite Sales Center
Sales offices that are located in the same location as the community are defined in the `helix-sales-offices` sheet and have more details than the
offsite sales centers.  The following fields are required for onsite sale centers:

* id - a row identifier, must be unique.
* url-slug - the url slug for the sales office.
* community - the community that the sales office is associated with.
* city - the city that the sales office is located in.
* sales-center-location - the location of the sales center.
* phone - the phone number for the sales office.
* hours - the hours of operation for the sales office.
* address - the address of the sales office.
* zip-code-abbr - the zip code abbreviation for the sales office.
* zipcode - the zip code for the sales office.
* latitude - the latitude of the sales office.
* longitude - the longitude of the sales office.
* sales-center-model - the model that is located at the sales center.
* models - the models that are located at the sales center.
* note - a note about the sales office.
* DrivingDirections - the driving directions to the sales office, used in the XML feed.

## Next Steps
After the sales offices have been updated, you can preview the changes to ensure that the sales offices are displaying correctly on the website.
