import { Data } from "@Api";
import EmojiStore from "@Stores/EmojiSotre";

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
	const savedEmojis = Data.load("emojis") || [];
	const parsedEmojis = savedEmojis.map(emoji => {
		const [animated, name, id] = emoji.split(":");
		return buildEmojiObj({ animated, name, id });
	});

	const defaultFavoriteEmojis = EmojiStore?.getDisambiguatedEmojiContext?.().rebuildFavoriteEmojisWithoutFetchingLatest?.()?.favorites || [];
	const emojis = [...defaultFavoriteEmojis, ...parsedEmojis];

	function commit() {
		// Data.save("emojis", savedEmojis);
	}

	function addEmoji({ animated, name, id }) {
		const index = emojis.findIndex(a => a.id === id);
		if (index !== -1) return;
		emojis.push(buildEmojiObj({ animated, name, id }));
		savedEmojis.push(serializeEmoji({ animated, name, id }));
	}

	function removeEmoji(id) {
		const parsedEmojisIndex = emojis.findIndex(a => a.id === id);
		if (parsedEmojisIndex === -1) return;
		emojis.splice(parsedEmojisIndex, 1);

		const savedEmojisIndex = savedEmojis.findIndex(a => a.id.includes(id));
		if (savedEmojisIndex === -1) return;
		savedEmojis.splice(savedEmojisIndex, 1);
	}

	return {
		emojis,
		add({ animated, name, id }) {
			addEmoji({ animated, name, id });
			commit();
		},
		remove(id) {
			removeEmoji(id);
			commit();
		}
	};
})();
