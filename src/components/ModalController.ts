let savedScrollY = 0;

function lockScroll(): void {
  savedScrollY = window.scrollY;
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
}

function unlockScroll(): void {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, savedScrollY);
}

function openModal(trigger: HTMLButtonElement): void {
  const overlay = document.getElementById("book-modal-overlay");
  const coverEl = document.getElementById("modal-cover") as HTMLImageElement | null;
  const titleEl = document.getElementById("modal-book-title");
  const authorEl = document.getElementById("modal-book-author");
  const emojisEl = document.getElementById("modal-book-emojis");
  const notesEl = document.getElementById("modal-book-notes");
  const goodreadsEl = document.getElementById("modal-book-goodreads") as HTMLAnchorElement | null;

  if (!overlay || !coverEl || !titleEl || !authorEl || !emojisEl || !notesEl || !goodreadsEl) return;

  const title = trigger.dataset.title ?? "";
  const author = trigger.dataset.author ?? "";
  const image = trigger.dataset.image ?? "";
  const emojis = trigger.dataset.emojis ?? "";
  const notes = trigger.dataset.notes ?? "";
  const goodreadsUrl = trigger.dataset.goodreadsUrl ?? "";

  coverEl.src = image;
  coverEl.alt = `Cover for ${title}`;
  titleEl.textContent = title;
  authorEl.textContent = author;
  emojisEl.textContent = emojis;
  emojisEl.style.display = emojis ? "" : "none";
  notesEl.textContent = notes;
  notesEl.style.display = notes ? "" : "none";
  goodreadsEl.href = goodreadsUrl;
  goodreadsEl.style.display = goodreadsUrl ? "" : "none";

  lockScroll();
  overlay.style.display = "";
  // Allow display to apply before triggering the fade-in
  requestAnimationFrame(() => {
    overlay.setAttribute("aria-hidden", "false");
  });

  const closeBtn = overlay.querySelector<HTMLButtonElement>(".modal-close");
  closeBtn?.focus();
}

function closeModal(returnFocus?: HTMLElement): void {
  const overlay = document.getElementById("book-modal-overlay");
  if (!overlay) return;

  overlay.setAttribute("aria-hidden", "true");
  unlockScroll();
  overlay.addEventListener("transitionend", () => {
    overlay.style.display = "none";
  }, { once: true });
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

  // Prevent text selection when mousedown on backdrop causes mouseup inside modal
  overlay.addEventListener("mousedown", (event) => {
    if (event.target === overlay) {
      event.preventDefault();
    }
  });

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
