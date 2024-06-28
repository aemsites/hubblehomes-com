import { loadTemplate } from '../../scripts/scripts.js';

export default async function decorate(doc) {
  await loadTemplate(doc, 'default');
}
