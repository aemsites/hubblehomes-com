export default async function decorate(block) {
  const pictures = block.querySelectorAll('picture');

  block.innerHTML = '';

  const rowRules = [[0, 0, 1], [0, 0, 0], [1, 0, 0], [0, 0, 0]];
  let currentRulePtr = 0;

  pictures.forEach((picture, index) => {
    if (index !== 0) {
      currentRulePtr = Math.floor((index / 3) % 4);
    }
    const rule = rowRules[currentRulePtr][index % 3];
    const style = rule === 0 ? 'small' : 'large';

    // is the next rule a large rule
    const nextRule = rowRules[currentRulePtr][(index + 1) % 3];
    if (nextRule === 1) {
      picture.classList.add('large-sibling');
    }

    picture.classList.add(style);
  });

  block.append(...pictures);
}
