/* eslint-disable object-curly-newline */
import {
  sampleRUM,
} from './aem.js';
import loadLiveChat from './live-chat-helper.js';
import loadHubSpot from './hubspot-helper.js';

async function loadDelayed() {
  sampleRUM('cwv');
  loadLiveChat();
  loadHubSpot();
}

loadDelayed();
