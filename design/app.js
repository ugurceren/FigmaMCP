const accordion = document.querySelector("[data-accordion]");

accordion?.addEventListener("click", (event) => {
  const trigger = event.target.closest(".accordion-trigger");
  if (!trigger) return;

  const item = trigger.closest(".accordion-item");
  const isOpen = item.classList.contains("open");

  accordion.querySelectorAll(".accordion-item").forEach((entry) => {
    entry.classList.remove("open");
    entry.querySelector(".accordion-trigger")?.setAttribute("aria-expanded", "false");
  });

  if (!isOpen) {
    item.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }
});

