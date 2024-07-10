const hh = window.hh || {};
hh.breadcrumbs = hh.breadcrumbs || undefined;

async function fetchPageIndex() {
  if (hh.breadcrumbs) {
    return hh.breadcrumbs;
  }

  const request = await fetch('/data/page-index.json');
  if (request.ok) {
    const result = await request.json();
    const { data } = result;
    hh.breadcrumbs = data;
    return data;
  }
  throw new Error('Failed to fetch workbook');
}

async function getPageTitleForUrl(pathname) {
  const breadcrumbs = await fetchPageIndex();
  const item = breadcrumbs.find((p) => p.path === pathname);
  return item['page name'];
}

export {
  // eslint-disable-next-line import/prefer-default-export
  fetchPageIndex,
  getPageTitleForUrl,
};
