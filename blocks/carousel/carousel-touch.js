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
  block.addEventListener('touchstart', handleTouchStart, false);
  block.addEventListener('touchmove', handleTouchMove, false);
  block.addEventListener('touchend', () => handleTouchEnd(block, nextSlide, prevSlide), false);
  block.addEventListener('mousedown', handleMouseDown, false);
  block.addEventListener('mousemove', handleMouseMove, false);
  block.addEventListener('mouseup', () => handleMouseUp(block, nextSlide, prevSlide), false);
}
