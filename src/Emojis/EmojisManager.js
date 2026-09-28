import { Data } from "@Api";

const target = new EventTarget();

function buildEmojiObj({ animated, name, id }) {
	return {
		"animated": animated ? true : false,
		"available": true,
		"id": id,
		"name": name,
		"allNamesString": `:${name}:`,
		"guildId": ""
	};
}

function serializeEmoji({ animated, name, id }) {
	return `${animated ? "a" : ""}:${name}:${id}`;
}

const savedEmojis = Data.load("emojis") || []; // [<animated?>:<name>:<id>]

const emojisMap = {
	rawEmojis: [...savedEmojis],
	parsedEmojis: [],
	indexMap: {}
};

for (let index = 0; index < savedEmojis.length; index++) {
	const emoji = savedEmojis[index];
	const [animated, name, id] = emoji.split(":");
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.parsedEmojis.push(parsedEmoji);
	emojisMap.indexMap[id] = index;
}

function has(id) {
	return !!getById(id);
}

function getById(id) {
	return emojisMap.parsedEmojis[emojisMap.indexMap[id]];
}

function getByIndex(index) {
	return emojisMap.parsedEmojis[index];
}

function add({ animated, name, id }) {
	if (has(id)) return;
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.rawEmojis.unshift(serializeEmoji({ animated, name, id }));
	emojisMap.parsedEmojis.unshift(parsedEmoji);
	// emojisMap.indexMap[id] = 0;
}

function remove(id) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	emojisMap.parsedEmojis.splice(index, 1);
	emojisMap.rawEmojis.splice(index, 1);
	// delete emojisMap.indexMap[id];
}

function update(id, payload) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	const oldEmoji = emojisMap.parsedEmojis[index];
	const updatedEmoji = Object.assign({}, oldEmoji, payload);
	emojisMap.parsedEmojis[index] = updatedEmoji;
	emojisMap.rawEmojis[index] = serializeEmoji(updatedEmoji);
}

function commit() {
	const cleaned = emojisMap.rawEmojis.filter(Boolean);
	emojisMap.rawEmojis = cleaned;
	emojisMap.parsedEmojis = [];
	for (let index = 0; index < cleaned.length; index++) {
		const emoji = cleaned[index];
		const [animated, name, id] = emoji.split(":");
		const parsedEmoji = buildEmojiObj({ animated, name, id });
		emojisMap.parsedEmojis.push(parsedEmoji);
		emojisMap.indexMap[id] = index;
	}
	EmojisManager.emojis = emojisMap.parsedEmojis;
	Data.save("emojis", cleaned);

	target.dispatchEvent(new Event("CHANGED"));
}

function off(listener) {
	target.removeEventListener("CHANGED", listener);
}

function on(listener, props) {
	target.addEventListener("CHANGED", listener, props);
	return () => off(listener);
}

function getEmojis() {
	return EmojisManager.emojis;
}

const EmojisManager = {
	_state: emojisMap,
	add,
	remove,
	commit,
	on,
	getEmojis,
	off,
	has,
	update,
	getById,
	getByIndex,
	emojis: emojisMap.parsedEmojis
};

DEV: {
	window.EmojisManager = EmojisManager;
}

export default EmojisManager;
