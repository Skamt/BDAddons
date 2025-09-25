import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, removeMany, set, arrayMove, add } from "@Utils/Array";
import { createObjFromPath, addBy, mergeArrayItem, setArrayItem, reOrder } from "./shared";
import { parsePath } from "@/utils";

function createFromBookmark(bookmark) {
	return Object.assign({}, bookmark, { id: crypto.randomUUID() });
}

const getters = {
	getBookmarkIndex(id) {
		return this.state.bookmarks.findIndex(bookmark => bookmark.id === id);
	},
	getBookmark(id) {
		return this.state.bookmarks[this.getBookmarkIndex(id)];
	},
	getBookmarkMeta(id) {
		return meta(this.state.bookmarks, bookmark => bookmark.id === id);
	},
	getBookmarksCount() {
		return this.state.bookmarks.length;
	}
};

const setters = {
	setBookmarks(bookmarks) {
		if (bookmarks && Array.isArray(bookmarks)) this.setState({ bookmarks });
	},
	setBookmark(bookmarkId, payload) {
		this.setState({ bookmarks: setArrayItem(this.state.bookmarks, bookmarkId, payload) });
	},
	updateBookmark(bookmarkId, payload) {
		this.setState({ tabs: mergeArrayItem(this.state.bookmarks, bookmarkId, payload) });
	},
	setBookmarkName(bookmarkId, name) {
		if (name) this.updateBookmark(bookmarkId, { name });
	}
};

export default {
	state: {
		bookmarks: []
	},
	selectors: {
		bookmarks: state => state.bookmarks
	},
	actions: {
		...getters,
		...setters,

		reOrderBookmarks(fromId, toId, pos) {
			this.setBookmarks(reOrder(this.state.bookmarks, fromId, toId, pos));
		},

		addBookmarkBy(targetId, bookmark, fn = a => a) {
			this.setState({ bookmarks: addBy(this.state.bookmarks, targetId, bookmark, fn) });
		},

		addBookmark(path) {
			const bookmark = createObjFromPath(path);
			this.addBookmarkBy(null, bookmark);
		},

		removeBookmark(id) {
			const bookmarks = this.state.bookmarks;
			const index = bookmarks.findIndex(a => a.id === id);
			if (index === -1) return;
			this.setState({ bookmarks: remove(bookmarks, index) });
		},

		/*===============*/
		/*===============*/
		/*===============*/

		setBookmarkName(id, name) {
			if (!name || !id) return;
			const bookmarks = this.state.bookmarks;
			const index = bookmarks.findIndex(a => a.id === id);
			if (index === -1) return;
			this.setState({ bookmarks: set(bookmarks, index, Object.assign({}, bookmarks[index], { name })) });
		}
	}
};
