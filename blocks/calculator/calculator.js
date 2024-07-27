function calculateComplexity() {
  const sizeWeight = 0.5;
  const complexityWeight = 1;
  const importComplexityWeight = 1;
  const trafficWeight = 3;
  const integrationWeight = 0.5;
  const customerWeight = 0.5;
  const urgencyWeight = 0.5;
  const teamWeight = 0.5;

  const size = parseInt(document.getElementById('size').value, 10);
  const complexity = parseInt(document.getElementById('complexity').value, 10);
  const importComplexity = parseInt(document.getElementById('import').value, 10);
  const traffic = parseInt(document.getElementById('traffic').value, 10);
  const integration = parseInt(document.getElementById('integration').value, 10);
  const customer = parseInt(document.getElementById('customer').value, 10);
  const urgency = parseInt(document.getElementById('urgency').value, 10);
  const team = parseInt(document.getElementById('team').value, 10);

  const total = size * sizeWeight
                  + complexity * complexityWeight
                  + importComplexity * importComplexityWeight
                  + traffic * trafficWeight
                  + integration * integrationWeight
                  + customer * customerWeight
                  + urgency * urgencyWeight
                  + team * teamWeight;

  let result;

  if (total <= 5) {
    result = 'XS';
  } else if (total <= 10) {
    result = 'S';
  } else if (total <= 20) {
    result = 'M';
  } else if (total <= 30) {
    result = 'L';
  } else {
    result = 'XL';
  }

  document.getElementById('result-bubble').innerText = `${result} (${total / 8})`;
}

function clearFields() {
  document.querySelectorAll('select').forEach((select) => {
    select.selectedIndex = 0;
  });

  document.getElementById('result-bubble').innerText = 'Power Score';
}

export default function decorate(block) {
  const fields = [
    {
      id: 'size', label: 'Size in pages:', options: ['XS (< 100)', 'S (< 500)', 'M (< 5000)', 'L (< 50,000)', 'XL (> 50,000)'], legend: 'The size of the project in terms of the number of pages.',
    },
    {
      id: 'complexity', label: 'Code Complexity:', options: ['XS (< 5)', 'S (< 10)', 'M (< 30)', 'L (< 100)', 'XL (> 100)'], legend: 'Blocks per page + authoring complexity + total blocks + block code',
    },
    {
      id: 'import', label: 'Import Complexity:', options: ['XS', 'S', 'M', 'L', 'XL'], legend: 'consistency of design/layout + content structures + historical content',
    },
    {
      id: 'traffic', label: 'Traffic / Business Impact:', options: ['XS (> 5M)', 'S (5M)', 'M (1M)', 'L (100,000)', 'XL (< 100,000)'], legend: 'The level of traffic or business impact (Treo.sh)',
    },
    {
      id: 'integration', label: 'Integration Complexity:', options: ['XS', 'S', 'M', 'L', 'XL'], legend: 'The complexity of integrating with other systems or services',
    },
    {
      id: 'customer', label: 'Customer Complexity:', options: ['XS', 'S', 'M', 'L', 'XL'], legend: 'The complexity of dealing with the customer or end-user.',
    },
    {
      id: 'urgency', label: 'Customer Urgency:', options: ['XS', 'S', 'M', 'L', 'XL'], legend: 'The urgency or priority for Go-Live.',
    },
    {
      id: 'team', label: 'Team Complexity:', options: ['XS', 'S', 'M', 'L', 'XL'], legend: 'The complexity of development team (Partner-Involvement/Skills/Mentorship)',
    },
  ];

  const containerDiv = document.createElement('div');
  containerDiv.classList.add('container');
  block.appendChild(containerDiv);

  const resultBubble = document.createElement('div');
  resultBubble.setAttribute('id', 'result-bubble');
  resultBubble.textContent = 'Power Score';
  containerDiv.appendChild(resultBubble);

  const calculateButton = document.createElement('button');
  calculateButton.textContent = 'Calculate';
  calculateButton.addEventListener('click', calculateComplexity);

  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.addEventListener('click', clearFields);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.append(calculateButton, clearButton);
  containerDiv.appendChild(buttonContainer);

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');
  containerDiv.appendChild(formContainer);

  const calculatorDiv = document.createElement('div');
  calculatorDiv.classList.add('calculator');
  formContainer.appendChild(calculatorDiv);

  fields.forEach((field) => {
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');
    calculatorDiv.appendChild(formGroup);

    const labelContainer = document.createElement('div');
    labelContainer.classList.add('label-container');
    formGroup.appendChild(labelContainer);

    const label = document.createElement('label');
    label.setAttribute('for', field.id);
    label.textContent = field.label;
    labelContainer.appendChild(label);

    const legendIcon = document.createElement('span');
    legendIcon.classList.add('legend-icon');
    legendIcon.innerHTML = '&#9432;';
    labelContainer.appendChild(legendIcon);

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = field.legend;
    legendIcon.appendChild(tooltip);

    const select = document.createElement('select');
    select.setAttribute('id', field.id);
    formGroup.appendChild(select);

    field.options.forEach((option, index) => {
      const optionElement = document.createElement('option');
      optionElement.setAttribute('value', index);
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
  });

  const scoreContainer = document.createElement('div');
  scoreContainer.classList.add('score-container');
  containerDiv.appendChild(scoreContainer);
}
