import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const links = block.querySelectorAll('a');
  block.innerHTML = '';
  const linksDiv = div('Links:');
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    linksDiv.appendChild(link);
  });
  block.appendChild(linksDiv);
}
