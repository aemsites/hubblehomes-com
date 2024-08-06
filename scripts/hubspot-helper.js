import { buildForms, hasForms } from './forms-helper.js';

export default function loadHubSpot() {
  if (!hasForms()) return;

  const hsScriptEl = document.createElement('script');
  hsScriptEl.type = 'text/javascript';
  hsScriptEl.async = true;
  hsScriptEl.setAttribute('id', 'hs-script-loader');
  hsScriptEl.src = 'https://js.hsforms.net/forms/embed/v2.js';
  document.querySelector('head').append(hsScriptEl);
  hsScriptEl.addEventListener('load', () => {
    buildForms(hbspt); // eslint-disable-line
  });
}
