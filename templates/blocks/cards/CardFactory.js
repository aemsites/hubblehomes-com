import FeaturedCard from './FeaturedCard.js';
import HomePlansCard from './HomePlansCard.js';
import InventoryCard from './InventoryCard.js';
import CommunityCard from './CommunityCard.js';

class CardFactory {
  static createCard(cardType, data, community) {
    let type = cardType;
    if (cardType instanceof DOMTokenList) {
      type = ['featured', 'home-plans', 'inventory', 'community'].find((t) => cardType.contains(t))
        || 'community';
    }

    switch (type) {
      case 'featured':
        return new FeaturedCard(data, community);
      case 'home-plans':
        return new HomePlansCard(data, community);
      case 'inventory':
        return new InventoryCard(data, community);
      default:
        return new CommunityCard(data, community);
    }
  }
}

export default CardFactory;
