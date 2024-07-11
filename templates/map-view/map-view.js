/* eslint-disable function-paren-newline, object-curly-newline */
import { script, div, aside, a, i, strong } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');

  const $mapFilter = div({ class: 'map-filter-container' },
    div({ class: 'map' },
      a({ class: 'download', href: '#' },
        i('download'),
        ' our ',
        strong('Available Homes List'),
      ),
      a({ class: 'btn reset-zoom' }, 'Reset Zoom'),
      div({ id: 'google-map' }),
    ),
    aside({ class: 'filter' },
      div(
        'FILTERS HERE',
      ),
    ),
  );

  const googleAPI = script(`
    // Google Maps API
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "AIzaSyAL5wQ_SKxuuRXFk3c2Ipxto9C_AKZNq6M",
      v: "weekly",
      // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
      // Add other bootstrap parameters as needed, using camel case.
    });
  `);

  const googleMaps = script({ src: '/templates/map-view/google-maps.js' });

  $page.append($mapFilter, googleAPI, googleMaps);
}
