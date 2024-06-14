import {
  a,
  div,
  h3,
  br,
}
  from '../../../scripts/dom-helpers.js';
import { getCommunitiesForModel } from '../../../scripts/models.js';
import { getCommunityDetailsByName } from '../../../scripts/communities.js';

export default async function decorate(block) {
  // Get the model name from the block
  const modelName = block.querySelector('p').textContent;

  // Fetch communities where the model is available
  const alsoAvailableAt = await getCommunitiesForModel(modelName);

  const alsoAvailableAtContainer = div(h3('Also Available At:'));

  const { host } = window.location;

  const locationList = div();

  const promises = alsoAvailableAt.map(async (location) => {
    const communityDetails = await getCommunityDetailsByName(location);

    if (communityDetails) {
      const communityPath = communityDetails.path;

      // Create a link element for each location
      const linkElement = a({ href: `https://${host}${communityPath}` }, location);
      locationList.appendChild(linkElement);
      locationList.appendChild(br());
    }
  });

  await Promise.all(promises);
  alsoAvailableAtContainer.appendChild(locationList);

  block.innerHTML = '';
  block.appendChild(alsoAvailableAtContainer);
}
