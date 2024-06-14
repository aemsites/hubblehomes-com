import { buildBlock, decorateBlock } from './aem.js';
import { div } from './dom-helpers.js';
import { loadTemplateBlock } from './template-block.js';

/**
 * Creates an action bar with the given actions.  The actions should be a comma separated list of
 * action names.  The names of the actions can be found in actionbar.js's Action object.
 * @param {string[]} actions - The actions to include in the action bar.
 * @returns {Promise<Element>} The action bar wrapped in a div.
 */
async function createActionBar(actions) {
  const actionBarBlock = buildBlock('actionbar', actions.join(', '));
  const blockWrapper = div(actionBarBlock);
  decorateBlock(actionBarBlock);
  await loadTemplateBlock(actionBarBlock);
  return blockWrapper;
}

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
  createActionBar,
  createTemplateBlock,
};
