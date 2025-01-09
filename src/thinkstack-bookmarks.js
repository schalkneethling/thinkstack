export class ThinkStackBookmarks extends HTMLElement {
  static #selectors = {
    bookmarksContainer: "#bookmarks-container",
    bookmarksEntryTmpl: "#bookmarks-entry-tmpl",
    noBookmakrsTmpl: "#no-bookmarks-tmpl",
  };

  renderBookmarks() {
    console.info("Rendering bookmarks...");
    this.#renderBookmarks();
  }

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.#addEventListeners();
    this.#renderBookmarks();
  }

  #addEventListeners() {
    window.addEventListener("storage", (event) => {
      if (event.key === "bookmarks:thinkstack") {
        this.#renderBookmarks();
      }
    });
  }

  #renderBookmarks() {
    const bookmarksContainer = this.querySelector(
      ThinkStackBookmarks.#selectors.bookmarksContainer,
    );
    const entryTmpl = this.querySelector(
      ThinkStackBookmarks.#selectors.bookmarksEntryTmpl,
    );
    const localStorageKey = "bookmarks:thinkstack";

    if (bookmarksContainer) {
      try {
        const bookmarksInStorage = localStorage.getItem(localStorageKey);

        if (!bookmarksInStorage) {
          const noBookmarksTmpl = this.querySelector(
            ThinkStackBookmarks.#selectors.noBookmakrsTmpl,
          );
          const noBookmarks = noBookmarksTmpl.content.cloneNode(true);

          bookmarksContainer.innerHTML = "";
          bookmarksContainer.append(noBookmarks);
          return;
        }

        if (bookmarksInStorage) {
          const storedBookmarks = JSON.parse(bookmarksInStorage).toReversed();
          const bookmarks = storedBookmarks.map((bookmark) => {
            const entry = entryTmpl.content.cloneNode(true);
            const bookmarkLink = entry.querySelector(".bookmark-link");

            entry.querySelector(".bookmark-img").src = bookmark.previewImg;

            bookmarkLink.href = bookmark.url;
            bookmarkLink.querySelector("h3").textContent = bookmark.pageTitle;

            entry.querySelector(".bookmark-description").textContent =
              bookmark.metaDescription;

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

customElements.define("thinkstack-bookmarks", ThinkStackBookmarks);
