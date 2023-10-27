import StickerTypeEnum from "@Enums/StickerTypeEnum";
import StickerFormatEnum from "@Enums/StickerFormatEnum";
import Settings from "@Utils/Settings";
import UserStore from "@Stores/UserStore";
import StickersStore from "@Stores/StickersStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import Toast from "@Utils/Toast";
import StickerSendability from "@Modules/StickerSendability";

const { StickerSendability: StickersSendabilityEnum, getStickerSendability } = StickerSendability;

export function sendStickerAsLink({ channel, sticker }) {
	const content = getStickerUrl(sticker.id);
	
	if (!Settings.get("sendDirectly")) return insertText(content);

	try {
		sendMessageDirectly(channel, content);
	} catch {
		insertText(content);
		Toast.error("Could not send directly.");
	}
}

export function getStickerUrl(stickerId) {
	const stickerSize = Settings.get("stickerSize") || 160;
	return `https://media.discordapp.net/stickers/${stickerId}?size=${stickerSize}&passthrough=false`;
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
	};
}
