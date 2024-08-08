import { buildForms, hasForms } from './forms-helper.js';

function initializeForms() {
  buildForms(window.hbspt);

  const loadingContainers = document.querySelectorAll('.loading-container');
  loadingContainers.forEach((container) => {
    const formContainer = container.closest('.hubspot-form');
    if (formContainer) {
      container.classList.add('fade-out');

      // Set up a mutation observer to detect when the form is added to the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.some((mutation) => {
          if (mutation.type === 'childList') {
            return Array.from(mutation.addedNodes).some((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'FORM') {
                // Form has been added, fade it in
                requestAnimationFrame(() => {
                  container.style.display = 'none';
                  node.classList.add('fade-in');
                });
                observer.disconnect();
                return true;
              }
              return false;
            });
          }
          return false;
        });
      });

      observer.observe(formContainer, { childList: true, subtree: true });

      // Set a timeout to hide the loading container if the form doesn't load
      setTimeout(() => {
        if (container.style.display !== 'none') {
          container.style.display = 'none';
        }
        observer.disconnect();
      }, 10000);
    }
  });
}

export default function loadHubSpot() {
  if (!hasForms()) return;

  const hsScriptEl = document.createElement('script');
  hsScriptEl.type = 'text/javascript';
  hsScriptEl.async = true;
  hsScriptEl.setAttribute('id', 'hs-script-loader');
  hsScriptEl.src = 'https://js.hsforms.net/forms/embed/v2.js';
  document.querySelector('head').append(hsScriptEl);

  hsScriptEl.addEventListener('load', () => {
    // Wait for HubSpot's hbspt object to be available
    const checkHubSpotReady = setInterval(() => {
      if (window.hbspt) {
        clearInterval(checkHubSpotReady);
        initializeForms();
      }
    }, 100);

    // Set a timeout to prevent infinite checking
    setTimeout(() => {
      clearInterval(checkHubSpotReady);
    }, 10000);
  });
}
