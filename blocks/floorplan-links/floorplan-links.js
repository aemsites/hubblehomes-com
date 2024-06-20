export default function decorate(block) {
  const links = block.querySelectorAll('a');
  block.innerHTML = '';
  links.forEach((link) => {
    link.classList.remove('fancy');
    link.classList.add('light-blue');
    block.appendChild(link);
  });
}
