import { div } from './dom-helpers.js';

/**
 * Load an SVG from a URL and return it as an element.
 * @param url The URL of the SVG to load.
 * @param className The class name to add to the SVG element.
 * @returns {Promise<Element>} The SVG element.
 */
export default async function loadSVG(url, className = '') {
  const response = await fetch(url);
  const svgText = await response.text();
  const tempDiv = div();
  tempDiv.innerHTML = svgText.trim();

  const svgElement = tempDiv.firstElementChild;
  svgElement.classList.add('icon');
  if (className) {
    className.split(' ').forEach((name) => {
      if (name) svgElement.classList.add(name);
    });
  }
  return svgElement;
}
