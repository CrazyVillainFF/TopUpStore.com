(() => {
  const carousel = document.querySelector("[data-featured-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".featured-slide")];
  const progress = document.querySelector("[data-featured-progress]");
  let active = 0;
  let paused = false;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    carousel.scrollTo({ left: slides[active].offsetLeft - carousel.offsetLeft, behavior: "smooth" });
    if (progress) progress.style.width = `${((active + 1) / slides.length) * 100}%`;
  };

  carousel.addEventListener("pointerenter", () => { paused = true; });
  carousel.addEventListener("pointerleave", () => { paused = false; });
  carousel.addEventListener("focusin", () => { paused = true; });
  carousel.addEventListener("focusout", () => { paused = false; });

  showSlide(0);
  window.setInterval(() => {
    if (!paused && !document.hidden) showSlide(active + 1);
  }, 3000);
})();
