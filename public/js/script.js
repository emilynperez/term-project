function initSlideshow(slideshowId, interval = 6000) {
  let container = document.getElementById(slideshowId);
  let slides = container.querySelectorAll(".slide");
  let index = 0;

  function showSlide(newIndex) {
    slides[index].classList.remove("active");
    index = (newIndex + slides.length) % slides.length; // wrap around
    slides[index].classList.add("active");
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  // Store the interval ID so we can reset it when arrows are clicked
  let intervalId = setInterval(nextSlide, interval);

  // Add to global object for manual control
  window.slideshows = window.slideshows || {};
  window.slideshows[slideshowId] = { showSlide, indexRef: () => index, slides };
}

function changeSlide(slideshowId, direction) {
  const ss = window.slideshows[slideshowId];
  if (ss) {
    let newIndex = ss.indexRef() + direction;
    ss.showSlide(newIndex);

    clearInterval(ss.intervalId);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSlideshow("slideshow1", 6000); // 6 seconds
  initSlideshow("slideshow2", 6000);
});
