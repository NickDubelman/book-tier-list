function closeAllTooltips(exceptCard?: HTMLElement): void {
  const cards = document.querySelectorAll<HTMLElement>("[data-tooltip-card]");

  cards.forEach((card) => {
    if (exceptCard && card === exceptCard) {
      return;
    }

    card.removeAttribute("data-open");
    const trigger = card.querySelector<HTMLButtonElement>(".book-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

export function setupTooltipController(): void {
  const cards = document.querySelectorAll<HTMLElement>("[data-tooltip-card]");

  cards.forEach((card) => {
    const trigger = card.querySelector<HTMLButtonElement>(".book-trigger");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = card.getAttribute("data-open") === "true";
      if (isOpen) {
        closeAllTooltips();
        return;
      }

      closeAllTooltips(card);
      card.setAttribute("data-open", "true");
      trigger.setAttribute("aria-expanded", "true");
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    const clickedInsideCard =
      target instanceof HTMLElement &&
      target.closest("[data-tooltip-card]") !== null;

    if (!clickedInsideCard) {
      closeAllTooltips();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllTooltips();
    }
  });
}
