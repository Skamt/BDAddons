function arrToObject(arr, key) {
	if (!key) return;
	return arr.reduce((acc, item) => {
		acc[item[key]] = item;
		return acc;
	}, {});
}

class ArrayHelpers {
	list = [];

	push(item) {
		this.list = this.list.toSpliced(this.list.length, 0, item);
	}

	insert(item, index) {
		this.list = this.list.toSpliced(index, 0, item);
	}

	shift(item) {
		this.list = this.list.toSpliced(0, 0, item);
	}

	remove(index) {
		this.list = this.list.toSpliced(index, 1);
	}

	replace(index, item) {
		this.list = this.list.toSpliced(index, 1, item);
	}
}

export default class List extends ArrayHelpers {
	list = [];
	map = {};
	indexMap = {};

	constructor(identifierKey = "id") {
		super();
		this.identifierKey = identifierKey;
	}

	get length() {
		return this.list.length;
	}

	clear() {
		this.setList([]);
	}

	updateMap(item) {
		this.map[item[this.identifierKey]] = item;
	}

	recreateIndexMap() {
		this.indexMap = {};
		this.list.forEach((item, index) => {
			this.indexMap[item[this.identifierKey]] = index;
		});
	}

	setList(arr) {
		arr = [...arr];
		this.list = arr;
		this.map = arrToObject(arr, this.identifierKey);
		this.recreateIndexMap();
	}

	addItem(item) {
		item = { ...item };
		this.push(item);
		this.updateMap(item);
		this.indexMap[item[this.identifierKey]] = this.list.length - 1;
	}

	addItemAtIndex(item, index) {
		if (index == null) return;
		item = { ...item };
		this.insert(item, index);
		this.updateMap(item);
		this.recreateIndexMap();
	}

	removeItem(index) {
		if (index == null || index < 0) return;
		const item = this.getItemByIndex(index);
		this.remove(index);
		delete this.map[item[this.identifierKey]];
		this.recreateIndexMap();
	}

	removeItemByIdentifier(id) {
		const index = this.getItemIndex(id);
		this.removeItem(index);
	}

	swapItem(fromIndex, toIndex) {
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || fromIndex >= this.length) return;
		const fromItem = this.getItemByIndex(fromIndex);

		const tempList = [...this.list];

		const toItem = tempList.splice(toIndex, 1, fromItem)[0];
		tempList.splice(fromIndex, 1, toItem);

		this.setList(tempList);
	}

	swapItemById(fromId, toId) {
		this.swapItem(this.getItemIndex(fromId), this.getItemIndex(toId));
	}

	setItem(index, item) {
		if (index == null || index < 0) return;
		const currentItem = this.getItemByIndex(index);
		item = {
			...currentItem,
			...item,
			[this.identifierKey]: currentItem[this.identifierKey]
		};
		this.replace(index, item);
		this.updateMap(item);
	}

	setItemById(id, item) {
		const index = this.getItemIndex(id);
		if (index == null) return;
		this.setItem(index, item);
	}

	getItemByIndex(index) {
		return this.list[index];
	}

	getItemById(id) {
		return this.map[id];
	}

	getItemIndex(id) {
		return this.indexMap[id];
	}

	getListSlice(from, to) {
		return this.list.slice(from, to);
	}

	getItemMeta(id) {
		const index = this.getItemIndex(id);
		if (index == null || index < 0) return {};
		const item = this.getItemById(id);
		if (!item) return {};
		return {
			item,
			index,
			isSingle: this.list.length === 1,
			isFirst: index === 0,
			isLast: index === this.list.length - 1,
			nextItem: this.getItemByIndex(index + 1),
			previousItem: this.getItemByIndex(index - 1)
		};
	}
}
