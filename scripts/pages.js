async function fetchPageIndex() {
  const request = await fetch('/data/page-index.json');
  if (request.ok) {
    return request.json();
  }
  throw new Error('Failed to fetch workbook');
}

export {
  // eslint-disable-next-line import/prefer-default-export
  fetchPageIndex,
};
