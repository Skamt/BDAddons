import { getUserFromDM } from "@Utils/User";
import { pathTypes } from "@/consts";
import ChannelStore from "@Stores/ChannelStore";
import UserStore from "@Stores/UserStore";
import UserGuildJoinRequestStore from "@Stores/UserGuildJoinRequestStore";
import { ChannelTypeEnum } from "@Discord/Enums";
import { transitionTo, ChannelUtils } from "@Discord/Modules";
import SelectedChannelStore from "@Stores/SelectedChannelStore";

export function getGuildChannelPath(guildId) {
	const selectedChannelId = SelectedChannelStore.getChannelId(guildId);
	return `/channels/${guildId}/${selectedChannelId}`;
}

const types = {
	"store": { title: "Nitro", type: pathTypes.NITRO },
	"shop": { title: "Shop", type: pathTypes.SHOP },
	"servers": { title: "Servers", type: pathTypes.SERVERS },
	"applications": { title: "Applications", type: pathTypes.APPS },
	"quests": { title: "Quests", type: pathTypes.QUESTS },
	"home": { title: "Home", type: pathTypes.HOME },
	"unknown": { type: null, title: "Unknown" }
};

const parsers = [
	{ regex: /^\/quest-home$/, handle: types.quests },
	{ regex: /^\/channels\/@me$/, handle: types.home },
	{ regex: /^\/shop$/, handle: types.shop },
	{ regex: /^\/store$/, handle: types.store },
	{ regex: /^\/discovery\/(applications|servers|quests)/, handle: type => types[type] },
	{
		regex: /^\/member-verification/,
		handle() {
			if (path.startsWith("/member-verification")) {
				const id = path.split("/").pop();
				const guild = UserGuildJoinRequestStore.getJoinRequestGuild(id);
				if (!guild) return types.unknown;
				return {
					title: guild.name,
					icon: guild.icon,
					type: pathTypes.VERIFICATION
				};
			}
		}
	},
	{
		regex: /^\/channels\/(\d+)\/(.+)$/,
		handle(guildId, type) {
			return {
				guildId,
				name: type,
				type: pathTypes.CHANNEL,
				path: constructPath(guildId, type)
			};
		}
	},
	{
		regex: /^\/channels\/(\d+|@favorites)\/(\d+)\/?(?:threads\/(\d+))?/,
		handle(guildId, channelId, threadId) {
			return {
				guildId,
				channelId: threadId || channelId,
				type: pathTypes.CHANNEL,
				path: constructPath(guildId, channelId, threadId)
			};
		}
	},
	{
		regex: /^\/channels\/(@me)\/(\d+)/,
		handle(me, channelId) {
			const channel = ChannelStore.getChannel(channelId);
			if (!channel) return types.unknown;
			if (channel.isGroupDM())
				return {
					channelId,
					type: pathTypes.GROUP_DM,
					path: constructPath("@me", channelId)
				};

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
	}
];

export function parsePath(path) {
	if (path)
		for (let i = parsers.length - 1; i >= 0; i--) {
			const parser = parsers[i];
			const match = path.match(parser.regex);
			if (!match) continue;
			const [, ...captures] = match;
			if (typeof parser.handle === "function") return parser.handle(...captures);
			return parser.handle;
		}
	return types.unknown;
}

function constructPath(guildId, channelId, threadId) {
	let path = `/channels/${guildId}/${channelId}/`;
	if (threadId) path += `threads/${threadId}/`;
	return path;
}

export function navigate({ type, channelId, path, userId }) {
	if (type === pathTypes.DM) {
		const channel = ChannelStore.getChannel(channelId);
		if (channel) return transitionTo(path);
		return ChannelUtils.openPrivateChannel({ recipientIds: [userId] });
	}

	return transitionTo(path);
}

const avatarSizes = {
	32: "SIZE_24",
	30: "SIZE_20",
	28: "SIZE_20",
	26: "SIZE_16",
	24: "SIZE_16"
};

export function getSize(e) {
	if (e >= 32) return { size: 24, avatarSize: "SIZE_24" };
	if (e >= 28 && e < 32) return { size: 20, avatarSize: "SIZE_20" };
	if (e >= 24 && e < 28) return { size: 16, avatarSize: "SIZE_16" };

	return { size: 20, avatarSize: "SIZE_20" };
}