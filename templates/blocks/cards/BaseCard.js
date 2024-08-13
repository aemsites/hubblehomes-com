import {
  a, div, h3, span,
} from '../../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../../scripts/aem.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';
import { getModelImage } from '../../../scripts/models.js';

class BaseCard {
  constructor(data, community) {
    this.cardData = data;
    this.community = community;
  }

  async render() {
    const header = this.renderHeaderArea();
    const imageBox = await this.renderModelImage();
    const topActionsBar = this.renderTopActionBar();
    imageBox.appendChild(topActionsBar);

    const taglineContainer = this.renderTaglineContainer();
    const details = await this.renderGridDetails();
    const bottomContainer = this.renderDetailsContainer();
    const incentives = this.renderIncentives();

    return div(
      header,
      imageBox,
      taglineContainer,
      details,
      bottomContainer,
      incentives,
    );
  }

  /**
   * The header areas consist of the title and optional address if provided.
   * @returns {Element}
   */
  renderHeaderArea() {
    return div(this.renderTitle(), this.renderAddress());
  }

  /**
   * Render the title of the model.
   * @returns {Element}
   */
  renderTitle() {
    return h3(this.cardData['model name'] || '');
  }

  /**
   * Render the address of the model.  Sub-cards must override this if they
   * want to display an address.
   */
  // eslint-disable-next-line class-methods-use-this
  renderAddress() {
    return undefined;
  }

  /**
   * Render the model image.
   * @returns {Element}
   */
  async renderModelImage() {
    const url = await getModelImage(this.cardData['model name']);
    const image = this.createModelImage(url, this.cardData['model name']);
    const imageLink = a({ href: this.cardData.path }, image);
    const imagePicture = div(imageLink);
    return div({ class: 'model-card-image-container' }, imagePicture);
  }

  /**
   * Render the actions that get displayed on top of the model image.
   * By default, a share action, status text, and favorite action are displayed.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  renderTopActionBar() {
    return div(
      { class: 'model-card-action-bar' },
      this.renderLeftTopBarAction(),
      this.renderTopBarStatus(),
      this.renderRightTopBarAction(),
    );
  }

  /**
   * Render the left action button in the top bar, by default this is the share button.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  renderLeftTopBarAction() {
    return div();
  }

  /**
   * Render the marketing status as text by default.
   * @returns {Element}
   */
  renderTopBarStatus() {
    const clazz = this.cardData.status ? 'status' : '';
    return div({ class: clazz }, span(this.cardData.status));
  }

  /**
   * Render the right action button in the top bar, by default this is the favorite button.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  renderRightTopBarAction() {
    return div();
  }

  /**
   * Render the tagline container which resides between the image and grid data.
   * Subclasses can override this method to add additional tagline items by
   * implementing the renderTaglineItems method.
   * @returns {Element}
   */
  renderTaglineContainer() {
    const container = div({ class: 'card-tagline' });
    this.renderTaglineItems(container);
    return container;
  }

  /**
   * Render the tagline items inside the container provided.
   * @param taglineContainer allows children to be added into the tagline container.
   */
  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  renderTaglineItems(taglineContainer) {
    return undefined;
  }

  /**
   * Render the details for beds, baths, sqft, and cars.
   * @returns {Element}
   */
  renderGridDetails() {
    return div(
      { class: 'card-grid-details repeating-grid' },
      div('Beds'),
      div('Baths'),
      div('SQ FT'),
      div('Cars'),
      div(this.cardData.beds),
      div(this.cardData.baths),
      div(this.cardData['square feet']),
      div(this.cardData.cars),
    );
  }

  /**
   * Render the bottom container of the model card. By default, the bottom container
   * contains 4 sections: top row, middle row, bottom row, and button actions.
   * Each area can be overridden by the extending class if needed.
   */
  renderDetailsContainer() {
    const bottomContainer = div({ class: 'card-bottom-details' });
    const gridContainer = div({ class: 'repeating-grid' });

    // render the 3 rows of the details container
    this.renderTopRowOfDetailsContainer(gridContainer);
    this.renderBottomRowOfDetailsContainer(gridContainer);

    bottomContainer.appendChild(gridContainer);
    return bottomContainer;
  }

  /**
   * Render the top row of the model card. By default, the top row contains the top left
   * and top right sections. Each section can be overridden by the extending class if needed.
   * @param gridContainer
   */
  renderTopRowOfDetailsContainer(gridContainer) {
    this.renderTopRowOfDetailsContainer_left(gridContainer);
    this.renderTopRowOfDetailsContainer_right(gridContainer);
  }

  /**
   * Render the top left section of the detail's container.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderTopRowOfDetailsContainer_left(gridContainer) {
    const link = a({
      class: 'btn light-blue square',
      href: this.cardData.path,
    }, 'Get Info');

    gridContainer.appendChild(link);
  }

  /**
   * Render the top right section of the detail's container.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderTopRowOfDetailsContainer_right(gridContainer) {
    const link = a({
      class: 'btn light-gray square',
      href: `${this.cardData.path}#gallery`,
    }, 'Photos');
    const middleLeft = div(link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * Render the middle row of the details container, which contains the middle left and middle
   * right sections.
   * @param gridContainer
   */
  renderBottomRowOfDetailsContainer(gridContainer) {
    this.renderMiddleRowOfDetailsContainer_left(gridContainer);
    this.renderMiddleRowOfDetailsContainer_right(gridContainer);
  }

  /**
   * Render the bottom left section of the detail's container.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderMiddleRowOfDetailsContainer_left(gridContainer) {
    const { phone } = this.cardData.salesCenter;
    const link = a({ class: 'btn yellow square', href: `tel:${phone}` }, formatPhoneNumber(phone));
    gridContainer.appendChild(link);
  }

  /**
   * Render the bottom right section of the detail's container.
   * @param gridContainer
   */
  renderMiddleRowOfDetailsContainer_right(gridContainer) {
    const link = a({
      target: '_blank',
      class: 'btn dark-gray square',
      href: `https://www.google.com/maps/dir/Current+Location/${this.cardData.latitude},${this.cardData.longitude}`,
    }, 'Directions');

    const middleLeft = div(link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * The incentives area is optional and can be overridden by the extending class.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  renderIncentives() {
    return undefined;
  }

  /**
   * Generate a Picture element that has contains the model's image.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  createModelImage(url, title) {
    if (!url) {
      return undefined;
    }

    const imageUrl = new URL(url);
    return createOptimizedPicture(imageUrl.pathname, title, true, [
      { media: '(max-width: 767px)', width: '767' },
      { media: '(max-width: 991px)', width: '400' }]);
  }
}

export default BaseCard;
