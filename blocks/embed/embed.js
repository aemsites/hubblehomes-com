/*
 * Embed Block
 * Handles embedding videos, social posts, and forms on the page.
 * Documentation: https://www.hlx.live/developer/block-collection/embed
 */
import {
  div,
  span,
} from '../../scripts/dom-helpers.js';
import { addFormConfiguration } from '../../scripts/forms-helper.js';
import { getFormConfig } from '../../scripts/form-config.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function createLoadingSkeleton() {
  const currentPath = window.location.pathname;
  const { minHeight } = getFormConfig(currentPath);

  // Create a DocumentFragment to build the skeleton off-DOM
  const fragment = document.createDocumentFragment();

  const formStructure = div(
    { class: 'form-loading-placeholder', style: `min-height: ${minHeight}px;` },
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-label' }),
        div({ class: 'form-input checkbox-input' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'captcha-placeholder' }),
      ),
    ),
    div(
      { class: 'form-row' },
      div(
        { class: 'form-field full-width' },
        div({ class: 'form-submit' }),
      ),
    ),
  );

  const loadingContainer = div(
    { class: 'loading-container', style: `min-height: ${minHeight}px;` },
    formStructure,
    span({ class: 'sr-only' }, 'Loading form...'),
  );

  fragment.appendChild(loadingContainer);

  return fragment;
}

// Utility function to load external scripts
const loadScript = (url, callback, type = 'text/javascript') => {
  const script = document.createElement('script');
  script.src = url;
  script.type = type;
  script.onload = callback;
  document.head.appendChild(script);
  return script;
};

// Generates default embed code
const getDefaultEmbed = (url) => `
  <div style="position: relative; padding-bottom: 56.25%; width: 100%; height: 0;">
    <iframe src="${url.href}" 
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
      allowfullscreen loading="lazy" 
      title="Content from ${url.hostname}">
    </iframe>
  </div>`;

// Generates YouTube embed code
const embedYouTube = (url, autoplay) => {
  const params = new URLSearchParams(url.search);
  let videoId;

  // if we are given a youtu.be short link, we need to extract the video id from the
  // if we are given a youtube embed link, we need to extract the video id from the pathname
  if (url.host.includes('youtu.be')) {
    videoId = url.host.includes('youtu.be') ? url.pathname.split('/')[1] : params.get('v');
  } else if (url.pathname.includes('/embed/')) {
    // eslint-disable-next-line prefer-destructuring
    videoId = url.pathname.match(/\/embed\/([^/?]+)/)[1];
  }

  const autoplayParams = autoplay ? '&muted=1&autoplay=1' : '';
  return `
    <div style="position: relative; padding-bottom: 56.25%; padding-top: 30px; width: 100%; height: 0;">
      <iframe src="https://www.youtube.com/embed/${videoId}?rel=0${autoplayParams}" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
        allow="autoplay; fullscreen" allowfullscreen 
        title="Content from YouTube" loading="lazy">
      </iframe>
    </div>`;
};

// Generates Vimeo embed code
const embedVimeo = (url, autoplay) => {
  const videoId = url.pathname.split('/')[2];
  const autoplayParams = autoplay ? '?muted=1&autoplay=1' : '';
  return `
    <div style="position: relative; padding-bottom: 56.25%; width: 100%; height: 0;">
      <iframe src="https://player.vimeo.com/video/${videoId}${autoplayParams}" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
        frameborder="0" allow="autoplay; fullscreen" allowfullscreen 
        title="Content from Vimeo" loading="lazy">
      </iframe>
    </div>`;
};

// Generates Twitter embed code and loads the Twitter widgets script
const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

// Adds a HubSpot form configuration
function embedHubSpot(formId, uniqueId) {
  const currentPath = window.location.pathname;
  const { minHeight } = getFormConfig(currentPath);

  addFormConfiguration({
    formId,
    targetElementId: uniqueId,
    minHeight,
  });
}

const embedAnimoto = (url, autoplay) => {
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allowfullscreen allow="${autoplay ? 'autoplay;' : ''} fullscreen" title="Hubble Homes Video Player" id="vp1GeZMS"></iframe>
    </div>`;
  return embedHTML;
};

// Decorates the HubSpot block with a form container
const decorateHubSpot = (block, uniqueId) => {
  const formContainer = div({ class: 'hubspot-form', id: uniqueId });
  const loadingSkeleton = createLoadingSkeleton();
  formContainer.appendChild(loadingSkeleton);
  block.appendChild(formContainer);
};

// Loads the appropriate embed based on the block's class and source URL
const loadEmbed = (block, embedSrc, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    { match: ['youtube', 'youtu.be'], embed: embedYouTube },
    { match: ['vimeo'], embed: embedVimeo },
    { match: ['twitter'], embed: embedTwitter },
    { match: ['animoto'], embed: embedAnimoto },
    { match: ['hubspot'], embed: embedHubSpot, decorate: decorateHubSpot },
  ];

  let config = EMBEDS_CONFIG.find((e) => e.match.some((match) => block.classList.contains(match)));
  if (!config && embedSrc) {
    const url = new URL(embedSrc);
    config = EMBEDS_CONFIG.find((e) => e.match.some((match) => url.hostname.includes(match)));
  }

  if (config) {
    if (config.match.includes('hubspot')) {
      const uniqueId = `hubspot-form-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      config.decorate(block, uniqueId);
      config.embed(embedSrc, uniqueId);
    } else {
      const url = new URL(embedSrc);
      block.innerHTML = config.embed(url, autoplay);
    }
    block.className = `block embed embed-${config.match[0]}`;
  } else {
    const url = new URL(embedSrc);
    block.innerHTML = getDefaultEmbed(url);
    block.className = 'block embed';
  }

  block.classList.add('embed-is-loaded');
};

// Main function to decorate the block
export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  let embedSrc;

  if (block.classList.contains('hubspot')) {
    const secondParagraph = block.querySelector('div div:nth-child(2) p');
    embedSrc = secondParagraph ? secondParagraph.textContent : '';
  } else {
    const linkElement = block.querySelector('a');
    embedSrc = linkElement ? linkElement.href : '';
  }

  block.textContent = '';

  if (placeholder) {
    const imgSizes = [
      { media: '(max-width: 480px)', width: '400' },
      { media: '(min-width: 480px)', width: '720' },
    ];
    const optimizedPicture = createOptimizedPicture(
      placeholder.querySelector('img').src,
      placeholder.alt,
      placeholder.title,
      imgSizes,
    );
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(optimizedPicture);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, embedSrc, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, embedSrc);
      }
    });
    observer.observe(block);
  }
}
