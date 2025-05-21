import List from "@Utils/List";

const bookmarksList = new List();

const store = (set) => ({
	bookmarks: [],

	clearBookmarks() {
		bookmarksList.clear();
		set({ bookmarks: bookmarksList.list });
	},

	setBookmarks(list = []) {
		bookmarksList.setList(list);
		set({ bookmarks: bookmarksList.list });
	},
	addBookmark(bookmark) {
		bookmarksList.addItem(bookmark);
		set({ bookmarks: bookmarksList.list });
	},
	addBookmarkAtIndex(bookmark, index) {
		bookmarksList.addItemAtIndex(bookmark, index);
		set({ bookmarks: bookmarksList.list });
	},
	removeBookmark(id) {
		bookmarksList.removeItemByIdentifier(id);
		set({ bookmarks: bookmarksList.list });
	},
	setBookmark(id, payload) {
		bookmarksList.setItemById(id, payload);
		set({ bookmarks: bookmarksList.list });
	},
	swapBookmark(fromId, toId) {
		bookmarksList.swapItemById(fromId, toId);
		set({ bookmarks: bookmarksList.list });
	},
	getBookmark(id) {
		return bookmarksList.getItemById(id);
	}
});

const selectors = {
	bookmarks: state => state.bookmarks
};

export default {
	store,
	selectors
};
