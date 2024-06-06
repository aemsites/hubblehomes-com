/* eslint-disable object-curly-newline, function-paren-newline */
import { div, img, a, form, label, input, small } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const footer = await fetch('/footer.plain.html');

  if (footer.ok) {
    const htmlText = await footer.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const $iconRow = div({ class: 'icon-row' },
      a({ class: 'logo', href: '/', 'aria-label': 'Visit Home Page' }, img({
        src: '/icons/hubble-homes-logo.svg',
        width: '110',
        height: '56',
        alt: 'Hubble Homes, LLC',
      })),
      div(
        a({ class: 'btn facebook', href: 'https://www.facebook.com/hubblehomes', target: '_blank', 'aria-label': 'Visit us on Facebook' }),
        a({ class: 'btn youtube', href: 'https://www.youtube.com/channel/UC6IB9iRD8FRnR-aNCZR8PLw', target: '_blank', 'aria-label': 'Visit us on YouTube' }),
        a({ class: 'btn pinterest', href: 'https://www.pinterest.com/hubblehomesid/', target: '_blank', 'aria-label': 'Visit us on Pinterest' }),
        a({ class: 'btn instagram', href: 'https://www.instagram.com/hubblehomes/', target: '_blank', 'aria-label': 'Visit us on Instagram' }),
        a({ class: 'btn news', href: 'https://www.hubblehomes.com/news', target: '_blank', 'aria-label': 'Visit our News' }),
        a({ class: 'btn hud', href: 'https://www.hud.gov/program_offices/fair_housing_equal_opp', target: '_blank', 'aria-label': 'Visit HUD' }),
      ),
    );

    // subscribe form
    const $form = form({ class: 'subscribe' },
      label({ for: 'emailfooter' },
        small('Stay in the know with news and updates by email'),
      ),
      div(
        input({ type: 'text', name: 'firstname', id: 'firstname', class: 'required firstname', required: '', placeholder: 'First Name' }),
        input({ type: 'text', name: 'lastname', id: 'lastname', class: 'required lastname', required: '', placeholder: 'Last Name' }),
      ),
      div(
        input({ type: 'email', name: 'email', id: 'emailfooter', class: 'required email', required: '', placeholder: 'Email Address' }),
        input({ type: 'submit', name: 'Submit', value: 'Subscribe', class: 'button submit' }),
      ),
    );

    const $top = div({ class: 'top' }, div());
    const $bottom = div({ class: 'bottom' }, $iconRow);

    // define sections and map to them
    const sections = ['col-1', 'col-2', 'col-3', 'terms'];
    const sectionsHTML = Array.from(doc.body.children);

    sections.forEach((section, row) => {
      const html = sectionsHTML[row];
      html.classList.add(section);

      if (html) {
        // top 3 rows
        if (row >= 0 && row <= 2) {
          // decorate buttons
          html.querySelectorAll('p > a').forEach((btn) => btn.classList.add('btn'));
          // 2nd row
          if (row === 1) html.append($form);
          $top.firstChild.append(html);
        }

        // bottom row
        if (row === 3) $bottom.append(html);
      } else {
        // eslint-disable-next-line no-console
        console.log('Section not found for index', row);
      }
    });

    block.replaceWith($top, $bottom);
  } else {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch fragment:', footer.statusText);
  }
}
