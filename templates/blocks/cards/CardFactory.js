import FeaturedCard from './FeaturedCard.js';
import HomePlansCard from './HomePlansCard.js';
import InventoryCard from './InventoryCard.js';
import CommunityCard from './CommunityCard.js';

class CardFactory {
  static createCard(classList, data) {
    if (classList.contains('featured')) {
      return new FeaturedCard(data);
    }

    if (classList.contains('home-plans')) {
      return new HomePlansCard(data);
    }

    if (classList.contains('inventory')) {
      return new InventoryCard(data);
    }

    if (classList.contains('community')) {
      return new CommunityCard(data);
    }

    return undefined;
  }
}

export default CardFactory;
