/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { p, strong } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  // get line count from block variant
  const linesClass = block.className.split(' ').find((className) => className.startsWith('lines-'));
  let lines = '4';
  if (linesClass) [lines] = linesClass.match(/\d+/);

  const $moreOrLess = strong('Read More');
  const $p = p({ class: 'more' }, $moreOrLess);
  block.append($p);

  const $container = block.querySelector('div > div');
  $container.style.webkitLineClamp = lines;

  $p.addEventListener('click', () => {
    if ($container.classList.contains('expanded')) {
      $container.classList.remove('expanded');
      $p.classList.remove('less');
      $moreOrLess.textContent = 'Read More';
    } else {
      $container.classList.add('expanded');
      $p.classList.add('less');
      $moreOrLess.textContent = 'Read Less';
    }
  });
}
