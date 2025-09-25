import Store from "@/store";
import { remove, slice, arrayMove, meta, set, add } from "@Utils/Array";
import { sort, createFrom, createSubBookmark, createFolder, createBookmarkFolder, createObjFromPath } from "./shared";

export function ensureTab() {
	if (Store.getTabsCount() > 0) return;
	const tab = createObjFromPath(location.pathname);
	Store.setState({ tabs: [tab], selectedId: tab.id });
}

export function cloneBookmark({ path, name }) {
	const bookmark = { path };
	if (name) bookmark.name = name;
	return bookmark;
}

// export function createFolder(name) {
// 	const id = crypto.randomUUID();
// 	const folder = { id, name, items: [] };
// 	const bookmark = { id: crypto.randomUUID(), folderId: id };
// 	return { folder, bookmark };
// }

export function bookmarkTab(tabId, folderId) {
	const tab = Store.getTab(tabId);
	if (tab?.path) Store.addBookmark({ path: tab.path });
}

export function addFolder(name) {
	if (!name) return;
	const folder = createFolder(name);
	const bookmark = createBookmarkFolder(folder.id);
	Store.setState({
		folders: add(Store.state.folders, folder),
		bookmarks: add(Store.state.bookmarks, bookmark)
	});
}

window.t = addFolder;

export function removeTabsToRight(id) {
	const { item, index, isLast, isSingle } = Store.getTabMeta(id);
	if (!item || isLast || isSingle) return;

	const newSelected = Store.getSelectedTabIndex() < index + 1 ? Store.state.selectedId : id;
	Store.setState({ tabs: slice(Store.state.tabs, 0, index + 1), selectedId: newSelected, lastSelectedIdAfterNewTab: null });
}

export function removeTabsToLeft(id) {
	const { item, index, isFirst, isSingle, length } = Store.getTabMeta(id);
	if (!item || isFirst || isSingle) return;

	const newSelected = Store.getSelectedTabIndex() > index ? Store.state.selectedId : id;
	Store.setState({ tabs: slice(Store.state.tabs, index, length), selectedId: newSelected, lastSelectedIdAfterNewTab: null });
}

export function removeOtherTabs(id) {
	const tab = Store.getTab(id);
	if (tab) Store.setState({ tabs: [tab], selectedId: tab.id, lastSelectedIdAfterNewTab: null });
}

export function openBookmark(bookmarkId, folderId) {
	const bookmark = folderId ? Store.getFolderItem(folderId, bookmarkId) : Store.getBookmark(bookmarkId);
	if (bookmark?.path) Store.addTab(bookmark.path);
}

export function openBookmarkAt(targetId, bookmarkId, folderId, pos) {
	const bookmark = folderId ? Store.getFolderItem(folderId, bookmarkId) : Store.getBookmark(bookmarkId);
	if (bookmark?.path) Store.addTabBy(targetId, createObjFromPath(bookmark.path), sort(pos));
}

export function bookmarkTabAt(targetId, tabId, pos) {
	const tab = Store.getTab(tabId);
	if (tab?.path) Store.addBookmarkBy(targetId, createObjFromPath(tab.path), sort(pos));
}

export function moveSubBookmarkToBookmarksAt(targetId, itemId, parentId, pos) {
	const subBookmark = Store.getFolderItem(parentId, itemId);
	if (!subBookmark) return;
	Store.addBookmarkBy(targetId, createFrom(subBookmark, { parentId: null }), sort(pos));
	Store.removeItemFromFolder(parentId, itemId);
}

export function moveSubFolderToBookmarksAt(targetId, subFolderId, itemId, parentId, pos) {
	const folder = createBookmarkFolder(subFolderId);
	Store.addBookmarkBy(targetId, folder, sort(pos));
	Store.removeItemFromFolder(parentId, itemId);
	Store.updateFolder(subFolderId, { parentId: null });
}

// export function moveToBookmarks(targetId, bookmarkId, parentId) {
// 	const subBookmark = Store.getFolderItem(parentId, bookmarkId);
// 	if (!subBookmark) return;
// 	Store.addBookmarkBy(null, cloneBookmark(subBookmark));
// 	Store.removeItemFromFolder(parentId, bookmarkId);
// }


export function addTabToFolderAt(tabId, folderId, target, pos) {
	const tab = Store.getTab(tabId);
	Store.addToFolderBy(target, folderId, createFrom(tab, { parentId: folderId }), sort(pos));
}

export function moveSubBookmarkToFolderAt(itemId, targetFolderId, parentId, targetId, pos) {
	const bookmark = parentId ? Store.getFolderItem(parentId, itemId) : Store.getBookmark(itemId);
	if (parentId) Store.removeItemFromFolder(parentId, itemId);
	else Store.removeBookmark(itemId);
	Store.addToFolderBy(targetId, targetFolderId, createFrom(bookmark, { parentId: targetFolderId }), sort(pos));
}

function isDescendent(parentId, childId) {
	const child = Store.getFolder(childId);
	if (!child.parentId) return false;
	if (child.parentId === parentId) return true;
	return isDescendent(parentId, child.parentId);
}

export function moveFolderToFolderAt(folderId, itemId, targetFolderId, parentId, targetId, pos) {
	if (isDescendent(folderId, targetFolderId)) return;

	if (parentId) Store.removeItemFromFolder(parentId, itemId);
	else Store.removeBookmark(itemId);

	Store.addToFolderBy(targetId, targetFolderId, createBookmarkFolder(folderId, targetFolderId), sort(pos));

	Store.updateFolder(folderId, { parentId: targetFolderId });
}
