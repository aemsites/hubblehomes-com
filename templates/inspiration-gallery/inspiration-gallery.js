import DeferredPromise from '../../scripts/deferred.js';
import { a, div, small } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getStaffSheet } from '../../scripts/workbook.js';

function createSpecialistBlock(specialist) {
  const agent = div(
    { class: 'specialist' },
    div({ class: 'photo' }, createOptimizedPicture(specialist.photo, specialist.name, false, [{ width: '750' }, { width: '400' }])),
    div(
      { class: 'info' },
      div({ class: 'name' }, specialist.name),
      div({ class: 'designation' }, specialist.designation),
      div({ class: 'line-break' }),
      div({ class: 'phone' }, a({ href: `tel:${specialist.phone}` }, `${formatPhoneNumber(specialist.phone)} ${small('Direct').innerHTML}`)),
      div({ class: 'email' }, a({ href: `mailto:${specialist.email}` }, specialist.email)),
    ),
  );
  if (specialist.communities !== '' && specialist.communities !== undefined) {
    const communityBlock = div({ class: 'communities' }, div({ class: 'communityheader' }, 'Communities'));
    const communitiesArray = specialist.communities.split(',');
    communitiesArray.forEach((community) => {
      communityBlock.appendChild(div({ class: 'community' }, community));
    });
    agent.appendChild(communityBlock);
  }
  return agent;
}

async function createDesigner(specialists) {
  const agents = [];
  const deferred = DeferredPromise();
  const promises = [];
  specialists.forEach((specialist) => {
    const content = [];
    content.name = specialist.name;
    content.designation = specialist.title;
    content.phone = specialist.phone;
    content.photo = specialist.headshot;
    content.email = specialist.email;
    const specialistsBlock = createSpecialistBlock(content);
    const anchor = content.name.toLowerCase().replace(/\s+/g, '-');
    const blockWrapper = div({ class: 'specialists-wrapper' }, a({ id: `${anchor}` }, specialistsBlock));
    promises.push(blockWrapper);
    agents.push(blockWrapper);
  });
  Promise.all(promises)
    .then(() => deferred.resolve(agents));
  return deferred.promise;
}

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const designers = await getStaffSheet('design');
  const designersEl = await createDesigner(designers);
  const specialistsSection = div({ class: 'specialists-sales-team fluid-flex' }, ...designersEl);
  $page.append(specialistsSection);
}
