import StickerTypeEnum from "@Enums/StickerTypeEnum";
import StickerFormatEnum from "@Enums/StickerFormatEnum";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";
import StickersSendabilityEnum from "@Enums/StickersSendabilityEnum";

import UserStore from "@Stores/UserStore";
import StickersStore from "@Stores/StickersStore";
import ChannelStore from "@Stores/ChannelStore";

import StickerSendability from "@Patch/getStickerSendability";
const getStickerSendability = StickerSendability.module[StickerSendability.key];


export function getStickerUrl(stickerId, size) {
	return `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`;
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