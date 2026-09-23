export const set = (array, index, item) => array.toSpliced(index, 1, item);
export const add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);
export const remove = (array, index) => array.toSpliced(index, 1);
export const removeMany = (array, indices) => array.filter((_, i) => indices.indexOf(i) === -1);
export const slice = (array, from, to) => array.slice(from, to);


export const loop = (array, callback) => {
	for (let i = 0; i < array.length; i++) callback(array[i], i);
};

export function arrayMove(array, from, to) {
	const newArray = array.slice();
	newArray.splice(to, 0, newArray.splice(from, 1)[0]);

	return newArray;
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

export function meta(array, filter) {
	const index = array.findIndex(filter);
	if (index === -1) return { items: null };
	return {
		index,
		length: array.length,
		item: array[index],
		isSingle: array.length === 1,
		isFirst: index === 0,
		isLast: index === array.length - 1,
		nextItem: array[index + 1],
		previousItem: array[index - 1],
	};
}
