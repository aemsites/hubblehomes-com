import {
    CommunityCard,
    FeaturedCard,
    HomePlansCard,
    InventoryCard
} from './cards/cards.js';

class CardFactory {
    static createCard(classList) {
        if (classList.contains("featured")) {
            return new FeaturedCard();
        }

        if (classList.contains("home-plans")) {
            return new HomePlansCard();
        }

        if (classList.contains("inventory")) {
            return new InventoryCard();
        }

        if (classList.contains("community")) {
            return new CommunityCard();
        }
    }
}

export default CardFactory;
