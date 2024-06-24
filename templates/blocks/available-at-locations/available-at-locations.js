import {
  a,
  div,
  h3,
}
  from '../../../scripts/dom-helpers.js';
import { getCommunitiesForModel } from '../../../scripts/models.js';
import { readBlockConfig } from '../../../scripts/aem.js';

export default async function decorate(block) {
  const {
    model,
  } = readBlockConfig(block);

  block.innerHTML = '';

  const communities = await getCommunitiesForModel(model);
  const locationList = div();

  communities.forEach((community) => locationList.append(
    a({ href: community.path }, community.name),
  ));

  block.append(
    h3('Also Available At:'),
    locationList,
  );
}
