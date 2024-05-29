import {
  CommunityCard,
  FeaturedCard,
  HomePlansCard,
  InventoryCard,
} from './cards/cards.js';

class CardFactory {
  static createCard(classList, model) {
    if (classList.contains('featured')) {
      return new FeaturedCard(model);
    }

    if (classList.contains('home-plans')) {
      return new HomePlansCard(model);
    }

    if (classList.contains('inventory')) {
      return new InventoryCard(model);
    }

    if (classList.contains('community')) {
      return new CommunityCard(model);
    }

    return undefined;
  }
}

export default CardFactory;
