// export function parsePath(path) {
// 	const [, type, idk, channelId, , threadId] = path.split("/");
// 	return { type, idk, channelId: threadId || channelId };
// }

export const pathTypes = {
	QUESTS: "QUESTS",
	APPS: "APPS",
	SERVERS: "SERVERS",
	SHOP: "SHOP",
	NITRO: "NITRO",
	HOME: "HOME",
	CHANNEL: "CHANNEL"
};

const types = {
	"store": { title: "Nitro", type: pathTypes.NITRO },
	"shop": { title: "Shop", type: pathTypes.SHOP },
	"servers": { title: "Servers", type: pathTypes.SERVERS },
	"applications": { title: "Applications", type: pathTypes.APPS },
	"quests": { title: "Quests", type: pathTypes.QUESTS },
	"home": { title: "Home", type: pathTypes.HOME },
	"unknown": { type: null }
};

const channelRegex = /\/channels\/(@me|@favorites|\d+)\/(\d+)\/?(?:threads)?\/?(\d+)?/;

export function parsePath(path) {
	if (path === "/shop") return types.shop;
	if (path === "/store") return types.store;
	if (path === "/channels/@me") return types.home;
	if (path === "/quest-home") return types.quests;
	if (path.startsWith("/discovery/")) {
		const category = path.split("/")[2];
		if (category === "servers" || category === "applications" || category === "quests") return types[category];
		else types.unknown;
	}

	const channel = path.match(channelRegex);
	if (!channel) return types.unknown;
	const [, guildId, channelId, threadId] = channel;
	return { guildId, channelId: threadId || channelId, type: pathTypes.CHANNEL };
}
