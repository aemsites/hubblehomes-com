/* eslint-disable object-curly-newline, no-undef */
/* eslint-disable no-promise-executor-return */
import {
  sampleRUM,
} from './aem.js';
import loadHubSpot from './hubspot-helper.js';
import initMap from '../templates/map-view/delayed-map.js';

async function loadDelayed() {
  sampleRUM('cwv');
  loadHubSpot();

  if (window.location.pathname === '/available/quick-move-ins') {
    initMap();
  }
}

loadDelayed();
