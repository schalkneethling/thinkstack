export class LinkStackEditDialog extends HTMLElement {
  static #selectors = {
    buttonCloseDialog: "#dialog-close",
    editBookmarkForm: "#edit-bookmark-form",
    editId: "#edit-id",
    editTitleInput: "#edit-title",
    editDescriptionInput: "#edit-description",
    editDialog: "dialog",
    linkstackBookmarks: "linkstack-bookmarks",
  };

  #localStorageKey = "bookmarks:linkstack";

  #elements = {
    buttonCloseDialog: this.querySelector(
      LinkStackEditDialog.#selectors.buttonCloseDialog,
    ),
    editBookmarkForm: this.querySelector(
      LinkStackEditDialog.#selectors.editBookmarkForm,
    ),
    editId: this.querySelector(LinkStackEditDialog.#selectors.editId),
    editTitleInput: this.querySelector(
      LinkStackEditDialog.#selectors.editTitleInput,
    ),
    editDescriptionInput: this.querySelector(
      LinkStackEditDialog.#selectors.editDescriptionInput,
    ),
    editDialog: this.querySelector(LinkStackEditDialog.#selectors.editDialog),
    linkstackBookmarks: document.querySelector(
      LinkStackEditDialog.#selectors.linkstackBookmarks,
    ),
  };

  constructor() {
    super();

    this.#addEventLsiterners();
  }

  #addEventLsiterners() {
    const { buttonCloseDialog, editBookmarkForm, editDialog } = this.#elements;

    this.addEventListener("edit-bookmark", (event) => {
      this.#editBookmark(event.detail.id);
    });

    buttonCloseDialog.addEventListener("click", () => {
      editDialog.close();
    });

    editBookmarkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(editBookmarkForm);
      this.#saveBookmarkChanges(formData);
    });
  }

  #getBookmarkData(id) {
    try {
      const bookmarksInStorage = localStorage.getItem(this.#localStorageKey);
      const storedBookmarks = JSON.parse(bookmarksInStorage);
      const bookmark = storedBookmarks.filter((bookmark) => bookmark.id === id);

      return bookmark[0];
    } catch (error) {
      throw new Error(`Error getting bookmark data: ${error.message}`);
    }
  }

  #saveBookmarkChanges(formData) {
    const { editDialog, linkstackBookmarks } = this.#elements;

    const id = formData.get("id");
    const pageTitle = formData.get("title");
    const metaDescription = formData.get("description");

    try {
      const bookmarksInStorage = localStorage.getItem(this.#localStorageKey);
      const storedBookmarks = JSON.parse(bookmarksInStorage);
      const bookmark = storedBookmarks.filter((bookmark) => bookmark.id === id);

      if (!bookmark.length) {
        throw new Error(`Bookmark with id ${id} not found`);
      }

      const updateIndex = storedBookmarks.findIndex(
        (bookmark) => bookmark.id === id,
      );
      const updatedBookmark = {
        ...bookmark[0],
        updatedAt: new Date().toISOString(),
        pageTitle,
        metaDescription,
      };

      storedBookmarks[updateIndex] = updatedBookmark;

      localStorage.setItem(
        this.#localStorageKey,
        JSON.stringify(storedBookmarks),
      );

      linkstackBookmarks.updateBookmark({ pageTitle, metaDescription }, id);
    } catch (error) {
      throw new Error(`Error saving bookmark changes: ${error.message}`);
    }

    editDialog.close();
  }

  #editBookmark(id) {
    const { editDialog, editId, editTitleInput, editDescriptionInput } =
      this.#elements;
    const bookmarkData = this.#getBookmarkData(id);

    editId.value = id;
    editTitleInput.value = bookmarkData.pageTitle || "";
    editDescriptionInput.value = bookmarkData.metaDescription || "";

    editDialog.showModal();
  }
}

customElements.define("linkstack-edit-dialog", LinkStackEditDialog);
