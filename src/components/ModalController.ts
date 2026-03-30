export function setupModalController(): void {
  const dialog = document.getElementById(
    "book-modal",
  ) as HTMLDialogElement | null;
  if (!dialog) return;

  const coverEl = document.getElementById(
    "modal-cover",
  ) as HTMLImageElement | null;
  const titleEl = document.getElementById("modal-book-title");
  const authorEl = document.getElementById("modal-book-author");
  const emojisEl = document.getElementById("modal-book-emojis");
  const notesEl = document.getElementById("modal-book-notes");
  const goodreadsEl = document.getElementById(
    "modal-book-goodreads",
  ) as HTMLAnchorElement | null;
  const closeBtn = dialog.querySelector<HTMLButtonElement>(".modal-close");

  if (
    !coverEl ||
    !titleEl ||
    !authorEl ||
    !emojisEl ||
    !notesEl ||
    !goodreadsEl
  )
    return;

  let lastTrigger: HTMLButtonElement | undefined;

  const triggers = document.querySelectorAll<HTMLButtonElement>(
    "[data-book-card] .book-trigger",
  );

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
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

      lastTrigger = trigger;
      dialog.showModal();
    });
  });

  // Return focus to the trigger that opened the modal
  dialog.addEventListener("close", () => {
    lastTrigger?.focus();
  });

  closeBtn?.addEventListener("click", () => {
    dialog.close();
  });

  // Prevent text selection when the opening click lands on the backdrop
  dialog.addEventListener("mousedown", (event) => {
    if (event.target === dialog) {
      event.preventDefault();
    }
  });
}
