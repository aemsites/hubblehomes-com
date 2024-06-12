import { br, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const links = block.querySelectorAll('a');
  block.innerHTML = '';
  const linksDiv = div('Links:', br());
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    linksDiv.appendChild(link);
    linksDiv.appendChild(br());
  });
  block.appendChild(linksDiv);
}
