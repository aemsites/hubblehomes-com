import {
  a,
  div,
  h3,
}
  from '../../../scripts/dom-helpers.js';
import { getCommunitiesForModel } from '../../../scripts/models.js';

export default async function decorate(block) {
  const modelName = block.querySelector('p').textContent;
  block.innerHTML = '';

  const communities = await getCommunitiesForModel(modelName);
  const locationList = div();
  communities.forEach((community) => locationList.append(
    a({ href: community.path }, community.name),
  ));

  block.append(
    h3('Also Available At:'),
    locationList,
  );
}
