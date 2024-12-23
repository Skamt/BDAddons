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

export default (() => {
	const Emojis = Object.create(null);

	const savedEmojis = Data.load("emojis") || [];
	Emojis.emojis = savedEmojis.map(emoji => {
		const [animated, name, id] = emoji.split(":");
		return buildEmojiObj({ animated, name, id });
	});

	function commit() {
		Data.save("emojis", savedEmojis);
	}

	Emojis.add = function ({ animated, name, id }) {
		const index = Emojis.emojis.findIndex(e => e.id === id);
		if (index !== -1) return;
		Emojis.emojis.push(buildEmojiObj({ animated, name, id }));
		savedEmojis.push(serializeEmoji({ animated, name, id }));
		commit();
	};

	Emojis.remove = function (id) {
		const emojiIndex = Emojis.emojis.findIndex(e => e.id === id);
		const savedEmojisIndex = savedEmojis.findIndex(e => e.id.includes(id));
		if (emojiIndex === -1) return;
		if (savedEmojisIndex === -1) return;

		Emojis.emojis.splice(emojiIndex, 1);
		savedEmojis.splice(savedEmojisIndex, 1);
		commit();
	};

	Emojis.has = function (id){
		return -1 !== Emojis.emojis.findIndex(e => e.id === id);
	}

	return Emojis;
})();
