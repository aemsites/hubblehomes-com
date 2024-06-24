import FeaturedCard from './FeaturedCard.js';
import HomePlansCard from './HomePlansCard.js';
import InventoryCard from './InventoryCard.js';
import CommunityCard from './CommunityCard.js';

class CardFactory {
  static createCard(classList, data, community) {
    if (classList.contains('featured')) {
      return new FeaturedCard(data, community);
    }

    if (classList.contains('home-plans')) {
      return new HomePlansCard(data, community);
    }

    if (classList.contains('inventory')) {
      return new InventoryCard(data, community);
    }

    if (classList.contains('community')) {
      return new CommunityCard(data, community);
    }

    return undefined;
  }
}

export default CardFactory;
