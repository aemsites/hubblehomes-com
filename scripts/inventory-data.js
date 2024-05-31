window.hh = window.hh || {};
const { hh } = window;

async function loadInventory() {
  const response = await fetch('/inventory-query-index.json');
  if (response.ok) {
    const inventory = await response.json();

    // load the inventory and create a map of communities to homes
    const communityMap = new Map();

    inventory.data.forEach((home) => {
      const { community } = home;
      if (!communityMap.has(community)) {
        communityMap.set(community, []);
      }
      communityMap.get(community).push(home);
    });
    hh.inventory = communityMap;
    return hh.inventory;
  }
  throw new Error('Failed to load inventory data');
}

// eslint-disable-next-line no-unused-vars
async function getInventoryHomes(community) {
  const inventory = await loadInventory();
  return inventory.get(community);
}

export {
  getInventoryHomes,
};
