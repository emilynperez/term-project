function initSlideshow(slideshowId, interval = 5000) {
  let container = document.getElementById(slideshowId);
  if (!container) return;

  let slides = container.querySelectorAll(".slide");
  let index = 0;

  function showSlide(newIndex) {
    slides.forEach(slide => slide.classList.remove("active"));
    index = (newIndex + slides.length) % slides.length;
    slides[index].classList.add("active");
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  let intervalId = setInterval(nextSlide, interval);

  container.querySelector(".prev").addEventListener("click", () => {
    showSlide(index - 1);
    clearInterval(intervalId);
  });

  container.querySelector(".next").addEventListener("click", () => {
    showSlide(index + 1);
    clearInterval(intervalId);
  });

  showSlide(0);
}

document.addEventListener("DOMContentLoaded", () => {
  initSlideshow("slideshow1");
  initSlideshow("slideshow2");
});
