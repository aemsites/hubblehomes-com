import {
  div,
  blockquote,
  p,
  cite,
} from '../../scripts/dom-helpers.js';

function parseTestimonial(text) {
  const lastDashIndex = text.lastIndexOf(' - ');
  if (lastDashIndex === -1) {
    return { quoteText: text.trim(), name: '', year: '' };
  }

  const quoteText = text.substring(0, lastDashIndex).trim();
  const authorPart = text.substring(lastDashIndex + 3).trim();

  const [name, year] = authorPart.split('|').map((s) => s.trim());

  return { quoteText, name, year };
}

export default function decorate(block) {
  const quotes = block.querySelectorAll('div > div');
  const quotesList = div({ class: 'testimonials-grid' });
  const uniqueQuotes = new Set();

  quotes.forEach((quote) => {
    const { quoteText, name, year } = parseTestimonial(quote.textContent);

    // Create a unique key for each quote
    const quoteKey = `${quoteText}|${name}|${year}`;

    // Only add the quote if it's not already in the set
    if (!uniqueQuotes.has(quoteKey)) {
      uniqueQuotes.add(quoteKey);

      const quoteElement = div(
        { class: 'testimonial-item' },
        blockquote(
          p(quoteText),
          cite(name && year ? `${name} | ${year}` : name || year),
        ),
      );

      quotesList.appendChild(quoteElement);
    }
  });

  block.innerHTML = '';
  block.appendChild(quotesList);
}
