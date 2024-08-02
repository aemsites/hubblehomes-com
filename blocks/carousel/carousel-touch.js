let mouseStartX;
let mouseStartY;
let isMouseDown;
let touchStartX;
let touchStartY;
let touchEndX;
let touchEndY;
let mouseEndX;
let mouseEndY;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;
}

function handleTouchEnd(b, nextSlide, prevSlide) {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
}

function handleMouseDown(event) {
  mouseStartX = event.clientX;
  mouseStartY = event.clientY;
  isMouseDown = true;
}

function handleMouseMove(event) {
  if (!isMouseDown) return;
  mouseEndX = event.clientX;
  mouseEndY = event.clientY;
}

function handleMouseUp(b, nextSlide, prevSlide) {
  if (!isMouseDown) return;
  isMouseDown = false;
  const deltaX = mouseEndX - mouseStartX;
  const deltaY = mouseEndY - mouseStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
}

export default function registerTouchHandlers(block, nextSlide, prevSlide) {
  function isButtonOrAnchor(event) {
    // if the event target is a button or anchor then ignore it allow those handlers to fire
    return (event.target.tagName === 'BUTTON' || event.target.tagName === 'A');
  }

  block.addEventListener('touchstart', handleTouchStart);
  block.addEventListener('touchmove', handleTouchMove);
  block.addEventListener('touchend', (e) => {
    if (!isButtonOrAnchor(e)) handleTouchEnd(block, nextSlide, prevSlide);
  });
  block.addEventListener('mousedown', handleMouseDown);
  block.addEventListener('mousemove', handleMouseMove);
  block.addEventListener('mouseup', (e) => {
    if (!isButtonOrAnchor(e)) handleMouseUp(block, nextSlide, prevSlide);
  });
  block.addEventListener('dragstart', (e) => e.preventDefault());
}
