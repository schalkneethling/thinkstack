export class LinkStackBookmarks extends HTMLElement {
  static #selectors = {
    bookmarksContainer: "#bookmarks-container",
    bookmarksEntryTmpl: "#bookmarks-entry-tmpl",
    linkstackEditDialog: "linkstack-edit-dialog",
    noBookmakrsTmpl: "#no-bookmarks-tmpl",
  };

  #elements = {
    bookmarksContainer: this.querySelector(
      LinkStackBookmarks.#selectors.bookmarksContainer,
    ),
    linkstackEditDialog: document.querySelector(
      LinkStackBookmarks.#selectors.linkstackEditDialog,
    ),
  };

  updateBookmark(bookmark, id) {
    const bookmarkEntry = this.querySelector(`#bookmark-entry-${id}`);
    const bookmarkTitle = bookmarkEntry.querySelector(".bookmark-title");
    const bookmarkDescription = bookmarkEntry.querySelector(
      ".bookmark-description",
    );

    bookmarkTitle.textContent = bookmark.pageTitle;
    bookmarkDescription.textContent = bookmark.metaDescription;
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
    const { bookmarksContainer } = this.#elements;

    window.addEventListener("storage", (event) => {
      if (event.key === "bookmarks:linkstack") {
        this.#renderBookmarks();
      }
    });

    bookmarksContainer.addEventListener("click", (event) => {
      if (event.target.id === "delete-bookmark") {
        const { id } = event.target.dataset;
        this.#deleteBookmark(id);
      }

      if (event.target.id === "edit-bookmark") {
        const { id } = event.target.dataset;
        const { linkstackEditDialog } = this.#elements;

        if (!linkstackEditDialog) {
          throw new Error("Linkstack edit dialog not found");
        }

        const editBookmarkEvent = new CustomEvent("edit-bookmark", {
          detail: { id },
        });

        linkstackEditDialog.dispatchEvent(editBookmarkEvent);
      }
    });
  }

  #deleteBookmark(id) {
    const localStorageKey = "bookmarks:linkstack";
    const bookmarksInStorage = localStorage.getItem(localStorageKey);

    let storedBookmarks = JSON.parse(bookmarksInStorage);
    storedBookmarks = storedBookmarks.filter((bookmark) => bookmark.id !== id);

    localStorage.setItem(localStorageKey, JSON.stringify(storedBookmarks));
    this.querySelector(`#bookmark-entry-${id}`).remove();

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

    if (!bookmarksContainer) {
      return;
    }

    try {
      const bookmarksInStorage = localStorage.getItem(localStorageKey);

      if (!bookmarksInStorage || !JSON.parse(bookmarksInStorage).length) {
        this.#showNoBookmarks();
        return;
      }

      if (bookmarksInStorage) {
        const storedBookmarks = JSON.parse(bookmarksInStorage).toReversed();
        const bookmarks = storedBookmarks.map((bookmark) => {
          const entry = entryTmpl.content.cloneNode(true);
          const bookmarkLink = entry.querySelector(".bookmark-link");
          const deleteBookmark = entry.querySelector("#delete-bookmark");
          const editBookmark = entry.querySelector("#edit-bookmark");

          entry.querySelector(".bookmark-img").src = bookmark.previewImg;

          bookmarkLink.href = bookmark.url;
          bookmarkLink.querySelector(".bookmark-title").textContent =
            bookmark.pageTitle;

          entry.querySelector(".bookmark-description").textContent =
            bookmark.metaDescription;

          deleteBookmark.dataset.id = bookmark.id;
          editBookmark.dataset.id = bookmark.id;

          entry.querySelector(".bookmark-entry").id =
            `bookmark-entry-${bookmark.id}`;

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

customElements.define("linkstack-bookmarks", LinkStackBookmarks);
