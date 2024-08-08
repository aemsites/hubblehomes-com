import { buildForms, hasForms } from './forms-helper.js';

const FORM_LOAD_TIMEOUT = 20000;

function initializeForms() {
  buildForms(window.hbspt);

  const loadingContainers = document.querySelectorAll('.loading-container');
  loadingContainers.forEach((container) => {
    const formContainer = container.closest('.hubspot-form');
    if (formContainer) {
      container.classList.add('fade-out');

      let formLoaded = false;
      let timeoutOccurred = false;

      // Set up a mutation observer to detect when the form is added to the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.some((mutation) => {
          if (mutation.type === 'childList') {
            return Array.from(mutation.addedNodes).some((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'FORM') {
                formLoaded = true;
                if (!timeoutOccurred) {
                  // Form has been added, fade it in
                  requestAnimationFrame(() => {
                    container.style.display = 'none';
                    node.classList.add('fade-in');
                  });
                  observer.disconnect();
                }
                return true;
              }
              return false;
            });
          }
          return false;
        });
      });

      observer.observe(formContainer, { childList: true, subtree: true });

      // Set a timeout to handle the case when the form doesn't load
      setTimeout(() => {
        if (!formLoaded) {
          timeoutOccurred = true;
          observer.disconnect();
          container.style.display = 'none';
          const errorMessage = document.createElement('div');
          errorMessage.className = 'form-load-error';
          errorMessage.textContent = 'There was a problem loading the form. Please try refreshing the page.';
          formContainer.appendChild(errorMessage);
        }
      }, FORM_LOAD_TIMEOUT);
    }
  });
}

export default function loadHubSpot() {
  if (!hasForms()) return;

  const hsScriptEl = document.createElement('script');
  hsScriptEl.type = 'text/javascript';
  hsScriptEl.async = true;
  hsScriptEl.defer = true;
  hsScriptEl.setAttribute('id', 'hs-script-loader');
  hsScriptEl.src = 'https://js.hsforms.net/forms/embed/v2.js';
  document.querySelector('head').append(hsScriptEl);

  hsScriptEl.addEventListener('load', () => {
    const checkHubSpotReady = () => {
      console.log('Checking HubSpot ready');
      if (window.hbspt) {
        initializeForms();
      } else {
        setTimeout(checkHubSpotReady, 200);
      }
    };
    checkHubSpotReady();
  });
}
