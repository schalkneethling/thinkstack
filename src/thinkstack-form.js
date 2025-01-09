export class ThinkStackForm extends HTMLElement {
  static #selectors = {
    bookmarkForm: "#bookmark-form",
  };

  constructor() {
    super();

    this.#addEventListeners();
  }

  #addItemToStorage(item) {
    const localStorageKey = "bookmarks:thinkstack";
    const storageChangedEvent = new StorageEvent("storage", {
      key: localStorageKey,
      newValue: JSON.stringify(item),
    });

    try {
      const localBookmarks = localStorage.getItem(localStorageKey);
      const updatedBookmarks = localBookmarks
        ? [...JSON.parse(localBookmarks), item]
        : [item];

      localStorage.setItem(localStorageKey, JSON.stringify(updatedBookmarks));
      window.dispatchEvent(storageChangedEvent);
    } catch (error) {
      throw new Error(`Error adding item to storage: ${error.message}`);
    }
  }

  #addEventListeners() {
    const bookmarkForm = this.querySelector(
      ThinkStackForm.#selectors.bookmarkForm,
    );
    const previewFallback = "../assets/thinkstack-fallback.webp";

    if (bookmarkForm) {
      bookmarkForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const endpoint = `${document.location.href}.netlify/functions/get-bookmark-data`;
        const formData = new FormData(bookmarkForm);
        const bookmark = formData.get("url");

        try {
          const response = await fetch(`${endpoint}?url=${bookmark}`);

          if (response.ok) {
            const bookmark = await response.json();
            bookmark.url = formData.get("url");

            const img = new Image();
            img.src = bookmark.previewImg;

            img.onload = () => {
              this.#addItemToStorage(bookmark);
            };

            img.onerror = () => {
              bookmark.previewImg = previewFallback;
              this.#addItemToStorage(bookmark);
            };

            bookmarkForm.reset();
          }
        } catch (error) {
          throw new Error(error);
        }
      });
    }
  }
}

customElements.define("thinkstack-form", ThinkStackForm);
