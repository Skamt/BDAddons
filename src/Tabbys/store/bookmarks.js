import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, set, add } from "@Utils/Array";

function createFolder(name) {
	const folderId = crypto.randomUUID();
	const folder = { id: folderId, name, items:[] };
	const bookmark = { id: crypto.randomUUID(), folderId };
	return { folder, bookmark };
}

function createBookmark(path, name) {
	const id = crypto.randomUUID();
	return { id, path, name };
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
		openBookmark(id){
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
		getFolderItem(folderId, id) {
			if (!folderId || !id) return;
			const folders = this.state.folders;
			const folderIndex = folders.findIndex(a => a.id === folderId);
			if (folderIndex === -1) return;
			const folder = folders[folderIndex];
			const itemIndex = folders.findIndex(a => a.id === folderId);
			if (itemIndex === -1) return;
			return folder.items[itemIndex];
		},
		removeBookmark(id) {
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

			const bookmarkIndex = bookmarks.findIndex(a => a.folderId === id);
			if (bookmarkIndex === -1) return;

			this.setState({
				folders: remove(folders, folderIndex),
				bookmarks: remove(bookmarks, bookmarkIndex)
			});
		},
		addToFolder(id, payload) {
			if (!payload) return;
			const folders = this.state.folders;
			const index = folders.findIndex(a => a.id === id);
			if (index === -1) return;

			const folder = folders[index];
			if (!folder) return;

			const nfolder = { ...folder, items: add(folder.items, payload) };
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
