import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, removeMany, set, arrayMove, add } from "@Utils/Array";

export function createFolder(name) {
	const folderId = crypto.randomUUID();
	const folder = { id: folderId, name, items: [] };
	const bookmark = { id: crypto.randomUUID(), folderId };
	return { folder, bookmark };
}

export function createBookmark(payload) {
	const id = crypto.randomUUID();
	return { ...payload, id };
}

export default {
	state: {
		bookmarks: []
	},
	selectors: {
		bookmarks: state => state.bookmarks
	},
	actions: {
		addBookmarkBy(payload, targetId, fn = a => a) {
			const bookmark = createBookmark(payload);
			const targetIndex = targetId ? this.getBookmarkIndex(targetId) : this.state.bookmarks.length;
			if (targetIndex === -1) return;
			this.setState({ bookmarks: add(this.state.bookmarks, bookmark, fn(targetIndex)) });
		},
		addBookmark(payload) {
			this.addBookmarkBy(payload);
		},
		moveBookmark(fromId, toId, pos) {
			if (!fromId || !toId) return;

			const fromIndex = this.state.bookmarks.findIndex(a => a.id === fromId);
			let toIndex = this.state.bookmarks.findIndex(a => a.id === toId);
			if (fromIndex === -1 || toIndex === -1) return;
			if (pos === "before" && toIndex > fromIndex) {
				toIndex--;
			}
			if (pos === "after" && toIndex < fromIndex) {
				toIndex++;
			}

			this.setState({ bookmarks: arrayMove(this.state.bookmarks, fromIndex, toIndex) });
		},
		/*===============*/
		/*===============*/
		/*===============*/

		openBookmark(id) {
			const bookmark = this.getBookmark(id);
			if (!bookmark) return;
			this.addTab(bookmark.path);
		},
		swapBookmark(from, to) {
			if (!from || !to) return;
			const fromIndex = this.state.bookmarks.findIndex(a => a.id === from);
			const toIndex = this.state.bookmarks.findIndex(a => a.id === to);
			this.setState({ bookmarks: arrayMove(this.state.bookmarks, fromIndex, toIndex) });
		},
		moveTabToBookmark(tabId, bookmarkId, pos) {
			if (!tabId || !bookmarkId) return;
			let bookmarkIndex = this.getBookmarkIndex(bookmarkId);
			if (bookmarkIndex === -1) return;
			const tab = this.getTab(tabId);
			if (!tab) return;

			if (pos === "after") bookmarkIndex++;

			this.addBookmark(tab.path, null, bookmarkIndex);
		},
		getBookmarkIndex(id) {
			return this.state.bookmarks.findIndex(a => a.id === id);
		},

		setBookmarkName(id, name) {
			if (!name || !id) return;
			const bookmarks = this.state.bookmarks;
			const index = bookmarks.findIndex(a => a.id === id);
			if (index === -1) return;
			this.setState({ bookmarks: set(bookmarks, index, Object.assign({}, bookmarks[index], { name })) });
		},
		getBookmark(id) {
			const index = this.getBookmarkIndex(id);
			if (index === -1) return;
			return this.state.bookmarks[index];
		},

		moveFolderToFolder(id, folderId, parentId) {
			if (!folderId || !id) return;

			if (parentId) {
				const parentFolder = this.getFolder(parentId);
				if (!parentFolder) return;

				const folderItemIdInParentIndex = parentFolder.items.findIndex(a => a.folderId === id);
				if (folderItemIdInParentIndex === -1) return;
				this.removeItemFromFolder(parentId, parentFolder.items[folderItemIdInParentIndex].id);
			} else {
				const folderIndex = this.state.bookmarks.findIndex(a => a.folderId === id);
				if (folderIndex === -1) return;
				this.removeBookmark(this.state.bookmarks[folderIndex].id, parentId);
			}
			this.addFolderToFolder(id, folderId);
		},

		getFolderItem(folderId, id) {
			if (!folderId || !id) return;
			const folders = this.state.folders;
			const folderIndex = folders.findIndex(a => a.id === folderId);
			if (folderIndex === -1) return;
			const folder = folders[folderIndex];
			const itemIndex = folder.items.findIndex(a => a.id === id);
			if (itemIndex === -1) return;
			return folder.items[itemIndex];
		},
		removeBookmark(id) {
			// if (parentId) return this.removeItemFromFolder(parentId, id);
			const bookmarks = this.state.bookmarks;
			const index = bookmarks.findIndex(a => a.id === id);
			if (index === -1) return;
			this.setState({ bookmarks: remove(bookmarks, index) });
		},
		addFolder(name, index) {
			if (!name) return;
			const { folder, bookmark } = createFolder(name);
			this.setState({
				folders: add(this.state.folders, folder),
				bookmarks: add(this.state.bookmarks, bookmark, index)
			});
		},
		addFolderToFolder(id, folderId, index) {
			const childFolder = this.getFolder(id);
			if (!childFolder) return;

			const { folders } = this.state;
			const parentFolderIndex = folders.findIndex(a => a.id === folderId);
			if (parentFolderIndex === -1) return;
			const parentFolder = folders[parentFolderIndex];

			const nfolder = { ...parentFolder, items: add(parentFolder.items, createSubFolder(childFolder.id), index) };
			this.setState({ folders: set(folders, parentFolderIndex, nfolder) });
		},
		setFolderName(id, name) {
			if (!name || !id) return;
			const folders = this.state.folders;
			const index = folders.findIndex(a => a.id === id);
			if (index === -1) return;

			this.setState({ folders: set(folders, index, Object.assign({}, folders[index], { name })) });
		}
	}
};
