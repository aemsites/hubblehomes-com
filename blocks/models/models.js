import {
  readBlockConfig
} from '../../scripts/aem.js';
import {div, h3, picture, img, li, span} from '../../scripts/dom-helpers.js'

async function loadModels(path) {
  const url = new URL(path);
  const resp = await fetch(url.pathname);

  if (resp.ok) {
    const modelJson = await resp.json();
    return modelJson.data;
  }
}

function createCardImage(model) {
  const breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];
  const cardImage = picture();

  breakpoints.forEach((breakpoint) => {
    const source = document.createElement('source');

    if (model.media) {
      source.setAttribute('media', model.media);
    }
    source.setAttribute('type', 'image/jpeg');
    source.setAttribute('srcset', `${model.image}?w=${breakpoint.width}`);

    cardImage.appendChild(source);
  });

  const image = img();
  image.setAttribute('alt', model.title);
  image.className = 'model-card-image';
  cardImage.appendChild(image);
  return cardImage;
}

function modelGridDetails(model) {
  const grid = div();
  grid.classList.add("model-grid-details");

  const beds = div("Beds");
  beds.classList.add("model-grid-details-item");
  const baths = div("Baths");
  baths.classList.add("model-grid-details-item");
  const sqft = div("SQ FT");
  sqft.classList.add("model-grid-details-item");
  const cars = div("Cars");
  cars.classList.add("model-grid-details-item");

  grid.appendChild(beds);
  grid.appendChild(baths);
  grid.appendChild(sqft);
  grid.appendChild(cars);

  const bedsValue = div(model.beds);
  bedsValue.classList.add("model-grid-details-value");
  const bathsValue = div(model.baths);
  bathsValue.classList.add("model-grid-details-value");
  const sqftValue = div(model.sqft);
  sqftValue.classList.add("model-grid-details-value");
  const carsValue = div(model.cars);
  carsValue.classList.add("model-grid-details-value");

  grid.appendChild(bedsValue);
  grid.appendChild(bathsValue);
  grid.appendChild(sqftValue);
  grid.appendChild(carsValue);

  return grid;
}

function createTagLine(model, isFeatured) {
  const tagline = div();
  tagline.classList.add('model-card-tagline');

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    narrowSymbol: true,
    minimumFractionDigits: 0
  });

  const priceContainer = div();
  priceContainer.className = 'model-card-tagline-price-container';

  let price;
  if (isFeatured) {
    price = span(`From ${formatter.format(model.price)}`);
  } else {
    price = span(`${formatter.format(model.price)}`);
  }
  price.className = 'model-card-tagline-price';
  priceContainer.appendChild(price);

  if (!isFeatured && model['previous price']) {
    const increaseIcon = span();
    increaseIcon.className = 'model-card-tagline-price-increase-icon';

    priceContainer.appendChild(increaseIcon);

    const priceInc = span(formatter.format(model['previous price']))
    priceInc.className = 'model-card-tagline-price-increase';
    priceContainer.appendChild(priceInc);
  }

  tagline.appendChild(priceContainer);

  const monthlyRate = div();
  monthlyRate.classList.add('model-card-tagline-monthly-container')

  const monthly = span('* ' + formatter.format(model.monthly));
  monthly.classList.add('model-card-tagline-price-per-month');

  const perMonth = span( '/mo');
  perMonth.classList.add('model-card-tagline-monthly-per-month');

  monthlyRate.appendChild(monthly);
  monthlyRate.appendChild(perMonth);
  tagline.appendChild(monthlyRate)

  return tagline;
}

function createBottomDetails(model) {
  const bottomDetails = div();
  bottomDetails.classList.add('model-card-bottom-details');

  const grid = `<div class="grid-container">
      <div class="grid-item">${model.story} Story</div>
      <a href="https://contradovip.com/hubble-homes/amethyst?touch=1" class="grid-item interactive-button">Interactive Plan</a>
      <div class="grid-item grey-button"><a href="https://www.google.com">Choose Your Lot</a></div>
      <div class="grid-item black-button"><a href="#">Request a Tour</a></div>
      <div class="grid-item phone"><a href="tel:2086495529">208-649-5529</a></div>
      
      <div class="grid-item getmoreinfo">
          <a class="btn btn-sm btn-primary2 btn-square communitysmallbutton" href="#">Get Info</a>
          <a class="btn btn-sm btn-primary btn-square communitysmallbutton" href="#">More</a>
      </div>
      <a class="grid-item communityspecs3padding directions">Directions</a>

      <div class="grid-item communityspecs3padding photosandcompare">
          <a href="/new-homes/idaho/boise-metro/caldwell/mason-creek/spruce#groupSS-1" target="_blank">Photos</a>
          <form>
            <input type="checkbox" name="CompareItem" id="CompareItem_12_75_2728"  onchange="this.form.submit()">
            <label for="CompareItem" style="padding-top: 0px;"><strong>Compare</strong></label>
          </form>
      </div>
  </div>`

  bottomDetails.innerHTML = grid;

  return bottomDetails;
}

function createCardDetails(model, isFeatured) {
  const cardDetails = div();
  cardDetails.classList.add('model-card-details');

  cardDetails.innerHTML = `
  <div>
    <div class="model-card-header">
      <div class="model-name">
          <h3>${model.title}</h3>
          ${!isFeatured ? `
            <a href="http://www.hubblehomes.com/new-homes/idaho/boise-metro/caldwell/windsor-creek-east" aria-label="Visit Community Page">
               <h4 class="model-address">${model.address}</h4>
            </a>` : ''}
      </div>
    </div>

    <div class="model-card-image">
        <a href="/new-homes/idaho/boise-metro/meridian/canyons-at-prescott-ridge/bradshaw/6135-w-fireline-ct/999"
			class="gtm-inventorydetail">
			<picture>
              <img src="${model.image}" alt=""/>
            </picture>
		</a>
		
        <div class="model-card-image-overlay">
			<div class="col-xs-3 text-left">
				<div class="share">
				    <a href="" class="itemsharebutton" data-toggle="modal" data-target="#myModal_1" aria-label="Share">
                      <img src="https://hubblehomes.imgix.net/share.png" alt="share"
                        onmouseover="this.src='https://hubblehomes.imgix.net/share_over.png'"
                        onmouseout="this.src='https://hubblehomes.imgix.net/share.png'">
                      </a>
                  </div>
			</div>
			<div class="status">
			    <small>${model.status}</small>
			</div>
			<div>
				<div class="favorite">
                  <a
                    href="/my-favorites/favorites-add/canyons-at-prescott-ridge/bradshaw/6135-w-fireline-ct/999"
                    class="gtm-communitylistfavorites" aria-label="Add Bradshaw to My Favorites"><img
                    src="https://hubblehomes.imgix.net/save.png" alt="save" class="img-responsive"
                    onmouseover="this.src='https://hubblehomes.imgix.net/save_over.png'"
                    onmouseout="this.src='https://hubblehomes.imgix.net/save.png'"></a></div>
			</div>
		</div>
    </div>`



  return cardDetails;
}

function createModelCard(model, isFeatured) {
  const modelCard = li();
  const details = createCardDetails(model, isFeatured);
  const tagline = createTagLine(model, isFeatured);
  const grid = modelGridDetails(model);
  const bottomDetails = createBottomDetails(model);

  modelCard.appendChild(details);
  modelCard.appendChild(tagline);
  modelCard.appendChild(grid);
  modelCard.appendChild(bottomDetails);

  return modelCard;
}

export default function decorate(block) {
  const {
    models,
    modelstoshow
  } = readBlockConfig(block);

  const isFeatured = block.classList.contains("featured") ? true : false;

  block.textContent = '';

  loadModels(models).then((models) => {
    const ul = document.createElement('ul');
    models.forEach((model) => {
      ul.appendChild(createModelCard(model, isFeatured));
    });

    block.appendChild(ul);
  });

}

