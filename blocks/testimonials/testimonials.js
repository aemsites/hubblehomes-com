import {
  div,
  blockquote,
  p,
  cite,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const testimonials = block.querySelectorAll(':scope > div');

  block.innerHTML = '';
  testimonials.forEach((testimonial) => {
    const [quoteDiv, authorDiv] = testimonial.children;
    const quoteText = quoteDiv.textContent.trim();
    const [name, year] = authorDiv.textContent.split('|').map((s) => s.trim());

    const quoteElement = div(
      { class: 'testimonial-item' },
      blockquote(
        p(quoteText),
        cite(`${name} | ${year}`),
      ),
    );
    block.appendChild(quoteElement);
  });
}
