export default async function decorate(doc) {
  const main = doc.querySelector('main');
  const defaultContent = main.querySelector('.default-content-wrapper');
//   const columns = main.querySelector('.columns-wrapper');

  defaultContent.style.textAlign = 'center';

//   const jobListings = div({ class: 'job-listings' }, columns);

  main.innerHTML = '';
  main.append(defaultContent);
}
