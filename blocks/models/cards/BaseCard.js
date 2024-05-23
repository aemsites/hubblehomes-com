import {
    a,
    div,
    form,
    h3,
    img,
    label,
    span
} from "../../../scripts/dom-helpers.js";
import {createOptimizedPicture} from "../../../scripts/aem.js";

class BaseCard {

    card = undefined;

    constructor(model) {
        this.model = model;
        this.card = div({class: 'model-card-details'});
    }

    setModel(model) {
        this.model = model;
    }

    render() {
        // render the header area which must include a title
        // and an optional address.
        const header = this.renderHeaderArea();
        header.appendChild(this.renderTitle());

        // if needed render an address
        const address = this.renderAddress();
        if (address) {
            header.appendChild(address);
        }
        this.card.appendChild(header);

        // insert models' card image
        const imageBoxAndActions = this.renderImageBoxAndActions();
        this.card.appendChild(imageBoxAndActions);

        // render the tagline area and allow cards to insert their own content
        const taglineContainer = this.renderTaglineContainer();
        const taglineItems = this.renderTaglineItems(taglineContainer);
        if (taglineItems) {
            taglineContainer.appendChild(taglineItems);
        }
        this.card.appendChild(taglineContainer);

        // render the details grid that includes beds, baths, sqft, and cars
        const details = this.renderGridDetails();
        this.card.appendChild(details);

        const bottomContainer = this.renderBottomContainer();
        this.card.appendChild(bottomContainer);

        const incentives = this.renderIncentivesAvailable();
        if (incentives) {
            this.card.appendChild(incentives);
        }

        return this.card;
    }

    renderIncentivesAvailable() {
        return undefined;
    }

    renderButtonActions(gridContainer) {
        this.renderLeftActionButtons(gridContainer);
        this.renderRightActionButtons(gridContainer);
    }

    renderLeftActionButtons(gridContainer) {
        const link = a({
            target: '_blank',
            class: 'btn-action btn-icons btn-directions',
            href: "#"
        }, "Directions");

        const actionContainer = div({class: 'grid-item pull-left'}, link);

        gridContainer.appendChild(actionContainer);
    }

    renderRightActionButtons(gridContainer) {
        // create a svg element using the photos.svg file
        const photoLink = a({class: 'btn-action btn-icons btn-photos', href: "#"}, "Photos");
        const photoDiv = div(photoLink);


        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'CompareItem_' + this.model.id
        checkbox.id = 'CompareItem_' + this.model.id;
        checkbox.onchange = () => console.log('click');

        const labelEl = label({
            class: 'btn-action',
            htmlFor: 'CompareItem_' + this.model.id,
        }, " Compare");

        const formEl = form(checkbox, labelEl);

        const actionContainer = div({class: 'grid-item grid-item-2col'}, photoDiv, formEl);
        gridContainer.appendChild(actionContainer);
    }

    /**
     * Render the bottom container of the model card.
     * Each bottom container consists of a grid 2 x 4.
     * Each area can be overridden by the extending class.
     */
    renderBottomContainer() {
        const bottomContainer = div({class: 'model-card-bottom-details'});
        const gridContainer = div({class: 'grid-container'});
        this.renderTopRow(gridContainer);
        this.renderMiddleRow(gridContainer);
        this.renderBottomRow(gridContainer);

        this.renderButtonActions(gridContainer);

        bottomContainer.appendChild(gridContainer);
        return bottomContainer;
    }

    renderTopRow(gridContainer) {
        this.renderTopLeft(gridContainer);
        this.renderTopRight(gridContainer);
    }

    renderMiddleRow(gridContainer) {
        this.renderMiddleLeft(gridContainer);
        this.renderMiddleRight(gridContainer);
    }

    renderBottomRow(gridContainer) {
        this.renderBottomLeft(gridContainer);
        this.renderBottomRight(gridContainer);
    }

    renderBottomRight(gridContainer) {
        const actions = div({class: 'grid-item getmoreinfo'});
        const link1 = a({class: 'btn-primary2 communitysmallbutton', href: this.model.href}, "Get Info");
        const link2 = a({class: 'btn-primary communitysmallbutton', href: this.model.href}, "More");
        actions.appendChild(link1);
        actions.appendChild(link2);
        gridContainer.appendChild(actions);
    }

    renderBottomLeft(gridContainer) {
        const link = a({href: 'tel:2086495529'}, "208-649-5529");
        const middleLeft = div({class: 'grid-item phone'}, link);
        gridContainer.appendChild(middleLeft);
    }

    renderMiddleRight(gridContainer) {
        const link = a({href: this.model.href}, "Request a Tour");
        const middleLeft = div({class: 'grid-item black-button'}, link);
        gridContainer.appendChild(middleLeft);
    }

    renderMiddleLeft(gridContainer) {
        const link = a({href: this.model.href}, "Choose Your Lot");
        const middleLeft = div({class: 'grid-item grey-button'}, link);
        gridContainer.appendChild(middleLeft);
    }

    renderTopLeft(gridContainer) {
        const topLeft = div({class: 'grid-item stories'}, `${this.model.story} Story`);
        gridContainer.appendChild(topLeft);
    }

    renderTopRight(gridContainer) {
        const topRight = a({
            class: 'grid-item interactive',
            href: this.model.href
        }, "Interactive Plan");

        gridContainer.appendChild(topRight);
    }

    /**
     * Render the details of the model, including beds, baths, sqft, and cars.
     * @returns {Element}
     */
    renderGridDetails() {
        return div({class: "model-grid-details"},
            div("Beds"),
            div("Baths"),
            div("SQ FT"),
            div("Cars"),
            div(this.model.beds),
            div(this.model.baths),
            div(this.model.sqft),
            div(this.model.cars));
    }

    /**
     * Render the tagline items inside the container provided.
     * @param taglineContainer allows children to be added into the tagline container.
     */
    renderTaglineItems(taglineContainer) {
        return undefined;
    }

    renderTaglineContainer() {
        return div({class: 'model-card-tagline'});
    }

    renderHeaderArea() {
        return div({class: 'model-card-header'});
    }

    renderTitle() {
        return h3(this.model.title);
    }

    renderAddress() {
        return undefined;
    }

    renderImageActions() {
        const share = this.renderLeftImageAction();
        const status = this.renderStatus();
        const favorite = this.renderRightImageAction();

        return div({class: 'model-card-image-overlay'}, share, status, favorite);
    }

    renderLeftImageAction() {
        const shareImage = img({
            class: 'itemsharebutton',
            alt: "share",
            src: '/icons/share.png',
            onmouseover: () => shareImage.setAttribute('src', '/icons/share_over.png'),
            onmouseout: () => shareImage.setAttribute('src', '/icons/share.png')
        });

        const shareLink = a({class: 'itemsharebutton', href: '#'}, shareImage);
        return div({class: 'share'}, shareLink);
    }

    renderStatus() {
        return div({class: 'status'}, span(this.model.status));
    }

    renderRightImageAction() {
        const favoriteLink = img({
            alt: "favorite",
            src: '/icons/save.png',
            onmouseover: () => favoriteLink.setAttribute('src', '/icons/save_over.png'),
            onmouseout: () => favoriteLink.setAttribute('src', '/icons/save.png')
        });
        return div({class: 'favorite'}, favoriteLink);
    }

    renderImageBoxAndActions() {
        const imagePicture= div({class: 'model-card-image-picture'});

        const imageLink= a({href: this.model.href}, this.createModelImage(this.model));
        imagePicture.appendChild(imageLink);

        const actions = this.renderImageActions();

        imagePicture.appendChild(actions);
        return div({class: 'model-card-image-holder'}, imagePicture);
    }

    /**
     * Generate a Picture element that has contains the model's image.
     * @param model the model to generate the image for.  Using the model's image property and title.
     * @returns {Element}
     */
    createModelImage(model) {
        return createOptimizedPicture(model.image, model.title);
    }
}

export default BaseCard;
