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

  const forms = document.querySelectorAll(".cart-form");
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const productId = form.getAttribute("data-id");

      try {
        const res = await fetch(`/cart/add/${productId}`, {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showAlert("✅ " + data.message);

          const cartCountEl = document.querySelector("#cart-count");
          if (cartCountEl && data.cartCount !== undefined) {
            cartCountEl.textContent = data.cartCount;
          }
        } else {
          showAlert("❌ " + (data.message || "Failed to add to cart"));
        }
      } catch (err) {
        showAlert("❌ Something went wrong");
      }
    });
  });

  function showAlert(message) {
    let container = document.querySelector(".alert-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "alert-container";
      document.body.prepend(container);
    }

    container.innerHTML = `
      <div style="background:#d4edda;color:#155724;padding:10px;margin:10px auto;width:90%;border-radius:5px;text-align:center">
        ${message}
      </div>
    `;

    setTimeout(() => {
      container.innerHTML = "";
    }, 2000);
  }
});
