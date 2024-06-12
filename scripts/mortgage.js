export async function fetchRates() {
  // check to see if we have the rates in session storage
  if (
    sessionStorage.getItem('hh.rates.rate') != null
    && sessionStorage.getItem('hh.rates.percent') != null
    && sessionStorage.getItem('hh.rates.term') != null) {
    return;
  }

  const rates = await fetch('/data/hubblehomes.json?sheet=rates');

  if (rates.ok) {
    const jsonObject = await rates.json();
    const { rate } = jsonObject.data[0];
    const { percent } = jsonObject.data[0];
    const { term } = jsonObject.data[0];
    sessionStorage.setItem('hh.rates.rate', rate);
    sessionStorage.setItem('hh.rates.percent', percent);
    sessionStorage.setItem('hh.rates.term', term);
  } else {
    throw new Error('Failed to fetch rates');
  }
}

// eslint-disable-next-line max-len
export default function calculateMonthlyPayment(housePrice) {
  const rate = parseFloat(sessionStorage.getItem('hh.rates.rate'));
  const percent = parseFloat(sessionStorage.getItem('hh.rates.percent'));
  const term = parseInt(sessionStorage.getItem('hh.rates.term'), 10);

  const loanAmount = housePrice * (1 - percent);
  const monthlyInterestRate = rate / 100 / 12;
  const loanTermMonths = term * 12;
  const monthlyPayment = loanAmount
    * ((monthlyInterestRate * (1 + monthlyInterestRate) ** loanTermMonths)
    / ((1 + monthlyInterestRate) ** loanTermMonths - 1));

  return Math.round(monthlyPayment.toFixed(2));
}
