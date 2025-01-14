export class LinkStackBookmarks extends HTMLElement {
  static #selectors = {
    bookmarksContainer: "#bookmarks-container",
    bookmarksEntryTmpl: "#bookmarks-entry-tmpl",
    noBookmakrsTmpl: "#no-bookmarks-tmpl",
  };

  #elements = {
    bookmarksContainer: this.querySelector(
      LinkStackBookmarks.#selectors.bookmarksContainer,
    ),
  };

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.#addEventListeners();
    this.#renderBookmarks();
  }

  #addEventListeners() {
    const { bookmarksContainer } = this.#elements;

    window.addEventListener("storage", (event) => {
      if (event.key === "bookmarks:linkstack") {
        this.#renderBookmarks();
      }
    });

    bookmarksContainer.addEventListener("click", (event) => {
      if (event.target.tagName === "BUTTON") {
        const { index } = event.target.dataset;
        this.#deleteBookmark(index);
      }
    });
  }

  #deleteBookmark(index) {
    const localStorageKey = "bookmarks:linkstack";
    const bookmarksInStorage = localStorage.getItem(localStorageKey);

    const storedBookmarks = JSON.parse(bookmarksInStorage).toReversed();
    storedBookmarks.splice(index, 1);

    localStorage.setItem(localStorageKey, JSON.stringify(storedBookmarks));
    this.querySelector(`#bookmark-entry-${index}`).remove();

    // if we just removed the last bookmark, show the no bookmarks message
    if (!storedBookmarks.length) {
      this.#showNoBookmarks();
    }
  }

  #showNoBookmarks() {
    const { bookmarksContainer } = this.#elements;
    const noBookmarksTmpl = this.querySelector(
      LinkStackBookmarks.#selectors.noBookmakrsTmpl,
    );
    const noBookmarks = noBookmarksTmpl.content.cloneNode(true);

    bookmarksContainer.innerHTML = "";
    bookmarksContainer.append(noBookmarks);
  }

  #renderBookmarks() {
    const { bookmarksContainer } = this.#elements;
    const entryTmpl = this.querySelector(
      LinkStackBookmarks.#selectors.bookmarksEntryTmpl,
    );
    const localStorageKey = "bookmarks:linkstack";

    if (bookmarksContainer) {
      try {
        const bookmarksInStorage = localStorage.getItem(localStorageKey);

        if (!bookmarksInStorage || !JSON.parse(bookmarksInStorage).length) {
          this.#showNoBookmarks();
          return;
        }

        if (bookmarksInStorage) {
          const storedBookmarks = JSON.parse(bookmarksInStorage).toReversed();
          const bookmarks = storedBookmarks.map((bookmark, index) => {
            const entry = entryTmpl.content.cloneNode(true);
            const bookmarkLink = entry.querySelector(".bookmark-link");
            const deleteBookmark = entry.querySelector("button");

            entry.querySelector(".bookmark-img").src = bookmark.previewImg;

            bookmarkLink.href = bookmark.url;
            bookmarkLink.querySelector("h3").textContent = bookmark.pageTitle;

            entry.querySelector(".bookmark-description").textContent =
              bookmark.metaDescription;

            deleteBookmark.dataset.index = index;
            entry.querySelector(".bookmark-entry").id =
              `bookmark-entry-${index}`;

            return entry;
          });

          let bookmarksList = this.querySelector("#bookmarks-list");

          if (bookmarksList) {
            bookmarksList.classList.remove("multiple");
            bookmarksList.innerHTML = "";
          } else {
            bookmarksList = document.createElement("ul");
            bookmarksList.classList.add("reset-list", "bookmarks-list");
            bookmarksList.id = "bookmarks-list";

            bookmarksContainer.innerHTML = "";
            bookmarksContainer.append(bookmarksList);
          }

          if (storedBookmarks.length > 1) {
            bookmarksList.classList.add("multiple");
          }

          bookmarksList.append(...bookmarks);
        }
      } catch (error) {
        throw new Error(`Error rendering bookmarks: ${error.message}`);
      }
    }
  }
}

customElements.define("linkstack-bookmarks", LinkStackBookmarks);
