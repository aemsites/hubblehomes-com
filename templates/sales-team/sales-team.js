import { getStaffSheet } from '../../scripts/workbook.js';
import DeferredPromise from '../../scripts/deferred.js';
import { div, a, small } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';

function createSpecialistBlock(specialist) {
  const agent = div(
    { class: 'specialist' },
    div({ class: 'specialist-image-container-sales-team' }, createOptimizedPicture(specialist.photo, specialist.name, false, [{ width: '750' }, { width: '400' }])),
    div(
      { class: 'specialist-info-sales-team' },
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

async function createSpecialists(specialists) {
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
    if (specialist['office location 1'] !== '') {
      let communities = specialist['office location 1'];
      for (let i = 2; i <= 5; i += 1) {
        const community = specialist[`office location ${i}`];
        if (community !== '') {
          communities += `,${community}`;
        }
      }
      content.communities = communities;
    }
    const specialistsBlock = createSpecialistBlock(content);
    const formattedName = content.name.toLowerCase().replace(/\s+/g, '-');
    const blockWrapper = div({ class: 'specialists-wrapper' }, a({ id: `${formattedName}` }, specialistsBlock));
    promises.push(blockWrapper);
    agents.push(blockWrapper);
  });
  Promise.all(promises)
    .then(() => deferred.resolve(agents));
  return deferred.promise;
}

export default async function decorate(doc) {
  const $newPage = div();
  const $page = doc.querySelector('main .section');
  const $text = $page.querySelector('.default-content-wrapper');
  const specialistsSection = div({ class: 'specialists-sales-team' });
  specialistsSection.append($text);
  const staffData = await getStaffSheet();
  staffData.sort((x, y) => x.name.localeCompare(y.name));
  const specialistEl = await createSpecialists(staffData);
  specialistsSection.append(...specialistEl);
  const mainPageContent = div({ class: 'section' }, specialistsSection);
  $newPage.appendChild(mainPageContent);
  $page.appendChild($newPage);
}
