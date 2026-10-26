// Query param used to link directly to a book, e.g. /?book=project-hail-mary
const BOOK_PARAM = "book";

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
  // Set while closing in response to navigation, so the close handler
  // doesn't touch history a second time
  let closingFromNavigation = false;

  const triggers = document.querySelectorAll<HTMLButtonElement>(
    "[data-book-card] .book-trigger",
  );

  const findTrigger = (slug: string) =>
    Array.from(triggers).find((trigger) => trigger.dataset.slug === slug);

  const getUrlSlug = () =>
    new URL(window.location.href).searchParams.get(BOOK_PARAM);

  const urlWithSlug = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set(BOOK_PARAM, slug);
    } else {
      url.searchParams.delete(BOOK_PARAM);
    }
    return url;
  };

  const openBook = (trigger: HTMLButtonElement) => {
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
    if (!dialog.open) dialog.showModal();
  };

  const closeFromNavigation = () => {
    if (!dialog.open) return;
    closingFromNavigation = true;
    dialog.close();
  };

  // Open (or close) the modal to match the ?book= param in the URL
  const syncWithUrl = () => {
    const slug = getUrlSlug();
    const trigger = slug ? findTrigger(slug) : undefined;

    if (trigger) {
      openBook(trigger);
      return;
    }

    if (slug) {
      // Unknown book in the URL; drop the param
      history.replaceState(history.state, "", urlWithSlug(null));
    }
    closeFromNavigation();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const slug = trigger.dataset.slug;
      if (slug && getUrlSlug() !== slug) {
        history.pushState({ bookModal: true }, "", urlWithSlug(slug));
      }
      openBook(trigger);
    });
  });

  dialog.addEventListener("close", () => {
    if (closingFromNavigation) {
      closingFromNavigation = false;
    } else if (getUrlSlug()) {
      if (history.state?.bookModal) {
        // Opened by a click on this page; pop the entry we pushed so the
        // back button doesn't reopen the modal
        history.back();
      } else {
        // Landed directly on a shared link; there's no entry to pop
        history.replaceState(history.state, "", urlWithSlug(null));
      }
    }

    // Return focus to the trigger that opened the modal
    lastTrigger?.focus();
  });

  window.addEventListener("popstate", syncWithUrl);

  closeBtn?.addEventListener("click", () => {
    dialog.close();
  });

  // Prevent text selection when the opening click lands on the backdrop
  dialog.addEventListener("mousedown", (event) => {
    if (event.target === dialog) {
      event.preventDefault();
    }
  });

  syncWithUrl();
}
