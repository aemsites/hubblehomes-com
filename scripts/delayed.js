/* eslint-disable object-curly-newline */
import {
  sampleRUM,
} from './aem.js';
import loadHubSpot from './hubspot-helper.js';

async function loadDelayed() {
  sampleRUM('cwv');
  loadHubSpot();
}

loadDelayed();
