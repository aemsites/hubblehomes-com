function getCurrencyFormatter() {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        narrowSymbol: true,
        minimumFractionDigits: 0
    });
}

/**
 * Format a price as a currency
 * @param price the price to format
 * @returns {*}
 */
export function formatPrice(price) {
    return getCurrencyFormatter().format(price);
}
