import { a, div, form, h3, img, label, span, } from '../../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../../scripts/aem.js';

class BaseCard {
  constructor(model) {
    this.model = model;
  }

  render() {
    const header = this.renderHeaderArea();
    const imageBox = this.renderModelImage();
    const topActionsBar = this.renderTopActionBar();
    imageBox.appendChild(topActionsBar);

    const taglineContainer = this.renderTaglineContainer();
    const details = this.renderGridDetails();
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
    return h3(this.model.title);
  }

  /**
   * Render the address of the model.  Sub-cards must override this if they
   * want to display an address.
   * @returns {undefined}
   */
  // eslint-disable-next-line class-methods-use-this
  renderAddress() {
    return undefined;
  }

  /**
   * Render the model image.
   * @returns {Element}
   */
  renderModelImage() {
    const imageLink = a({ href: this.model.href }, this.createModelImage(this.model));
    const imagePicture = div(imageLink);
    return div({ class: 'model-card-image-container' }, imagePicture);
  }

  /**
   * Render the actions that get displayed on top of the model image.
   * By default, a share action, status text, and favorite action are displayed.
   * @returns {Element}
   */
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
    const shareImage = img({
      alt: 'share',
      src: '/icons/share.png',
      class: 'share-icon',
      onmouseover: () => shareImage.setAttribute('src', '/icons/share_over.png'),
      onmouseout: () => shareImage.setAttribute('src', '/icons/share.png'),
    });

    const shareLink = a({
      href: '#',
    }, shareImage);

    return div({ class: 'share' }, shareLink);
  }

  /**
   * Render the marketing status as text by default.
   * @returns {Element}
   */
  renderTopBarStatus() {
    return div({ class: 'status' }, span(this.model.status));
  }

  /**
   * Render the right action button in the top bar, by default this is the favorite button.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  renderRightTopBarAction() {
    const favoriteLink = img({
      alt: 'favorite',
      src: '/icons/save.png',
      class: 'favorite-icon',
      onmouseover: () => favoriteLink.setAttribute('src', '/icons/save_over.png'),
      onmouseout: () => favoriteLink.setAttribute('src', '/icons/save.png'),
    });
    return div({ class: 'favorite' }, favoriteLink);
  }

  /**
   * Render the tagline container which resides between the image and grid data.
   * Subclasses can override this method to add additional tagline items by
   * implementing the renderTaglineItems method.
   * @returns {Element}
   */
  renderTaglineContainer() {
    const container = div({ class: 'model-card-tagline' });
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
   * Render the details of the model, including beds, baths, sqft, and cars.
   * @returns {Element}
   */
  renderGridDetails() {
    return div(
      { class: 'model-card-grid-details repeating-grid' },
      div('Beds'),
      div('Baths'),
      div('SQ FT'),
      div('Cars'),
      div(this.model.beds),
      div(this.model.baths),
      div(this.model.sqft),
      div(this.model.cars),
    );
  }

  /**
   * Render the bottom container of the model card. By default, the bottom container
   * contains 4 sections: top row, middle row, bottom row, and button actions.
   * Each area can be overridden by the extending class if needed.
   */
  renderDetailsContainer() {
    const bottomContainer = div({ class: 'model-card-bottom-details' });
    const gridContainer = div({ class: 'repeating-grid' });

    // render the 3 rows of the details container
    this.renderTopRowOfDetailsContainer(gridContainer);
    this.renderMiddleRowOfDetailsContainer(gridContainer);
    this.renderBottomRowOfDetailsContainer(gridContainer);

    // render the action buttons
    this.renderButtonActionsOfDetailsContainer(gridContainer);

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
  renderTopRowOfDetailsContainer_left(gridContainer) {
    const topLeft = div({ class: 'stories' }, `${this.model.story} Story`);
    gridContainer.appendChild(topLeft);
  }

  /**
   * Render the top right section of the detail's container.
   * @param gridContainer
   */
  renderTopRowOfDetailsContainer_right(gridContainer) {
    const topRight = a({
      class: 'interactive',
      href: this.model.href,
    }, 'Interactive Plan');

    gridContainer.appendChild(topRight);
  }

  /**
   * Render the middle row of the details container, which contains the middle left and middle
   * right sections.
   * @param gridContainer
   */
  renderMiddleRowOfDetailsContainer(gridContainer) {
    this.renderMiddleRowOfDetailsContainer_left(gridContainer);
    this.renderMiddleRowOfDetailsContainer_right(gridContainer);
  }

  /**
   * Render the bottom row of the detail's container, which contains the bottom left and bottom
   * right sections.
   * @param gridContainer
   */
  renderBottomRowOfDetailsContainer(gridContainer) {
    this.renderBottomRowOfDetailsContainer_left(gridContainer);
    this.renderBottomRowOfDetailsContainer_right(gridContainer);
  }

  /**
   * Render the bottom left section of the detail's container.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderBottomRowOfDetailsContainer_left(gridContainer) {
    const link = a({ href: 'tel:2086495529' }, '208-649-5529');
    const middleLeft = div({ class: 'phone-number' }, link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * Render the middle right section of the detail's container.
   * @param gridContainer
   */
  renderMiddleRowOfDetailsContainer_right(gridContainer) {
    const link = a({ href: this.model.href }, 'Request a Tour');
    const middleLeft = div({ class: 'black-button' }, link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * Render the middle left section of the detail's container.
   * @param gridContainer
   */
  renderMiddleRowOfDetailsContainer_left(gridContainer) {
    const link = a({ href: this.model.href }, 'Choose Your Lot');
    const middleLeft = div({ class: 'grey-button' }, link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * Render the bottom right section of the detail's container.
   * @param gridContainer
   */
  renderBottomRowOfDetailsContainer_right(gridContainer) {
    const link1 = a({
      class: 'btn-primary2 btn-small',
      href: this.model.href,
    }, 'Get Info');
    const link2 = a({
      class: 'btn-primary btn-small',
      href: this.model.href,
    }, 'More');
    const actions = div({ class: 'repeating-grid getmoreinfo' }, link1, link2);
    gridContainer.appendChild(actions);
  }

  /**
   * Render the button actions on the bottom of the model card.
   * @param gridContainer
   */
  renderButtonActionsOfDetailsContainer(gridContainer) {
    this.renderButtonActionsOfDetailsContainer_left(gridContainer);
    this.renderButtonActionsOfDetailsContainer_right(gridContainer);
  }

  /**
   * Render the left action buttons on the bottom of the model card.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderButtonActionsOfDetailsContainer_left(gridContainer) {
    const link = a({
      target: '_blank',
      class: 'btn-action btn-icons btn-directions',
      href: '#',
    }, 'Directions');

    const actionContainer = div(link);
    gridContainer.appendChild(actionContainer);
  }

  /**
   * Render the right action buttons on the bottom of the model card.
   * @param gridContainer
   */
  renderButtonActionsOfDetailsContainer_right(gridContainer) {
    // create a svg element using the photos.svg file
    const photoLink = a({
      class: 'btn-action btn-icons btn-photos',
      href: '#',
    }, 'Photos');
    const photoDiv = div(photoLink);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = `CompareItem_${this.model.id}`;
    checkbox.id = `CompareItem_${this.model.id}`;
    checkbox.onchange = () => {
      // do nothing for now
    };

    const labelEl = label({
      class: 'btn-action',
      htmlFor: `CompareItem_${this.model.id}`,
    }, ' Compare');

    const formEl = form(checkbox, labelEl);

    const actionContainer = div({ class: 'repeating-grid' }, photoDiv, formEl);
    gridContainer.appendChild(actionContainer);
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
   * @param model the model to generate the image for. Using the model's image property and title.
   * @returns {Element}
   */
  // eslint-disable-next-line class-methods-use-this
  createModelImage(model) {
    return createOptimizedPicture(model.image, model.title, true, [{ width: '600' }]);
  }
}

export default BaseCard;
