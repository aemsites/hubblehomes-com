import { getInventorySheet } from '../../scripts/workbook.js';
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { div, button } from '../../scripts/dom-helpers.js';
import { loadRates } from '../../scripts/mortgage.js';

let startIndex = 0;
let endIndex = 0;
const limit = 8;

async function displayCards(inventoryHomes, fragment) {
  let observer; 
  let cards;
  observer = new IntersectionObserver((entries) => {    
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {             
        endIndex += limit;                 
        window.hh.current.inventory = inventoryHomes.slice(startIndex, endIndex);
         //window.hh.current.inventory = inventoryHomes
        const modelsBlock = buildBlock('cards', []);
        modelsBlock.classList.add('inventory');
        const blockWrapper = div(modelsBlock);
        decorateBlock(modelsBlock);
        await loadBlock(modelsBlock, true);
        cards = div({ class: 'section featured' }, blockWrapper);
        fragment.insertAdjacentElement('beforebegin', cards);
        startIndex = endIndex;  
      }
    });    
  });  
  observer.observe(fragment);  
}

export default async function decorate(doc) {
  await loadRates();
  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');
  const inventoryHomes = await getInventorySheet('data');
  const filteredInventory = inventoryHomes.filter((home) => home.status === 'Under Construction');
  const inventorySize = filteredInventory.length;
  await displayCards(inventoryHomes, fragment);   
}

