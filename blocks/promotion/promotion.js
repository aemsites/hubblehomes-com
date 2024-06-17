export default async function decorate(block) {
  [...block.querySelectorAll('a.btn')].forEach((button) => {
    button.classList.remove('btn', 'fancy');
  });
}
