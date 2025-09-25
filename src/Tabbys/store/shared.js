import { remove, slice, arrayMove, meta, set, add } from "@Utils/Array";
import { parsePath } from "@/utils";

function getArrayItemById(arr, id) {
	return arr.findIndex(a => a.id === id);
}

export function reOrder(arr, fromId, toId, pos) {
	const fromIndex = getArrayItemById(arr, fromId);
	let toIndex = getArrayItemById(arr, toId);
	if (fromIndex === -1 || toIndex === -1) return arr;

	if (pos === "before" && toIndex > fromIndex) toIndex--;
	if (pos === "after" && toIndex < fromIndex) toIndex++;

	return arrayMove(arr, fromIndex, toIndex);
}

export function addBy(arr, targetId, payload, fn = a => a) {
	const targetIndex = targetId ? getArrayItemById(arr, targetId) : arr.length;
	if (targetIndex === -1) return arr;
	return add(arr, payload, fn(targetIndex));
}

export function setArrayItem(arr, targetId, payload) {
	const tabIndex = getArrayItemById(arr, targetId);
	if (tabIndex === -1) return arr;
	return set(arr, tabIndex, payload);
}

export function mergeArrayItem(arr, targetId, payload) {
	const tabIndex = getArrayItemById(arr, targetId);
	const item = arr[tabIndex];
	if (!item) return arr;

	return set(arr, tabIndex, Object.assign({}, item, payload));
}

export function createFolder(name) {
	return { id: crypto.randomUUID(), name, items: [] };
}

export function createBookmarkFolder(folderId, parentId) {
	return { id: crypto.randomUUID(), folderId, parentId };
}

export function createSubBookmark(folderId, path) {
	const bookmark = createObjFromPath(path);
	return Object.assign({ parentId: folderId }, bookmark);
}

export function dupSubBookmark({ id, parentId: a, ...bookmark }, parentId) {
	return Object.assign({ id: crypto.randomUUID(), parentId }, bookmark);
}

export function createObjFromPath(path = "/channels/@me") {
	return Object.assign({ id: crypto.randomUUID(), path }, parsePath(path));
}

export function createFrom(...objs) {
	return Object.assign({}, ...objs, { id: crypto.randomUUID() });
}

export function sort(pos) {
	return index => (pos === "after" ? index + 1 : index);
}
