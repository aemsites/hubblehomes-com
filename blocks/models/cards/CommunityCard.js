import BaseCard from './BaseCard.js';
import {a, div, span} from "../../../scripts/dom-helpers.js";
import {formatPrice} from "../../../scripts/currency-formatter.js";

class CommunityCard extends BaseCard {
    constructor(model) {
        super(model);
    }

    renderTaglineItems(taglineContainer) {
        const taglinePrice = div({class: 'model-card-tagline-price'},  "Sold Out. Ask about Brittany Heights");
        const taglineType = div({class: 'model-card-tagline-type'}, "1 Story, 1.5 Story, 2 Story, Primary Down");

        taglineContainer.appendChild(taglinePrice);
        taglineContainer.appendChild(taglineType);
    }

    renderBottomRow(gridContainer) {
        const link = a({class: 'btn-primary2 btn-block communitylargebutton', href: this.model.href}, "View Monarch");
        const middleLeft = div({class: 'grid-item span2'}, link);
        gridContainer.appendChild(middleLeft);
    }

    renderButtonActions() {
        // do not render any
    }


}

export default CommunityCard;
