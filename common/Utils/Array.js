export function set(array, index, item) {
	return array.toSpliced(index, 1, item);
}

export function remove(array, index) {
	return array.toSpliced(index, 1);
}

export function removeMany(array, indices) {
	let index = array.length;
	const sum = [];
	while(index--){
		if(indices.includes(index))continue;
		sum.unshift(array[index]);
	}
	return sum
}

export function add(array, item, index) {
	return array.toSpliced(index ?? array.length, 0, item);
}

export function slice(array, from, to){
	return array.slice(from, to);
}

export function swap(array, from, to) {
	if (from === to) return;
	if (from < 0 || from >= array.length) return;

	const fromItem = array[from];

	const tempList = array.slice(0);

	const toItem = tempList.splice(to, 1, fromItem)[0];
	tempList.splice(from, 1, toItem);

	return tempList;
}

export function meta(array, index) {
	if (index == null || index < 0 || index >= array.length) return {};
	return {
		index,
		item: array[index],
		isSingle: array.length === 1,
		isFirst: index === 0,
		isLast: index === array.length - 1,
		nextItem: array[index + 1],
		previousItem: array[index - 1]
	};
}

