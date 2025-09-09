import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, set, add } from "@Utils/Array";

function createFolder(name) {
	const folderId = crypto.randomUUID();
	const folder = { id: folderId, name, items: [] };
	const bookmark = { id: crypto.randomUUID(), folderId };
	return { folder, bookmark };
}

function createBookmark(path, name) {
	const id = crypto.randomUUID();
	const bookmark = { id, path };
	if(name) bookmark.name = name;
	return bookmark;
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
		addBookmark(path, name) {
			if (!path) return;
			const bookmark = createBookmark(path, name);
			this.setState({ bookmarks: add(this.state.bookmarks, bookmark) });
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
		moveBookmarkFromFolderToFolder(id, folderId, parentId) {
			if (!folderId || !id || !parentId) return;
			const item = this.getFolderItem(parentId, id);
			if (!item) return;
			this.addToFolder(folderId, item.path, item.name);
			this.removeItemFromFolder(parentId, id);
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
			if(parentId) return this.removeItemFromFolder(parentId, id)
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
		addToFolder(id, path, name) {
			if (!id || !path) return;
			const folders = this.state.folders;
			const index = folders.findIndex(a => a.id === id);
			if (index === -1) return;

			const folder = folders[index];
			if (!folder) return;

			const nfolder = { ...folder, items: add(folder.items, createBookmark(path, name)) };
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
