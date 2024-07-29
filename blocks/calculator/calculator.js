import {getRatesSheet, } from './../../scripts/workbook.js';
import {formatPrice } from './../../scripts/currency-formatter.js';

function calculatePayment() {
  const housePrice = document.getElementById('purchase_price').value;
  const rate = document.getElementById('interest_rate').value;
  const down_payment = document.getElementById('down_payment').value;
  const term = document.getElementById('number_of_years').value;
  const monthlyInterestRate = rate / 100 / 12;
  const loanTermMonths = term * 12;

  // Calculate the monthly payment using the loan amortization formula
  const monthlyPayment = loanAmount
    * ((monthlyInterestRate * (1 + monthlyInterestRate) ** loanTermMonths)
    / ((1 + monthlyInterestRate) ** loanTermMonths - 1));

  Math.round(monthlyPayment.toFixed(2));

  const resultContainer = document.getElementById('result');
  resultContainer.style.display = 'block';
  resultContainer.innerText = `Estimated Monthly Payment = ${formatPrice(monthlyPayment, 'full')}`;
}

export default async function decorate(block) {
  const ratesData = await getRatesSheet(null);
  const rates = ratesData.data[0]; 
  const fields = [
    {
      id: 'purchase_price', label: 'Purchase Price', type: 'text', legend: 'Purchase Price',
    },
    {
      id: 'interest_rate', label: 'Interest Rate', type: 'text', value: rates.rate,
    },
    {
      id: 'down_payment', label: 'Down Payment Amount', type: 'text', legend: 'Down Payment Amount',
    },
    {
      id: 'number_of_years', label: 'Number of Years', type: 'text', value: rates.term,
    },
  ];
  const heading = `<h2> Mortgage Calculator </h2> <small>Please enter all amounts in whole dollars.</small>`;
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
  resultContainer.style.display = 'none';
  formContainer.appendChild(resultContainer);
}
