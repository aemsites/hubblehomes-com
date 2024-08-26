/**
 * Rebuild the styles for the images in the gallery.  The window width will determine the rule to
 * apply to the images.
 */
let previousRange = -1;

export default function rebuildImageStyles(pictures) {
  const ranges = [[0, 768], [768, Number.MAX_SAFE_INTEGER]];

  // located which range the window width falls into
  const currentRange = ranges.findIndex(
    ([min, max]) => window.innerWidth >= min && window.innerWidth < max,
  );

  if (previousRange === currentRange) return;
  previousRange = currentRange;

  // const pictures = document.querySelectorAll('.image-gallery picture');
  const windowWidth = window.innerWidth;
  // there's two breakpoints for the gallery, one at 768px and above.
  // The rules are different for each breakpoint, where a 0 is a small image, and a 1 a large.
  const rowRules = windowWidth >= 768
    ? [[0, 0, 1], [0, 0, 0], [1, 0, 0], [0, 0, 0]]
    : [[0, 0], [1, 0], [0, 1], [0, 1]];

  pictures.forEach((picture, index) => {
    picture.className = '';

    // we have 4 different rules, figure out which rule block to point to
    const currentRulePtr = index === 0 ? 0 : Math.floor((index / rowRules[0].length) % 4);
    // get the rule for the current position, for example < 768
    const rule = rowRules[currentRulePtr][index % rowRules[0].length];
    const style = rule === 0 ? 'small' : 'large';
    const nextRule = rowRules[currentRulePtr][(index + 1) % rowRules[0].length];

    if (nextRule === 1 && pictures.length !== index + 1) picture.classList.add('large-sibling');
    picture.classList.add(style);
  });
}

export function galleryReset() {
  previousRange = -1;
}
