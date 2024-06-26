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
  getMetadata,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
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
 * Decorates the template.
 */
async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`).then((resolve)).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`failed to load css module for ${templateName}`, err.target.href);
        resolve();
      });
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(`../templates/${templateName}/${templateName}.js`);
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
      if (getMetadata('secondary-template')) {
        await loadTemplate(doc, getMetadata('secondary-template'));
      }
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
  loadFooter(doc.querySelector('footer'));

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
    '/new-homes/*/*/*/*/*/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/_layouts/15/Doc.aspx?sourcedoc=%7B7175FB34-E91D-4F36-A74D-07E563906126%7D&file=hubblehomes.xlsx&nav=MTVfezg2ODI3Q0EwLThEOTQtNEQxQS04Rjg2LUQ4NEJCMTU0OEU1RX0&action=default&mobileredirect=true',
    '/home-plans/plan-details/*': 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/_layouts/15/Doc.aspx?sourcedoc=%7B7175FB34-E91D-4F36-A74D-07E563906126%7D&file=hubblehomes.xlsx&nav=MTVfezg2ODI3Q0EwLThEOTQtNEQxQS04Rjg2LUQ4NEJCMTU0OEU1RX0&action=default&mobileredirect=true',
    home: 'https://adobe.sharepoint.com/:x:/r/sites/HelixProjects/Shared%20Documents/sites/hubblehomes/data/hubblehomes.xlsx?d=w7175fb34e91d4f36a74d07e563906126&csf=1&web=1&e=rgHBEC&nav=MTVfezAwMDAwMDAwLTAwMDEtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMH0',
  };

  const pathToMatch = data.location.pathname;

  function matchPath(path) {
    const pathSegments = path.split('/');
    let matchedRoute = null;

    for (const route in routes) {
      const routeSegments = route.split('/');
      if (routeSegments.length === pathSegments.length) {
        let match = true;
        for (let i = 0; i < routeSegments.length; i += 1) {
          if (routeSegments[i] !== '*' && routeSegments[i] !== pathSegments[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          matchedRoute = route;
          break;
        }
      }
    }
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
  setupGlobalVars();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
