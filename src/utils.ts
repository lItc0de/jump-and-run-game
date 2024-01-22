export const asyncAnimationFrame = () =>
  new Promise((resolve) => window.requestAnimationFrame(resolve));
