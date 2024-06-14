import { a, div, h3, br } from '../../../scripts/dom-helpers.js';
import { getCommunitiesForModel } from '../../../scripts/models.js';
import { getCommunityDetailsByName } from '../../../scripts/communities.js';

export default async function decorate(block) {
  // Get the model name from the block
  const modelName = block.querySelector('p').textContent;

  // Fetch communities where the model is available
  const alsoAvailableAt = await getCommunitiesForModel(modelName);

  const alsoAvailableAtContainer = div(h3('Also Available At:'));

  const host = window.location.host;

  // Create a list to hold the location links
  const locationList = div();

  // Add each location to the Also Available At container
  for (const location of alsoAvailableAt) {
    const communityDetails = await getCommunityDetailsByName(location);
    
    if (communityDetails) {
      const communityPath = communityDetails.path;
      
      // Create a link element for each location
      const linkElement = a({ href: `https://${host}${communityPath}` }, location);
      locationList.appendChild(linkElement);
      locationList.appendChild(br());
    }
  }
  alsoAvailableAtContainer.appendChild(locationList);

  block.innerHTML = '';
  block.appendChild(alsoAvailableAtContainer);
}
