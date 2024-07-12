import { buildBlock, decorateBlock, loadBlock } from './aem.js';
import { div } from './dom-helpers.js';

/**
 * Creates a template block with the given block name and data.
 *
 * @param {string} blockName - The name of the block to create.
 * @param {Array} blockData - The data to be used in the block.
 * @returns {Promise<Element>} - The template block wrapped in a div.
 */
async function createTemplateBlock(blockName, blockData) {
  const block = buildBlock(blockName, blockData);
  const blockWrapper = div(block);
  decorateBlock(block);
  await loadBlock(block, true);
  return blockWrapper;
}

/**
 * Safely appends elements to the parent element. If the element is null or undefined,
 * it is not appended.
 * @param parent the parent element
 * @param elements the elements to append
 */
function safeAppend(parent, ...elements) {
  elements
    .filter((element) => element !== null && element !== undefined)
    .forEach((element) => parent.append(element));
}

export {
  // eslint-disable-next-line import/prefer-default-export
  createTemplateBlock,
  safeAppend,
};
