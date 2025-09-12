import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, removeMany, set, arrayMove, add } from "@Utils/Array";

function createFolder(name) {
	const folderId = crypto.randomUUID();
	const folder = { id: folderId, name, items: [] };
	const bookmark = { id: crypto.randomUUID(), folderId };
	return { folder, bookmark };
}

function createBookmark(path, name) {
	const id = crypto.randomUUID();
	const bookmark = { id, path };
	if (name) bookmark.name = name;
	return bookmark;
}

function createSubFolder(id) {
	return {
		id: crypto.randomUUID(),
		folderId: id
	};
}

export default {
	state: {
		bookmarks: [],
		folders: []
	},
	selectors: {
		bookmarks: state => state.bookmarks,
		folders: state => state.folders
	},
	actions: {
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
		moveTabToBookmark(tabId, bookmarkId, pos) {
			if (!tabId || !bookmarkId) return;
			let bookmarkIndex = this.getBookmarkIndex(bookmarkId);
			if (bookmarkIndex === -1) return;
			const tab = this.getTab(tabId);
			if (!tab) return;

			if (pos === "after") bookmarkIndex++;

			this.addBookmark(tab.path, null, bookmarkIndex);
		},
		moveTabToFolder(tabId, folderId, bookmarkId, pos) {
			if (!tabId || !folderId) return;
			const tab = this.getTab(tabId);
			if (!tab) return;
			const folder = this.getFolder(folderId);
			if (!folder) return;
			let bookmarkIndex = folder.items.findIndex(a => a.id === bookmarkId);
			if (bookmarkIndex === -1);
			if (pos === "after") bookmarkIndex++;
			this.addToFolder(folderId, tab.path, null, bookmarkIndex);
		},

		addBookmark(path, name, index) {
			if (!path) return;
			const bookmark = createBookmark(path, name);
			this.setState({ bookmarks: add(this.state.bookmarks, bookmark, index) });
		},
		getBookmarkIndex(id) {
			return this.state.bookmarks.findIndex(a => a.id === id);
		},
		getFolderIndex(id) {
			return this.state.folders.findIndex(a => a.id === id);
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
		getFolder(id) {
			const index = this.getFolderIndex(id);
			if (index === -1) return;
			return this.state.folders[index];
		},

		moveFolderOutsideFolder(id, bookmarkId, parentId, pos) {
			if (!bookmarkId || !id || !parentId) return;
			const parentFolder = this.getFolder(parentId);
			if (!parentFolder) return;

			const itemIndex = parentFolder.items.findIndex(a => a.folderId === id);
			if (itemIndex === -1) return;
			const item = parentFolder.items[itemIndex];

			let bookmarkIndex = this.getBookmarkIndex(bookmarkId);
			if (bookmarkIndex === -1) return;
			if (pos === "after") bookmarkIndex++;

			this.removeItemFromFolder(parentId, item.id);
			this.setState({ bookmarks: add(this.state.bookmarks, createSubFolder(id), bookmarkIndex) });
		},
		moveBookmarkOutsideFolder(id, bookmarkId, parentId, pos) {
			if (!bookmarkId || !id || !parentId) return;
			const item = this.getFolderItem(parentId, id);
			if (!item) return;

			let bookmarkIndex = this.getBookmarkIndex(bookmarkId);
			if (bookmarkIndex === -1) return;
			if (pos === "after") bookmarkIndex++;

			this.addBookmark(item.path, item.name, bookmarkIndex);
			this.removeItemFromFolder(parentId, id);
		},
		moveBookmarkFolderToFolderAt(bookmarkId,folderId, targetFolderId, folderItemId, pos) {
			if (!bookmarkId || !targetFolderId || !folderItemId) return;

			const folder = this.getBookmark(bookmarkId);
			if (!folder) return;

			const folderIndex = this.state.bookmarks.findIndex(a => a.id === bookmarkId);
			if (folderIndex === -1) return;

			this.removeBookmark(this.state.bookmarks[folderIndex].id);

			const targetFolder = this.getFolder(targetFolderId);
			if (!targetFolder) return;

			let posIndex = targetFolder.items.findIndex(a => a.id === folderItemId);
			if (posIndex === -1);
			if (pos === "after") posIndex++;

			this.addFolderToFolder(folderId, targetFolderId, posIndex);
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
		moveFolderFromFolderToFolderAt(folderId, targetFolderId, parentFolderId, folderItemId, pos) {
			if (!folderId || !targetFolderId || !parentFolderId || !folderItemId) return;
			const folder = this.getFolder(folderId);
			if (!folder) return;

			const parentFolder = this.getFolder(parentFolderId);
			if (!parentFolder) return;

			const folderIndexInParent = parentFolder.items.findIndex(a => a.folderId === folderId);
			if (folderIndexInParent === -1) return;

			this.removeItemFromFolder(parentFolderId, parentFolder.items[folderIndexInParent].id);

			const targetFolder = this.getFolder(targetFolderId);
			if (!targetFolder) return;

			let posIndex = targetFolder.items.findIndex(a => a.id === folderItemId);
			if (posIndex === -1);
			if (pos === "after") posIndex++;

			this.addFolderToFolder(folderId, targetFolderId, posIndex);
		},
		moveBookmarkFromFolderToFolderAt(id, folderId, parentId, bookmarkId, pos) {
			if (!folderId || !id || !parentId) return;
			const folder = this.getFolder(folderId);
			if (!folder) return;
			let posIndex = folder.items.findIndex(a => a.id === bookmarkId);
			if (posIndex === -1);
			if (pos === "after") posIndex++;

			this.moveBookmarkFromFolderToFolder(id, folderId, parentId, posIndex);
		},
		moveBookmarkFromFolderToFolder(id, folderId, parentId, index) {
			if (!folderId || !id || !parentId) return;
			const item = this.getFolderItem(parentId, id);
			if (!item) return;
			this.addToFolder(folderId, item.path, item.name, index);
			this.removeItemFromFolder(parentId, id);
		},

		moveBookmarkToFolderAt(bookmarkId, folderId, folderItemId, pos) {
			if (!bookmarkId || !folderId || !folderItemId) return;
			const bookmark = this.getBookmark(bookmarkId);
			const folder = this.getFolder(folderId);
			if (!folder || !bookmark) return;

			let itemIndex = folder.items.findIndex(a => a.id === folderItemId);
			if (itemIndex === -1) return;
			if (pos === "after") itemIndex++;

			this.removeBookmark(bookmarkId);
			this.addToFolder(folderId, bookmark.path, bookmark.name, itemIndex);
		},
		moveBookmarkToFolder(id, folderId, parentId) {
			if (!folderId || !id) return;
			if (parentId) return this.moveBookmarkFromFolderToFolder(id, folderId, parentId);
			const bookmark = this.getBookmark(id);
			const folder = this.getFolder(folderId);
			if (!folder || !bookmark) return;
			this.removeBookmark(id);
			this.addToFolder(folderId, bookmark.path, bookmark.name);
		},
		removeItemFromFolder(folderId, id) {
			if (!folderId || !id) return;
			const { folders } = this.state;
			const folderIndex = this.state.folders.findIndex(a => a.id === folderId);
			if (folderIndex === -1) return;
			const folder = folders[folderIndex];

			const itemIndex = folder.items.findIndex(a => a.id === id);
			if (itemIndex === -1) return;

			const nfolder = Object.assign({}, folder, { items: remove(folder.items, itemIndex) });
			this.setState({ folders: set(this.state.folders, folderIndex, nfolder) });
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
		removeBookmark(id, parentId) {
			if (parentId) return this.removeItemFromFolder(parentId, id);
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
		removeFolder(id) {
			const folders = this.state.folders;
			const bookmarks = this.state.bookmarks;

			const folderIndex = folders.findIndex(a => a.id === id);
			if (folderIndex === -1) return;

			const indices = [
				folderIndex,
				...folders[folderIndex].items
					.filter(a => a.folderId)
					.map(({ folderId }) => {
						return TabbysStore.state.folders.findIndex(({ id }) => folderId === id);
					})
			];

			const bookmarkIndex = bookmarks.findIndex(a => a.folderId === id);
			if (bookmarkIndex === -1) return;

			this.setState({
				folders: removeMany(folders, indices),
				bookmarks: remove(bookmarks, bookmarkIndex)
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
		addToFolder(id, path, name, targetIndex) {
			if (!id || !path) return;
			const folders = this.state.folders;
			const index = folders.findIndex(a => a.id === id);
			if (index === -1) return;

			const folder = folders[index];
			if (!folder) return;

			const nfolder = { ...folder, items: add(folder.items, createBookmark(path, name), targetIndex) };
			this.setState({ folders: set(folders, index, nfolder) });
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
