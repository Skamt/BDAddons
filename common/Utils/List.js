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

	set list(_) {
		throw new Error();
	}
	set map(_) {
		throw new Error();
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
		const item = this.list[index];
		this.remove(index);
		delete this.map[item[this.identifierKey]];
		this.recreateIndexMap();
	}

	removeItemByIdentifier(id) {
		const index = this.indexMap[id];
		this.removeItem(index);
	}

	swapItem(fromIndex, toIndex) {
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || fromIndex >= this.list.length) return;
		const fromItem = this.list[fromIndex];

		const tempList = [...this.list];

		const toItem = tempList.splice(toIndex, 1, fromItem)[0];
		tempList.splice(fromIndex, 1, toItem);

		this.setList(tempList);
	}

	swapItemById(fromId, toId) {
		this.swapItem(this.indexMap[fromId], this.indexMap[toId]);
	}

	setItem(index, item) {
		if (index == null || index < 0) return;
		item = {
			...item,
			[this.identifierKey]: this.list[index][this.identifierKey]
		};
		this.replace(index, item);
		this.updateMap(item);
	}

	setItemById(id, item) {
		const index = this.indexMap[id];
		if (index == null) return;
		this.setItem(index, item);
	}

	getItem(index){
		return this.list(index)
	}

	getItemById(id){
		return this.map[id];
	}

	getItemMeta(id) {
		const index = this.indexMap[id];
		return {
			item: this.map[id],
			index,
			isFirst: index === 0,
			isLast: index === this.list.length - 1,
			nextItem: this.list[index + 1],
			previousItem: this.list[index - 1]
		};
	}
}
