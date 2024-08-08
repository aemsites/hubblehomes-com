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

    const loadingContainers = document.querySelectorAll('.loading-container');
    loadingContainers.forEach((container) => {
      const formContainer = container.closest('.hubspot-form');
      if (formContainer) {
        const actualForm = formContainer.querySelector('form');
        if (actualForm) {
          actualForm.style.opacity = '0';
          actualForm.style.display = 'none';

          // Fade out loading animation
          container.style.transition = 'opacity 0.5s ease-out';
          container.style.opacity = '0';

          // After loading animation fades out, fade in the actual form
          setTimeout(() => {
            container.style.display = 'none';
            actualForm.style.display = 'block';
            actualForm.style.transition = 'opacity 0.5s ease-in';
            actualForm.style.opacity = '1';
          }, 500);
        }
      }
    });
  });
}
