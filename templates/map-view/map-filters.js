import {
  button, div, li, option, select, strong, ul,
} from '../../scripts/dom-helpers.js';
import { filters } from '../../scripts/inventory.js';
import { getCitiesInCommunities } from '../../scripts/communities.js';

const originalArray = [];
let filterChoices;

function resolveFilter(filterValue) {
  return filters.find((f) => f.value === filterValue);
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const debouncedRenderElement = debounce(renderElement, 100);

const arrayChangeHandler = {
  get(target, property) {
    return Reflect.get(target, property);
  },
  set(target, property, value) {
    const result = Reflect.set(target, property, value);
    debouncedRenderElement(target);
    return result;
  },
  deleteProperty(target, property) {
    const result = Reflect.deleteProperty(target, property);
    debouncedRenderElement(target);
    return result;
  },
};

const chosenFilters = new Proxy(originalArray, arrayChangeHandler);

function renderElement(array) {
  function toUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  filterChoices.innerHTML = 'Filters: ';

  array.forEach((filterValue) => {
    const filter = resolveFilter(filterValue);
    filterChoices.append(
      li(
        toUpper(`${filter.category}: `),
        strong(filter.label),
      ),
    );
  });

  if (chosenFilters.length > 0) {
    document.querySelector('.filter-choices').classList.add('show');
    filterChoices.append(
      button(
        {
          class: 'light-gray small',
          onclick: () => {
            chosenFilters.length = 0;
            document.querySelectorAll('option').forEach((optionEl) => {
              optionEl.selected = false;
            });
          },
        },
        'Clear',
      ),
    );
  } else {
    document.querySelector('.filter-choices').classList.remove('show');
  }
}

function buildOptions(allFilters) {
  const optionEls = [];

  allFilters.forEach((filter) => {
    const properties = { value: filter.value };
    optionEls.push(option(properties, filter.label));
  });

  return optionEls;
}

function buildSelect(options) {
  return select({
    // eslint-disable-next-line no-unused-vars
    onchange: (event) => {
      const { value } = event.target.options[event.target.selectedIndex];
      if (value) {
        chosenFilters.push(value);
      }
    },
  }, ...options);
}

async function addCitiesToFilters() {
  filters.push({
    category: 'city',
    label: 'All',
    value: 'city-*',
    rule: (models) => models.filter(() => true),
  });
  const cities = await getCitiesInCommunities();
  cities.forEach((city) => {
    filters.push({
      category: 'city',
      label: city,
      value: city,
      rule: (models) => models.filter((model) => model.city === city),
    });
  });
}

function buildHomeTypeFilter() {
  const homeTypeOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Home Type'),
      ...filters.filter((f) => f.category === 'homestyle')],
  );
  return buildSelect(homeTypeOptions);
}

function buildPriceFilter() {
  const priceOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Price'),
      ...filters.filter((f) => f.category === 'price')],
  );
  return buildSelect(priceOptions);
}

function buildBedFilter() {
  const bedsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Beds'),
      ...filters.filter((f) => f.category === 'beds')],
  );
  return buildSelect(bedsOptions);
}

function buildCityFilter() {
  const cityOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'City'),
      ...filters.filter((f) => f.category === 'city')],
  );
  return buildSelect(cityOptions);
}

function buildSquareFeetFilter() {
  const sqFtOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Square Feet'),
      ...filters.filter((f) => f.category === 'sqft')],
  );
  return buildSelect(sqFtOptions);
}

function buildBathsFilter() {
  const bathsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Baths'),
      ...filters.filter((f) => f.category === 'baths')],
  );
  return buildSelect(bathsOptions);
}

function buildCarsFilter() {
  const carsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Cars'),
      ...filters.filter((f) => f.category === 'cars')],
  );
  return buildSelect(carsOptions);
}

function buildStatusFilter() {
  const statusOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Status'),
      ...filters.filter((f) => f.category === 'status')],
  );
  return buildSelect(statusOptions);
}

export default async function buildFilters() {
  await addCitiesToFilters();
  const homeType = buildHomeTypeFilter();
  const price = buildPriceFilter();
  const beds = buildBedFilter();
  const city = buildCityFilter();
  const sqFt = buildSquareFeetFilter();
  const baths = buildBathsFilter();
  const cars = buildCarsFilter();
  const status = buildStatusFilter();

  filterChoices = ul(
    { class: 'filter-choices' },
    'Filters: ',
  );

  return div(
    { class: 'filter-container' },
    div(
      { class: 'filters fluid-grid' },
      homeType,
      price,
      beds,
      city,
      sqFt,
      baths,
      cars,
      status,
    ),
    filterChoices,
  );
}
