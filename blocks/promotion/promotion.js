// eslint-disable-next-line no-unused-vars,no-empty-function
export default async function decorate(block) {
  [...block.querySelectorAll('a.btn')].forEach((button) => {
    button.classList.remove('btn', 'fancy');
  });
}
