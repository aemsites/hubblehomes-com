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
      console.error('HubSpot form failed to initialize within the expected time.');
    }, 10000); // 10 seconds timeout
  });
}

function initializeForms() {
  buildForms(window.hbspt);
  
  const loadingContainers = document.querySelectorAll('.loading-container');
  loadingContainers.forEach(container => {
    const formContainer = container.closest('.hubspot-form');
    if (formContainer) {
      // Start fading out the loading container
      container.classList.add('fade-out');
      
      // Set up a mutation observer to detect when the form is added to the DOM
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const addedNodes = mutation.addedNodes;
            for (const node of addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'FORM') {
                // Form has been added, fade it in
                requestAnimationFrame(() => {
                  container.style.display = 'none';
                  node.classList.add('fade-in');
                });
                observer.disconnect();
                return;
              }
            }
          }
        }
      });

      observer.observe(formContainer, { childList: true, subtree: true });

      // Set a timeout to hide the loading container if the form doesn't load
      setTimeout(() => {
        if (container.style.display !== 'none') {
          container.style.display = 'none';
          console.error('HubSpot form did not load within the expected time.');
        }
        observer.disconnect();
      }, 10000); // 10 seconds timeout
    }
  });
}