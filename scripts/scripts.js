import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata, loadBreadcrumbs,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

function clearTopBannerDismissedOnLoad() {
  if (performance.getEntriesByType('navigation')[0].type === 'reload') {
    sessionStorage.removeItem('topBannerDismissed');
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// eslint-disable-next-line no-unused-vars
function buildAutoBlocks(main) {
  try {
    // add auto block functions here
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

/**
 * Decorates the template.
 */
export async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`,
      )
        .then(resolve)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `failed to load css module for ${templateName}`,
            err.target.href,
          );
          resolve();
        });
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(
            `../templates/${templateName}/${templateName}.js`
          );
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });

    document.body.classList.add(`${templateName}-template`);

    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

function handleTopBanner(topBanner) {
  document.body.classList.add('has-top-banner');
  document.body.style.paddingTop = `${topBanner.offsetHeight}px`;

  const header = document.querySelector('header');
  if (header) {
    header.style.top = `${topBanner.offsetHeight}px`;
  }

  const closeButton = topBanner.querySelector('.top-banner-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      const header = document.querySelector('header');
      const bannerHeight = topBanner.offsetHeight;

      topBanner.classList.add('dismissed');
      document.body.classList.remove('has-top-banner');
      document.body.style.paddingTop = '0';
      if (header) {
        header.style.top = `${bannerHeight}px`; 
      }
      setTimeout(() => {
        topBanner.remove();
      }, 300); // 300ms matches the transition duration in CSS
      sessionStorage.setItem('topBannerDismissed', 'true');
    });
  }
}

function setupTopBannerObserver() {
  const header = document.querySelector('header');

  // watch for changes in the header
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const topBanner = document.querySelector('.top-banner');
        if (topBanner) {
          handleTopBanner(topBanner);
          observer.disconnect(); // Stop observing once we've handled the banner
        }
      }
    });
  });

  // observing the header for changes
  observer.observe(header, { childList: true, subtree: true });

  // listen for the custom event
  window.addEventListener('topbannerloaded', () => {
    const topBanner = document.querySelector('.top-banner');
    if (topBanner) {
      handleTopBanner(topBanner);
    }
  }, { once: true });
}

async function loadTopBanner(doc) {
  const topBannerFragment = await loadFragment('/fragments/top-banner');
  if (topBannerFragment) {
    const topBanner = topBannerFragment.querySelector('.top-banner');
    if (topBanner) {
      const header = doc.querySelector('header');
      header?.prepend(topBanner);

      // Dispatch a custom event when the banner is added
      window.dispatchEvent(new CustomEvent('topbannerloaded'));
    }
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  const templateName = getMetadata('template');
  decorateTemplateAndTheme(templateName);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    if (templateName) {
      await loadTemplate(doc, templateName);
    }
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadBreadcrumbs(document);
  loadFooter(doc.querySelector('footer'));
  loadTopBanner(doc);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

function setupGlobalVars() {
  window.hh = window.hh || {};
  window.hh.current = {};
}

const openSheet = ({ detail }) => {
  const { data } = detail;
  const routes = {
    '/new-homes/*/*/*/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=rgHBEC&nav=MTVfezAwMDAwMDAwLTAwMDEtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMH0',
    '/new-homes/*/*/*/*/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=bD7sfK&nav=MTVfezNGNTgzREJGLTEzNkYtNDU4RC1BQkM1LTBFRjhGMDNCMUY0OX0',
    '/new-homes/*/*/*/*/*/*/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=LGaAfv&nav=MTVfezg2ODI3Q0EwLThEOTQtNEQxQS04Rjg2LUQ4NEJCMTU0OEU1RX0',
    '/home-plans/plan-detail/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=H18GCg&nav=MTVfezVCMEU1NzA5LUE2MTAtNDY1RS1BMDhGLUIxQjU1MEFDRDEwOH0',
    home: 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=rgHBEC&nav=MTVfezAwMDAwMDAwLTAwMDEtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMH0',
  };

  const pathToMatch = data.location.pathname;

  function matchPath(path) {
    const pathSegments = path.split('/');
    const matchedRoute = Object.keys(routes).find((route) => {
      const routeSegments = route.split('/');
      if (routeSegments.length === pathSegments.length) {
        let match = true;
        for (let i = 0; i < routeSegments.length; i += 1) {
          if (routeSegments[i] !== '*' && routeSegments[i] !== pathSegments[i]) {
            match = false;
            break;
          }
        }
        return match;
      }
      return false;
    });
    return matchedRoute ? routes[matchedRoute] : routes.home;
  }

  const matchedRoute = matchPath(pathToMatch);
  window.open(matchedRoute, '_blank');
};

const sk = document.querySelector('helix-sidekick');
if (sk) {
  // sidekick already loaded
  sk.addEventListener('custom:openSheet', openSheet);
} else {
  // wait for sidekick to be loaded
  document.addEventListener('sidekick-ready', () => {
    document.querySelector('helix-sidekick')
      .addEventListener('custom:openSheet', openSheet);
  }, { once: true });
}

async function loadPage() {
  setupTopBannerObserver();
  clearTopBannerDismissedOnLoad();
  setupGlobalVars();
  await loadEager(document);

  await loadLazy(document);
  loadDelayed();
}

loadPage();
