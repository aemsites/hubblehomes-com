let map;
let initialZoom;
let currentZoom;

function resestZoom() {
  initialZoom = map.getZoom();
  currentZoom = initialZoom;
  const $resetZoom = document.querySelector('.reset-zoom');

  map.addListener('zoom_changed', () => {
    currentZoom = map.getZoom();
    if (currentZoom !== initialZoom) $resetZoom.classList.add('active');
    else $resetZoom.classList.remove('active');
  });

  $resetZoom.addEventListener('click', () => {
    map.setZoom(initialZoom);
  });
}

const initMap = async () => {
  // eslint-disable-next-line no-undef
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  const style = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    disableDefaultUI: true, // remove all buttons
    zoomControl: true, // allow zoom buttons
    streetViewControl: true, // allow street view control
    fullscreenControl: true, // allow fullscreen
  });

  const styles = {
    hide: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  map.setOptions({ styles: styles.hide });

  const mapType = new StyledMapType(style, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');

  resestZoom();
};

initMap();
