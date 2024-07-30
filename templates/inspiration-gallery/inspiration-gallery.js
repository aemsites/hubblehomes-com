import DeferredPromise from '../../scripts/deferred.js';
import { a, div, small } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getStaffSheet } from '../../scripts/workbook.js';

function createDesignerBlock(designer) {
  return div(
    { class: 'specialist' },
    div({ class: 'photo' }, createOptimizedPicture(designer.photo, designer.name, false, [{ width: '750' }, { width: '400' }])),
    div(
      { class: 'info' },
      div({ class: 'name' }, designer.name),
      div({ class: 'designation' }, designer.designation),
      div({ class: 'line-break' }),
      div({ class: 'phone' }, a({ href: `tel:${designer.phone}` }, `${formatPhoneNumber(designer.phone)} ${small('Direct').innerHTML}`)),
      div({ class: 'email' }, a({ href: `mailto:${designer.email}` }, designer.email)),
    ),
  );
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
    const specialistsBlock = createDesignerBlock(content);
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
  const specialistsSection = div({ class: 'specialists-design-team fluid-flex' }, ...designersEl);
  $page.append(specialistsSection);
}
