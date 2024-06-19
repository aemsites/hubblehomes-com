import { getRatesSheet } from './workbook.js';

/**
 * Load the mortgage rates from the server and stores them in session storage.
 *
 * @throws {Error} If the fetch request fails.
 */
async function loadRates() {
  // Check if the rates are already in session storage
  if (
    sessionStorage.getItem('hh.rates.rate') !== null
    && sessionStorage.getItem('hh.rates.percent') !== null
    && sessionStorage.getItem('hh.rates.term') !== null
  ) {
    return;
  }

  // Fetch rates from the server
  const rates = await getRatesSheet('data');
  const { rate, percent, term } = rates[0];

  // Store the fetched rates in session storage
  sessionStorage.setItem('hh.rates.rate', rate);
  sessionStorage.setItem('hh.rates.percent', percent);
  sessionStorage.setItem('hh.rates.term', term);
}

/**
 * Calculates the monthly payment for a house given its price.
 *
 * @param {number} housePrice - The price of the house.
 * @returns {number} The monthly payment amount.
 */
function calculateMonthlyPayment(housePrice) {
  const rate = parseFloat(sessionStorage.getItem('hh.rates.rate'));
  const percent = parseFloat(sessionStorage.getItem('hh.rates.percent'));
  const term = parseInt(sessionStorage.getItem('hh.rates.term'), 10);

  const loanAmount = housePrice * (1 - percent);
  const monthlyInterestRate = rate / 100 / 12;
  const loanTermMonths = term * 12;

  // Calculate the monthly payment using the loan amortization formula
  const monthlyPayment = loanAmount
    * ((monthlyInterestRate * (1 + monthlyInterestRate) ** loanTermMonths)
    / ((1 + monthlyInterestRate) ** loanTermMonths - 1));

  return Math.round(monthlyPayment.toFixed(2));
}

export {
  calculateMonthlyPayment,
  loadRates,
};
