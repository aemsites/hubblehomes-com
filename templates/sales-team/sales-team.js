import { buildBlock, decorateBlock } from '../../scripts/aem.js';
import { getStaffSheet } from '../../scripts/workbook.js';
import DeferredPromise from '../../scripts/deferred.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';
import { div, a } from '../../scripts/dom-helpers.js';

function buildBreadCrumbs() {
    return div(
        { class: 'breadcrumbs' },
        a({ href: '/', 'aria-label': 'View Home Page' }, 'Home'),
        ' > ',
        'Our Sales Team'
    );
}

async function createSpecialists(specialists) {
    const agents = [];
    const deferred = DeferredPromise();
    const promises = [];    
    specialists.forEach((specialist) => {
        console.log(specialist);
        const content = [];
        content.push(['name', specialist.name]);
        content.push(['designation', specialist.title]);        
        content.push(['phone', specialist.phone]);
        content.push(['photo', specialist.headshot]);
        content.push(['email', specialist.email]);
        if (specialist['office location 1'] !== '') {        
            let communities = (specialist['office location 1']);
            for (let i = 2; i <= 5; i++) {
                const community = specialist[`office location ${i}`];
                if (community !== '') {
                    communities += `,${(community)}`;
                }
            }            
            content.push(['communities', communities]);
        }
        content.push(['type', 'sales-team']);
        const specialistsBlock = buildBlock('specialists', content);
        const blockWrapper = div(specialistsBlock);        
        decorateBlock(specialistsBlock);
        promises.push(loadTemplateBlock(specialistsBlock));
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
    const specialistEl = await createSpecialists(staffData);     
    specialistEl.forEach((el) => {
        specialistsSection.appendChild(el);
      });
    const mainPageContent = div({ class: 'section' }, $breadCrumbs, specialistsSection);
    $newPage.appendChild(mainPageContent);
    const $parent = $page.parentNode;
    $parent.replaceChild($newPage, $page);
}
