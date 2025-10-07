import { getUserFromDM } from "@Utils/User";
import { pathTypes } from "@/consts";
import ChannelStore from "@Stores/ChannelStore";
import UserStore from "@Stores/UserStore";
import UserGuildJoinRequestStore from "@Stores/UserGuildJoinRequestStore";
import { ChannelTypeEnum } from "@Discord/Enums";
import { transitionTo, ChannelUtils } from "@Discord/Modules";

const types = {
	"store": { title: "Nitro", type: pathTypes.NITRO },
	"shop": { title: "Shop", type: pathTypes.SHOP },
	"servers": { title: "Servers", type: pathTypes.SERVERS },
	"applications": { title: "Applications", type: pathTypes.APPS },
	"quests": { title: "Quests", type: pathTypes.QUESTS },
	"home": { title: "Home", type: pathTypes.HOME },
	"unknown": { type: null, title: "Unknown" }
};

const channelRegex = /\/channels\/(@me|@favorites|\d+)\/(\d+)\/?(?:threads\/(\d+))?/;

export function parsePath(path) {
	if (path.startsWith("/member-verification")) {
		const id = path.split("/").pop();
		const guild = UserGuildJoinRequestStore.getJoinRequestGuild(id);
		if (!guild) return types.unknown;
		return {
			title: guild.name,
			type: null
		};
	}
	if (path === "/shop") return types.shop;
	if (path === "/store") return types.store;
	if (path === "/channels/@me") return types.home;
	if (path === "/quest-home") return types.quests;
	if (path.startsWith("/discovery/")) {
		const category = path.split("/")[2];
		if (category === "servers" || category === "applications" || category === "quests") return types[category];
		else types.unknown;
	}

	const channelMatch = path.match(channelRegex);
	if (!channelMatch) return types.unknown;
	const [, guildId, channelId, threadId] = channelMatch;

	const channel = ChannelStore.getChannel(threadId || channelId);
	if (!channel) return types.unknown;

	if (channel.isDM()) {
		const user = UserStore.getUser(channel.recipients[0]);
		if (!user) return types.unknown;
		return {
			type: pathTypes.DM,
			channelId: channel.id,
			path: constructPath("@me", channelId),
			username: user.username,
			avatar: user.avatar,
			userId: user.id
		};
	}

	return {
		guildId,
		channelId: threadId || channelId,
		type: pathTypes.CHANNEL,
		path: constructPath(guildId, channelId, threadId)
	};
}

function constructPath(guildId, channelId, threadId) {
	let path = `/channels/${guildId}/${channelId}/`;
	if (threadId) path += `threads/${threadId}/`;
	return path;
}

export function navigate(tab) {
	if (tab.type === pathTypes.DM) {
		const channel = ChannelStore.getChannel(tab.channelId);
		if (channel) return transitionTo(tab.path);
		return ChannelUtils.openPrivateChannel({ recipientIds: [tab.userId] });
	}

	return transitionTo(tab.path);
}
