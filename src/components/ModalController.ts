function openModal(trigger: HTMLButtonElement): void {
  const overlay = document.getElementById("book-modal-overlay");
  const coverEl = document.getElementById("modal-cover") as HTMLImageElement | null;
  const titleEl = document.getElementById("modal-book-title");
  const authorEl = document.getElementById("modal-book-author");
  const notesEl = document.getElementById("modal-book-notes");

  if (!overlay || !coverEl || !titleEl || !authorEl || !notesEl) return;

  const title = trigger.dataset.title ?? "";
  const author = trigger.dataset.author ?? "";
  const image = trigger.dataset.image ?? "";
  const notes = trigger.dataset.notes ?? "";

  coverEl.src = image;
  coverEl.alt = `Cover for ${title}`;
  titleEl.textContent = title;
  authorEl.textContent = author;
  notesEl.textContent = notes;
  notesEl.style.display = notes ? "" : "none";

  overlay.setAttribute("aria-hidden", "false");

  const closeBtn = overlay.querySelector<HTMLButtonElement>(".modal-close");
  closeBtn?.focus();
}

function closeModal(returnFocus?: HTMLElement): void {
  const overlay = document.getElementById("book-modal-overlay");
  if (!overlay) return;

  overlay.setAttribute("aria-hidden", "true");
  returnFocus?.focus();
}

export function setupModalController(): void {
  const triggers = document.querySelectorAll<HTMLButtonElement>(
    "[data-book-card] .book-trigger",
  );

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger);
      // Store the trigger so we can return focus on close
      const overlay = document.getElementById("book-modal-overlay");
      if (overlay) {
        (overlay as HTMLElement & { _lastTrigger?: HTMLButtonElement })._lastTrigger = trigger;
      }
    });
  });

  const overlay = document.getElementById("book-modal-overlay");
  if (!overlay) return;

  // Close on backdrop click (not on modal itself)
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      const lastTrigger = (overlay as HTMLElement & { _lastTrigger?: HTMLButtonElement })._lastTrigger;
      closeModal(lastTrigger);
    }
  });

  const closeBtn = overlay.querySelector<HTMLButtonElement>(".modal-close");
  closeBtn?.addEventListener("click", () => {
    const lastTrigger = (overlay as HTMLElement & { _lastTrigger?: HTMLButtonElement })._lastTrigger;
    closeModal(lastTrigger);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.getAttribute("aria-hidden") === "false") {
      const lastTrigger = (overlay as HTMLElement & { _lastTrigger?: HTMLButtonElement })._lastTrigger;
      closeModal(lastTrigger);
    }
  });
}
