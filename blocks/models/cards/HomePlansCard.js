import BaseCard from './BaseCard.js';
import {a, div, small, span} from "../../../scripts/dom-helpers.js";
import {formatPrice} from "../../../scripts/currency-formatter.js";

class HomePlansCard extends BaseCard {

    constructor(model) {
        super(model);
    }

    renderTaglineItems(taglineContainer) {
        const from = small({class: 'from-price'}, 'From *');

        const price = span({class: 'model-card-tagline-price'},
            formatPrice(this.model.price));
        const priceContainer = div(
            {class: 'model-card-tagline-price-container'}, from, price);

        const monthly = span({class: 'model-card-tagline-price-per-month'},
            formatPrice(this.model.monthly));
        const perMonth = span({class: 'model-card-tagline-monthly-per-month'},
            '/mo');
        const monthlyRate = div({class: 'model-card-tagline-monthly-container'},
            from.cloneNode(true), monthly, perMonth);

        taglineContainer.appendChild(priceContainer);
        taglineContainer.appendChild(monthlyRate);
    }

    renderIncentivesAvailable() {
        const divEl = div({class: 'itemincentives'}, "$25K Your Way on Quick Move-Ins");
        const link = a({
            href: '/new-homes/idaho/boise-metro/caldwell/mason-creek',
            class: '',
            'aria-label': 'Community Incentives Available for Mason Creek'
        }, divEl);
        return div({class: 'itemincentivesavailablerow'}, link);
    }

}

export default HomePlansCard;
