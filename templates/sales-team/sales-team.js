import { buildBlock, decorateBlock } from '../../scripts/aem.js';
import { getStaffSheet } from '../../scripts/workbook.js';
import DeferredPromise from '../../scripts/deferred.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';
import { div, a, small, p } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../../scripts/aem.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';

function buildBreadCrumbs() {
    return div(
        { class: 'breadcrumbs' },
        a({ href: '/', 'aria-label': 'View Home Page' }, 'Home'),
        ' > ',
        'Our Sales Team'
    );
}

function createSpeicalistBlock(specialist) {    
    const agent = div(
        { class: 'specialist' },
        div({ class: 'specialist-image-container-sales-team' }, createOptimizedPicture(specialist.photo, specialist.name, false, [{ width: '750' }, { width: '400'}])),
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
            communityBlock.appendChild(div({ class: `community` }, community));
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
        console.log(specialist);
        const content = [];
        content['name'] = specialist.name;
        content['designation'] = specialist.title;
        content['phone'] = specialist.phone;
        content['photo'] = specialist.headshot;
        content['email'] = specialist.email;
        if (specialist['office location 1'] !== '') {
            let communities = specialist['office location 1'];
            for (let i = 2; i <= 5; i++) {
                const community = specialist[`office location ${i}`];
                if (community !== '') {
                    communities += `,${community}`;
                }
            }
            content['communities'] = communities;
        }
        const specialistsBlock = createSpeicalistBlock(content);
        const blockWrapper = div({class: 'specialists-wrapper'} ,specialistsBlock);        
        promises.push(blockWrapper);
        agents.push(blockWrapper);
    });
    Promise.all(promises)
        .then(() => deferred.resolve(agents));
    return deferred.promise;
}

export default async function decorate(doc) {
    const $newPage = div();

    const $carouselWrapper = doc.querySelector('.carousel-wrapper');
    if ($carouselWrapper) {
        $newPage.appendChild($carouselWrapper);
    }

    const $page = doc.querySelector('main .section');

    const $breadCrumbs = buildBreadCrumbs();
    const specialistsSection = div({ class: 'specialists-sales-team' });
    const staffData = await getStaffSheet('data');
    staffData.sort((a, b) => a.name.localeCompare(b.name));
    const specialistEl = await createSpecialists(staffData);
    specialistEl.forEach((el) => {
        specialistsSection.appendChild(el);
    });
    const mainPageContent = div({ class: 'section' }, $breadCrumbs, specialistsSection);
    $newPage.appendChild(mainPageContent);
    $page.appendChild($newPage);
}
