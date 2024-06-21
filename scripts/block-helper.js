import { buildBlock, decorateBlock } from './aem.js';
import { div } from './dom-helpers.js';
import { loadTemplateBlock } from './template-block.js';

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
  await loadTemplateBlock(block);
  return blockWrapper;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  createTemplateBlock,
};
