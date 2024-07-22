function getCurrencyFormatter() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    narrowSymbol: true,
    minimumFractionDigits: 0,
  });
}

/**
 * Format a price as a currency.
 * @param price the price to format as a currency
 * @param formatType the type of formatting to apply (full, rounded)
 * @returns {*}
 */
// eslint-disable-next-line import/prefer-default-export
export function formatPrice(price, formatType = 'full') {
  if (formatType === 'rounded') {
    if (price >= 1000) {
      return `${Math.round(price / 1000)}k`;
    }
    return `${Math.round(price)}`;
  }

  return getCurrencyFormatter().format(price);
}
