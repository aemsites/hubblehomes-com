/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */
import {
  div,
} from '../../scripts/dom-helpers.js';

/* eslint-disable no-undef */
const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (url) => `
  <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `
    <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `
    <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const embedHubspot = (formId) => {
  const createForm = () => {
    if (typeof hbspt !== 'undefined' && hbspt.forms) {
      hbspt.forms.create({
        region: 'na1',
        portalId: '21555329',
        formId,
        target: '.hubspot-form',
      });
    }
  };

  loadScript('https://js.hsforms.net/forms/embed/v2.js', createForm, 'text/javascript');
};

function decorateHubspot(block) {
  const form = div({ class: 'hubspot-form' });
  block.appendChild(form);
}

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }
  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
    {
      match: ['twitter'],
      embed: embedTwitter,
    },
    {
      match: ['hubspot'],
      embed: embedHubspot,
      decorate: decorateHubspot,
    },
  ];
  let config = EMBEDS_CONFIG.find((e) => e.match.some((match) => block.classList.contains(match)));
  if (!config && link) {
    config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  }
  if (config) {
    if (config.match.includes('hubspot')) {
      config.decorate(block);
      config.embed(link);
    } else {
      const url = new URL(link);
      block.innerHTML = config.embed(url, autoplay);
    }
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    const url = new URL(link);
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  let embedSrc;
  if (block.classList.contains('hubspot')) {
    const secondParagraph = block.querySelector('div div:nth-child(2) p');
    embedSrc = secondParagraph ? secondParagraph.textContent : '';
  } else {
    embedSrc = block.querySelector('a');
    embedSrc = embedSrc ? embedSrc.href : '';
  }
  block.textContent = '';
  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, embedSrc);
      }
    });
    observer.observe(block);
  }
}
