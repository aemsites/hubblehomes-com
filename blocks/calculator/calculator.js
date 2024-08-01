import { getRatesSheet } from '../../scripts/workbook.js';
import { formatPrice } from '../../scripts/currency-formatter.js';

function calculatePayment() {
  const resultContainer = document.getElementById('result');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = '';
  const fields = ['purchase_price', 'interest_rate', 'down_payment', 'number_of_years'];
  const values = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const field of fields) {
    const element = document.getElementById(field);
    values[field] = element.value;
    if (!values[field]) {
      element.reportValidity();
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(values[field])) {
      element.setCustomValidity('Please enter a valid number');
      element.reportValidity();
      return;
    }
    if (field === 'interest_rate' && (values[field] < 0 || values[field] > 100)) {
      element.setCustomValidity('Interest rate must be between 0 and 100');
      element.reportValidity();
      return;
    }
    if (field === 'number_of_years' && (values[field] < 0 || values[field] > 100)) {
      element.setCustomValidity('Number of years must be between 0 and 100');
      element.reportValidity();
      return;
    }
  }
  const monthlyInterestRate = values.interest_rate / 100 / 12;
  const loanTermMonths = values.number_of_years * 12;
  const loanAmount = values.purchase_price - values.down_payment;
  if (loanAmount <= 0) {
    document.getElementById('down_payment').setCustomValidity('Down payment must be less than purchase price');
    document.getElementById('down_payment').reportValidity();
    return;
  }
  // Calculate the monthly payment using the loan amortization formula
  const monthlyPayment = loanAmount * ((monthlyInterestRate
    * (1 + monthlyInterestRate) ** loanTermMonths)
  / ((1 + monthlyInterestRate) ** loanTermMonths - 1));
  Math.round(monthlyPayment.toFixed(2));
  resultContainer.innerHTML = `<p>Estimated Monthly Payment = ${formatPrice(monthlyPayment, 'full')}</p>`;
}

export default async function decorate(block) {
  const ratesData = await getRatesSheet('data');
  const rates = ratesData[0];
  const fields = [
    {
      id: 'purchase_price',
      label: 'Purchase Price',
      type: 'text',
      legend: 'Purchase Price',
    },
    {
      id: 'interest_rate',
      label: 'Interest Rate',
      type: 'text',
      value: rates.rate,
    },
    {
      id: 'down_payment',
      label: 'Down Payment Amount',
      type: 'text',
      legend: 'Down Payment Amount',
    },
    {
      id: 'number_of_years',
      label: 'Number of Years',
      type: 'text',
      value: rates.term,
    },
  ];

  const heading = '<h2> Mortgage Calculator </h2> <small>Please enter all amounts in whole dollars.</small>';
  block.innerHTML = heading;

  const containerDiv = document.createElement('div');
  containerDiv.classList.add('container');
  block.appendChild(containerDiv);

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');
  containerDiv.appendChild(formContainer);

  fields.forEach((field) => {
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');
    formContainer.appendChild(formGroup);

    const label = document.createElement('label');
    label.setAttribute('for', field.id);
    label.textContent = field.label;
    formGroup.appendChild(label);

    const textbox = document.createElement('input');
    textbox.setAttribute('type', field.type);
    textbox.setAttribute('id', field.id);

    if (field.value) textbox.setAttribute('value', field.value);
    else textbox.setAttribute('name', field.label);

    textbox.classList.add('form-control');
    if (field.label) textbox.setAttribute('placeholder', field.label);
    textbox.addEventListener('keyup', (e) => {
      e.target.value = e.target.value.replace(/[^0-9 .?]/g, '');
    });
    textbox.required = true;
    formGroup.appendChild(textbox);
  });

  const calculateButton = document.createElement('button');
  calculateButton.textContent = 'Calculate Payment';
  calculateButton.addEventListener('click', calculatePayment);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.appendChild(calculateButton);
  formContainer.append(buttonContainer);

  const resultContainer = document.createElement('div');
  resultContainer.setAttribute('id', 'result');
  resultContainer.classList.add('result-container');
  formContainer.appendChild(resultContainer);
}
