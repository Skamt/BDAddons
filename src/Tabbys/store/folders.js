import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, removeMany, set, arrayMove, add } from "@Utils/Array";
import { addBy, mergeArrayItem, setArrayItem, createSubBookmark, createBookmarkFolder, reOrder } from "./shared";

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
	getFolderItems(folderId) {
		const folder = this.getFolder(folderId);
		if (!folder) return;
		return folder.items;
	},
	getFolderItem(folderId, itemId) {
		const folder = this.getFolder(folderId);
		if (!folder) return;
		const itemIndex = this.getFolderItemIndex(folderId, itemId);
		return folder.items[itemIndex];
	}
};

const setters = {
	setFolders(folders) {
		if (folders && Array.isArray(folders)) this.setState({ folders });
	},
	setFolder(folderId, payload) {
		this.setState({ folders: setArrayItem(this.state.folders, folderId, payload) });
	},
	updateFolder(folderId, payload) {
		this.setState({ folders: mergeArrayItem(this.state.folders, folderId, payload) });
	},
	setFolderName(folderId, name) {
		if (name) this.updateFolder(folderId, { name });
	},
	setFolderItems(folderId, items) {
		if (items && Array.isArray(items)) this.updateFolder(folderId, { items });
	},
	setFolderItem(folderId, itemId, payload) {
		const items = this.getFolderItems(folderId);
		this.setFolderItems(folderId, setArrayItem(items, itemId, payload));
	},
	updateFolderItem(folderId, itemId, payload) {
		const items = this.getFolderItems(folderId);
		this.setFolderItems(folderId, mergeArrayItem(items, itemId, payload));
	}
};

export default {
	state: {
		folders: []
	},
	selectors: {
		folders: state => state.folders
	},
	actions: {
		...getters,
		...setters,

		addFolder(name) {
			const { folder, bookmark } = createFolder(name);
			this.setState({
				folders: add(this.state.folders, folder)
			});
		},
		reOrderFolder(folderId, fromId, toId, pos) {
			const items = this.getFolderItems(folderId);
			this.setFolderItems(folderId, reOrder(items, fromId, toId, pos));
		},
		

		addToFolderBy(folderId, bookmark, targetId, fn) {
			const items = this.getFolderItems(folderId);
			if (items) this.updateFolder(folderId, { items: addBy(items, targetId, bookmark, fn) });
		},

		addToFolder(folderId, path) {
			this.addToFolderBy(folderId, createSubBookmark(folderId, path));
		},

		addFolderToFolder(parentId, folderId) {
			this.addToFolderBy(parentId, createBookmarkFolder(folderId, parentId));
		},

		removeItemFromFolder(folderId, itemId) {
			const folder = this.getFolder(folderId);
			if (!folder) return;

			const itemIndex = this.getFolderItemIndex(folderId, itemId);
			if (itemIndex === -1) return;
			const item = folder.items[itemIndex];

			this.updateFolder(folderId, { items: remove(folder.items, itemIndex) });
		},

		deleteFolder(folderId) {
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
		}	
	}
};
