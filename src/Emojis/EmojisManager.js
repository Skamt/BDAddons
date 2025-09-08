import { Data } from "@Api";

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

function getById(id){
	return emojisMap.parsedEmojis[emojisMap.indexMap[id]]
}

function getByIndex(index){
	return emojisMap.parsedEmojis[index]
}

function add({ animated, name, id }) {
	if (has(id)) return;
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.rawEmojis.push(serializeEmoji({ animated, name, id }));
	emojisMap.parsedEmojis.push(parsedEmoji);
	emojisMap.indexMap[id] = emojisMap.parsedEmojis.length - 1;
}


function remove(id) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	emojisMap.parsedEmojis.splice(index, 1, false);
	emojisMap.rawEmojis.splice(index, 1, false);
	delete emojisMap.indexMap[id];
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

	// console.log(emojisMap);
	Data.save("emojis", cleaned);
}

const EmojisManager = {
	_state: emojisMap,
	add,
	remove,
	commit,
	has,
	update,
	getById,
	getByIndex,
	emojis:emojisMap.parsedEmojis
};

DEV: {
	window.EmojisManager = EmojisManager;
}

// console.log(EmojisManager);

export default EmojisManager;
// (() => {
// 	const Emojis = Object.create(null);

// 	Emojis.emojis = savedEmojis.map(emoji => {
// 		const [animated, name, id] = emoji.split(":");
// 		return buildEmojiObj({ animated, name, id });
// 	});

// 	function commit() {
// 		Data.save("emojis", savedEmojis);
// 	}

// 	Emojis.add = function ({ animated, name, id }) {
// 		const index = Emojis.emojis.findIndex(e => e.id === id);
// 		if (index !== -1) return;
// 		Emojis.emojis.push(buildEmojiObj({ animated, name, id }));
// 		savedEmojis.push(serializeEmoji({ animated, name, id }));
// 		commit();
// 	};

// 	Emojis.remove = function (id) {
// 		const emojiIndex = Emojis.emojis.findIndex(e => e.id === id);
// 		const savedEmojisIndex = savedEmojis.findIndex(e => e.id.includes(id));
// 		if (emojiIndex === -1) return;
// 		if (savedEmojisIndex === -1) return;

// 		Emojis.emojis.splice(emojiIndex, 1);
// 		savedEmojis.splice(savedEmojisIndex, 1);
// 		commit();
// 	};

// 	Emojis.has = function (id) {
// 		return -1 !== Emojis.emojis.findIndex(e => e.id === id);
// 	};

// 	return Emojis;
// })();
