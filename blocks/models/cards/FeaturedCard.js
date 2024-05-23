import BaseCard from './BaseCard.js';
import {div, span} from "../../../scripts/dom-helpers.js";
import {formatPrice} from "../../../scripts/currency-formatter.js";

class FeaturedCard extends BaseCard {
    constructor(model) {
        super(model);
    }

    renderTaglineItems(taglineContainer) {
        const price = span({class: 'model-card-tagline-price'}, `From ${formatPrice(this.model.price)}`);
        const priceContainer = div({class:'model-card-tagline-price-container'}, price);
        const monthly = span({class: 'model-card-tagline-price-per-month'}, '*' + formatPrice(this.model.monthly));
        const perMonth = span( {class: 'model-card-tagline-monthly-per-month'}, '/mo');
        const monthlyRate = div({class: 'model-card-tagline-monthly-container'}, monthly, perMonth);
        taglineContainer.appendChild(priceContainer);
        taglineContainer.appendChild(monthlyRate);
    }
}

export default FeaturedCard;
