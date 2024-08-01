// eslint-disable-next-line func-names
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start':
      new Date().getTime(),
    event: 'gtm-data-layer.js',
  });
  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s); const
    dl = l !== 'dataLayer' ? `&l=${l}` : '';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
  f.parentNode.insertBefore(j, f);
}(window, document, 'script', 'dataLayer', 'GTM-MXVF5HB'));
