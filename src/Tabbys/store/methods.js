import Store from "@/store";
import { slice, add } from "@Utils/Array";
import { sort, createFrom, createFolder, createBookmarkFolder, createFromPath } from "./shared";
import { navigate } from "@/utils";

export function isDescendent(parentId, childId) {
	const child = Store.getFolder(childId);
	if (!child.parentId) return false;
	if (child.parentId === parentId) return true;
	return isDescendent(parentId, child.parentId);
}

export function deleteBookmark(itemId, parentId) {
	if (parentId) Store.removeItemFromFolder(parentId, itemId);
	else Store.removeBookmark(itemId);
}

export function deleteFolder(folderId, itemId, parentId) {
	Store.deleteFolder(folderId);
	deleteBookmark(itemId, parentId);
}

export function getBookmark(bookmarkId, folderId) {
	return folderId ? Store.getFolderItem(folderId, bookmarkId) : Store.getBookmark(bookmarkId);
}

export function setBookmarkName(bookmarkId, name, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	if (!bookmark) return;
	if (parentId) Store.updateFolderItem(parentId, bookmarkId, { name: name });
	else Store.updateBookmark(bookmarkId, { name: name });
}

export function getBookmarkNameState(bookmarkId, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	return bookmark?.noName;
}

export function toggleBookmarkNameState(bookmarkId, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	if (!bookmark) return;
	if (parentId) Store.updateFolderItem(parentId, bookmarkId, { noName: !bookmark.noName });
	else Store.updateBookmark(bookmarkId, { noName: !bookmark.noName });
}

export function ensureTab() {
	if (Store.getTabsCount() > 0) return;
	const tab = createFromPath(location.pathname);
	Store.setState({ tabs: [tab], selectedId: tab.id });
}

export function openBookmark(bookmarkId, folderId) {
	const bookmark = getBookmark(bookmarkId, folderId);
	if (bookmark) navigate(bookmark);
}

export function setTabFromBookmark(tabId, bookmarkId, folderId) {
	const { noName, id, ...bookmark } = getBookmark(bookmarkId, folderId) || {};
	if (bookmark) Store.updateTab(tabId, bookmark);

	Store.setSelectedId(tabId);
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

export function removeTabsToRight(id) {
	const { item, index, isLast, isSingle } = Store.getTabMeta(id);
	if (!item || isLast || isSingle) return;

	const newSelected = Store.getSelectedTabIndex() < index + 1 ? Store.state.selectedId : id;
	Store.setState({
		tabs: slice(Store.state.tabs, 0, index + 1),
		selectedId: newSelected,
		lastSelectedIdAfterNewTab: null
	});
}

export function removeTabsToLeft(id) {
	const { item, index, isFirst, isSingle, length } = Store.getTabMeta(id);
	if (!item || isFirst || isSingle) return;

	const newSelected = Store.getSelectedTabIndex() > index ? Store.state.selectedId : id;
	Store.setState({
		tabs: slice(Store.state.tabs, index, length),
		selectedId: newSelected,
		lastSelectedIdAfterNewTab: null
	});
}

export function removeOtherTabs(id) {
	const tab = Store.getTab(id);
	if (tab) Store.setState({ tabs: [tab], selectedId: tab.id, lastSelectedIdAfterNewTab: null });
}

export function openBookmarkAt(bookmarkId, targetId, pos, folderId) {
	const bookmark = getBookmark(bookmarkId, folderId);
	if (bookmark?.path) Store.addTabBy(createFromPath(bookmark.path), targetId, sort(pos));
}

export function bookmarkTabAt(tabId, targetId, pos) {
	const tab = Store.getTab(tabId);
	if (tab?.path) Store.addBookmarkBy(createFromPath(tab.path), targetId, sort(pos));
}

export function moveSubBookmarkToBookmarksAt(itemId, parentId, targetId, pos) {
	const subBookmark = Store.getFolderItem(parentId, itemId);
	if (!subBookmark) return;
	Store.addBookmarkBy(createFrom(subBookmark, { parentId: null }), targetId, sort(pos));
	Store.removeItemFromFolder(parentId, itemId);
}

export function moveSubFolderToBookmarksAt(subFolderId, itemId, parentId, targetId, pos) {
	const folder = createBookmarkFolder(subFolderId);
	Store.addBookmarkBy(folder, targetId, sort(pos));
	Store.removeItemFromFolder(parentId, itemId);
	Store.updateFolder(subFolderId, { parentId: null });
}

export function addTabToFolderAt(tabId, folderId, targetId, pos) {
	const tab = Store.getTab(tabId);
	Store.addToFolderBy(folderId, createFrom(tab, { parentId: folderId }), targetId, sort(pos));
}

export function moveBookmarkToFolderAt(itemId, targetFolderId, parentId, targetId, pos) {
	const bookmark = getBookmark(itemId, parentId);
	deleteBookmark(itemId, parentId);
	Store.addToFolderBy(targetFolderId, createFrom(bookmark, { parentId: targetFolderId }), targetId, sort(pos));
}

export function moveFolderToFolderAt(folderId, itemId, targetFolderId, parentId, targetId, pos) {
	if (isDescendent(folderId, targetFolderId)) return;
	deleteBookmark(itemId, parentId);

	Store.addToFolderBy(targetFolderId, createBookmarkFolder(folderId, targetFolderId), targetId, sort(pos));
	Store.updateFolder(folderId, { parentId: targetFolderId });
}
