import Settings from "@Utils/Settings";
import StickerTypeEnum from "@Enums/StickerTypeEnum";
import StickerFormatEnum from "@Enums/StickerFormatEnum";
import DiscordPermissions from "@Enums/DiscordPermissions";
import StickersSendabilityEnum from "@Enums/StickersSendabilityEnum";

import UserStore from "@Stores/UserStore";
import StickersStore from "@Stores/StickersStore";
import ChannelStore from "@Stores/ChannelStore";
import PendingReplyStore from "@Stores/PendingReplyStore";

import Permissions from "@Modules/Permissions";
import MessageActions from "@Modules/MessageActions";

import StickerSendability from "@Patch/getStickerSendability";

const getStickerSendability = StickerSendability.module[StickerSendability.key];

function getReply(channelId) {
	const reply = PendingReplyStore?.getPendingReply(channelId);
	if (!reply) return {};
	return {
		messageReference: {
			guild_id: reply.channel.guild_id,
			channel_id: reply.channel.id,
			message_id: reply.message.id
		},
		allowedMentions: reply.shouldMention ? undefined : {
			parse: ["users", "roles", "everyone"],
			replied_user: false
		}
	}
}

export function sendMessage({ sticker, channel }) {
	MessageActions.sendMessage(channel.id, {
		content: getStickerUrl(sticker.id, Settings.get("stickerSize")),
		validNonShortcutEmojis: []
	}, undefined, getReply(channel.id));
}

export function getStickerUrl(stickerId, size) {
	return `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`;
}

export function hasEmbedPerms(channel, user) {
	return !channel.guild_id || Permissions?.can({
		permission: DiscordPermissions.EMBED_LINKS,
		context: channel,
		user
	});
}

export function isAnimatedSticker(sticker) {
	return sticker["format_type"] === StickerFormatEnum.APNG;
}

export function isStickerSendable(sticker, channel, user) {
	return getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE;
}

export function isLottieSticker(sticker) {
	return sticker.type === StickerTypeEnum.STANDARD;
}

export function handleSticker(channelId, stickerId) {
	const user = UserStore.getCurrentUser();
	const sticker = StickersStore.getStickerById(stickerId);
	const channel = ChannelStore.getChannel(channelId);
	return {
		user,
		sticker,
		channel,
		isSendable: isStickerSendable(sticker, channel, user)
	}
}