const hh = window.hh || {};
hh.inventory = hh.inventory || {};

async function loadInventory() {
  const response = await fetch('/inventory-query-index.json');
  if (response.ok) {
    const inventory = await response.json();
    hh.inventory = inventory.data;
    return inventory.data;
  }
  throw new Error('Failed to load inventory data');
}

// eslint-disable-next-line no-unused-vars
export async function getInventoryHomes(community) {
  const inventory = await loadInventory();
  return inventory.filter((home) => home.community === community);
}
