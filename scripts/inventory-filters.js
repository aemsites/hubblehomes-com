export const SearchFilters = {
  READY_NOW: 'ready-now',
  UNDER_CONSTRUCTION: 'under-construction',
  TO_BE_BUILT: 'to-be-built',
};

export const filters = [
  { category: 'label', value: '', label: 'Price' },
  { category: 'label', value: '', label: 'Beds' },
  { category: 'label', value: '', label: 'Baths' },
  { category: 'label', value: '', label: 'City' },
  { category: 'label', value: '', label: 'Square Feet' },
  { category: 'label', value: '', label: 'Cars' },
  { category: 'label', value: '', label: 'Status' },
  { category: 'label', value: '', label: 'Home Type' },
  { category: 'all', value: '', label: 'All' },
  {
    category: 'status',
    value: 'status-*',
    label: 'All Listings',
    headerTitle: 'All New Home Listings',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'filterBy',
    value: '',
    label: 'Filter By',
  },
  {
    category: 'sortBy',
    value: '',
    label: 'Sort By',
  },
  {
    category: 'status',
    value: 'ready-now',
    label: 'Ready Now',
    headerTitle: 'Move-In Ready Homes',
    rule: (models) => models.filter((model) => model.status === 'Ready Now'),
  },
  {
    category: 'status',
    value: 'under-construction',
    label: 'Under Construction',
    headerTitle: 'Under Construction Homes',
    rule: (models) => models.filter((model) => model.status === 'Under Construction'),
  },
  {
    category: 'status',
    value: 'to-be-built',
    label: 'To Be Built',
    headerTitle: 'To Be Built Homes',
    rule: (models) => models.filter((model) => model.status === 'To Be Built'),
  },
  {
    category: 'priceAcsDesc',
    value: 'priceasc',
    label: 'Price - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.price, 10) - parseInt(b.price, 10)),
  },
  {
    category: 'priceAcsDesc',
    value: 'pricedesc',
    label: 'Price - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.price, 10) - parseInt(a.price, 10)),
  },
  {
    category: 'sqftAcsDesc',
    value: 'totalsquarefeetasc',
    label: 'Sq Ft - Low to High',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(a.squarefeet, 10) - parseInt(b.squarefeet, 10)),
  },
  {
    category: 'sqftAcsDesc',
    value: 'totalsquarefeetdesc',
    label: 'Sq Ft - High to Low',
    // eslint-disable-next-line max-len
    rule: (models) => models.sort((a, b) => parseInt(b.squarefeet, 10) - parseInt(a.squarefeet, 10)),
  },
  {
    category: 'bedsAcsDesc',
    value: 'bedsasc',
    label: 'Beds - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.beds, 10) - parseInt(b.beds, 10)),
  },
  {
    category: 'bedsAcsDesc',
    value: 'bedsdesc',
    label: 'Beds - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.beds, 10) - parseInt(a.beds, 10)),
  },
  {
    category: 'bathsAcsDesc',
    value: 'bathsasc',
    label: 'Baths - Low to High',
    rule: (models) => models.sort((a, b) => parseInt(a.baths, 10) - parseInt(b.baths, 10)),
  },
  {
    category: 'bathsAcsDesc',
    value: 'bathsdesc',
    label: 'Baths - High to Low',
    rule: (models) => models.sort((a, b) => parseInt(b.baths, 10) - parseInt(a.baths, 10)),
  },
  {
    category: 'beds',
    value: 'beds-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'beds',
    value: 'beds-3',
    label: '3+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 3),
  },
  {
    category: 'beds',
    value: 'beds-4',
    label: '4+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 4),
  },
  {
    category: 'beds',
    value: 'beds-5',
    label: '5+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 5),
  },
  {
    category: 'beds',
    value: 'beds-6',
    label: '6+ beds',
    rule: (models) => models.filter((model) => parseInt(model.beds, 10) >= 6),
  },
  {
    category: 'sqft',
    value: 'squarefeet-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'sqft',
    value: 'squarefeet-1',
    label: 'Under 1500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) <= 1500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-2',
    label: '1501 - 2000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 1500 && parseInt(model['square feet'], 10) <= 2000),
  },
  {
    category: 'sqft',
    value: 'squarefeet-3',
    label: '2001 - 2500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 2000 && parseInt(model['square feet'], 10) <= 2500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-4',
    label: '2501 - 3000 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 2500 && parseInt(model['square feet'], 10) <= 3000),
  },
  {
    category: 'sqft',
    value: 'squarefeet-5',
    label: '3001 - 3500 sq ft',
    // eslint-disable-next-line max-len
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 3000 && parseInt(model['square feet'], 10) <= 3500),
  },
  {
    category: 'sqft',
    value: 'squarefeet-6',
    label: 'Over 3500 sq ft',
    rule: (models) => models.filter((model) => parseInt(model['square feet'], 10) > 3500),
  },
  {
    category: 'price',
    value: 'price-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'price',
    value: 'price-1',
    label: '$300-$399',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 300000
        && parseInt(model.price, 10) <= 399999,
    ),
  },
  {
    category: 'price',
    value: 'price-2',
    label: '$400-$499',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 400000
        && parseInt(model.price, 10) <= 499999,
    ),
  },
  {
    category: 'price',
    value: 'price-3',
    label: '$500-$599',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 500000
        && parseInt(model.price, 10) <= 599999,
    ),
  },
  {
    category: 'price',
    value: 'price-4',
    label: '$600-$699',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 600000
        && parseInt(model.price, 10) <= 699999,
    ),
  },
  {
    category: 'price',
    value: 'price-5',
    label: '$700-$799',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 700000
        && parseInt(model.price, 10) <= 799999,
    ),
  },
  {
    category: 'price',
    value: 'price-8',
    label: '$800-$899',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 800000
        && parseInt(model.price, 10) <= 899999,
    ),
  },
  {
    category: 'price',
    value: 'price-9',
    label: '$900+',
    rule: (models) => models.filter(
      (model) => parseInt(model.price, 10) >= 900000,
    ),
  },
  {
    category: 'cars',
    value: 'cars-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'cars',
    value: 'cars-2',
    label: '2',
    rule: (models) => models.filter((model) => parseInt(model.cars, 10) === 2),
  },
  {
    category: 'cars',
    value: 'cars-3',
    label: '3',
    rule: (models) => models.filter((model) => parseInt(model.cars, 10) === 3),
  },
  {
    category: 'baths',
    value: 'baths-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'baths',
    value: 'baths-2+',
    label: '2+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 2),
  },
  {
    category: 'baths',
    value: 'baths-3+',
    label: '3+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 3),
  },
  {
    category: 'baths',
    value: 'baths-4+',
    label: '4+',
    rule: (models) => models.filter((model) => parseInt(model.baths, 10) >= 4),
  },
  {
    category: 'homestyle',
    value: 'homestyle-*',
    label: 'All',
    rule: (models) => models.filter(() => true),
  },
  {
    category: 'homestyle',
    value: '1-story',
    label: '1 Story',
    rule: (models) => models.filter((model) => model['home style'] === '1 Story'),
  },
  {
    category: 'homestyle',
    value: '1.5-story',
    label: '1.5 Story',
    rule: (models) => models.filter((model) => model['home style'] === '1.5 Story'),
  },
  {
    category: 'homestyle',
    value: '2-story',
    label: '2 Story',
    rule: (models) => models.filter((model) => model['home style'] === '2 Story'),
  },
];
