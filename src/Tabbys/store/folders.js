import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, removeMany, set, arrayMove, add } from "@Utils/Array";
import { createBookmark } from "./bookmarks";

const getters = {
	getFolderIndex(folderId) {
		return this.state.folders.findIndex(a => a.id === folderId);
	},
	getFolder(folderId) {
		return this.state.folders[this.getFolderIndex(folderId)];
	},
	getFolderItemIndex(folderId, itemId) {
		const folder = this.getFolder(folderId);
		if (!folder) return -1;
		return folder.items.findIndex(a => a.id === itemId);
	},
	getFolderItem(folderId, itemId) {
		const folder = this.getFolder(folderId);
		if (!folder) return;
		const itemIndex = this.getFolderItemIndex(folderId, itemId);
		return folder.items[itemIndex];
	},
	getFolderIndexInFolder(folderId) {}
};

export function createFolderBookmark(folderId, payload) {
	const id = crypto.randomUUID();
	return { ...payload, id, parentId: folderId };
}

function move(arr, fromId, toId, pos) {
	const fromIndex = arr.findIndex(a => a.id === fromId);
	let toIndex = arr.findIndex(a => a.id === toId);
	if (fromIndex === -1 || toIndex === -1) return;
	if (pos === "before" && toIndex > fromIndex) {
		toIndex--;
	}
	if (pos === "after" && toIndex < fromIndex) {
		toIndex++;
	}

	return { fromIndex, toIndex };
}

export default {
	state: {
		folders: []
	},
	selectors: {
		folders: state => state.folders
	},
	actions: {
		...getters,
		setFolder(folderId, payload) {
			const { folders } = this.state;
			const folderIndex = this.getFolderIndex(folderId);
			const folder = folders[folderIndex];
			if (!folder) return;

			const nfolder = Object.assign({}, folder, payload);

			this.setState({ folders: set(folders, folderIndex, nfolder) });
		},
		addToFolderBy(folderId, payload, targetId, fn = a => a) {
			const folder = this.getFolder(folderId);
			if (!folder) return;

			const targetIndex = targetId ? this.getFolderItemIndex(folderId, targetId) : folder.items.length;
			if (targetIndex === -1) return;

			this.setFolder(folderId, {
				items: add(folder.items, createFolderBookmark(folderId, payload), fn(targetIndex))
			});
		},
		addToFolder(folderId, payload) {
			this.addToFolderBy(folderId, payload);
		},
		addToFolderAt(folderId, payload, index) {
			this.addToFolderBy(folderId, payload, null, () => index);
		},
		addToFolderAfter(folderId, targetId, payload) {
			this.addToFolderBy(folderId, payload, targetId, i => i + 1);
		},
		addToFolderBefore(folderId, targetId, payload) {
			this.addToFolderBy(folderId, payload, targetId);
		},
		addTabToFolder(tabId, folderId) {
			const tab = this.getTab(tabId);
			if (tab) this.addToFolder(folderId, tab);
		},
		removeItemFromFolder(folderId, itemId) {
			const folder = this.getFolder(folderId);
			if (!folder) return;

			const itemIndex = this.getFolderItemIndex(folderId, itemId);
			if (itemIndex === -1) return;
			const item = folder.items[itemIndex];
			// if (item.folderId) this.removeFolder(item.folderId);
			this.setFolder(folderId, { items: remove(folder.items, itemIndex) });
		},

		removeFolder(folderId) {
			const { folders } = this.state;

			const folderIndex = this.getFolderIndex(folderId);
			if (folderIndex === -1) return;

			const getIndices = folderId => {
				const folder = this.getFolder(folderId);

				let index = folder.items.length;
				const indices = [];
				while (index--) {
					const item = folder.items[index];
					if (!item.folderId) continue;

					indices.push(this.getFolderIndex(item.folderId), ...getIndices(item.folderId));
				}
				return indices;
			};

			const indices = getIndices(folderId);

			this.setState({ folders: removeMany(folders, [folderIndex, ...indices]) });
		},

		removeFolderFromBookmarkBar(folderId, bookmarkId) {
			const folderIndex = this.getFolderIndex(folderId);
			if (folderIndex === -1) return;
			const bookmarkIndex = this.getBookmarkIndex(bookmarkId);
			if (bookmarkIndex === -1) return;

			this.setState({ bookmarks: remove(this.state.bookmarks, bookmarkIndex) });
			// this.removeFolder(folderId);
		},

		removeFolderFromFolder(folderId, parentId) {
			const folderIndex = this.getFolderIndex(folderId);
			if (folderIndex === -1) return;

			const parentIndex = this.getFolderIndex(parentId);
			if (parentIndex === -1) return;

			const parentFolder = this.state.folders[parentIndex];
			const folderIndexInParent = parentFolder.items.findIndex(a => a.folderId === folderId);
			if (folderIndexInParent === -1) return;

			const nfolder = Object.assign({}, parentFolder, {
				items: remove(parentFolder.items, folderIndexInParent)
			});

			this.setState({ folders: set(this.state.folders, parentIndex, nfolder) });
			this.removeFolder(folderId);
		},

		moveBookmarkToFolder(folderId, bookmarkId) {
			const bookmark = this.getBookmark(bookmarkId);
			const folder = this.getFolder(folderId);
			if (!folder || !bookmark) return;
			this.removeBookmark(bookmarkId);
			this.addToFolder(folderId, bookmark);
		},

		moveBookmarkbarFolderToFolder(folderId, bookmarkId, targetFolderId) {
			this.removeBookmark(bookmarkId);
			this.addToFolder(targetFolderId, { folderId });
		},

		moveFolderBookmark(folderId, fromId, toId, pos) {
			const folder = this.getFolder(folderId);
			if (!folder) return;

			const { fromIndex, toIndex } = move(folder.items, fromId, toId, pos);

			this.setFolder(folderId, { items: arrayMove(folder.items, fromIndex, toIndex) });
		}
	}
};
