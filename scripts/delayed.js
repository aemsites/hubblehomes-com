/* eslint-disable object-curly-newline */
import { loadScript, sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
loadScript('/scripts/gtm-init.js', { defer: true });
loadScript('/scripts/live-chat.js', { defer: true });
