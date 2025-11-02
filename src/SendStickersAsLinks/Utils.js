import { getMangled, Filters } from "@Webpack";
import Settings from "@Utils/Settings";
import UserStore from "@Stores/UserStore";
import StickersStore from "@Stores/StickersStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import Toast from "@Utils/Toast";
import { StickerSendability } from "./Modules";

const { getStickerAssetUrl } = getMangled(Filters.bySource("API_ENDPOINT", "ASSET_ENDPOINT"), {
	getStickerAssetUrl: Filters.byStrings("STICKER_ASSET")
});

const { StickersSendabilityEnum, getStickerSendability } = StickerSendability;
const StickerFormatEnum = {
	"1": "PNG",
	"2": "APNG",
	"3": "LOTTIE",
	"4": "GIF",
	"PNG": 1,
	"APNG": 2,
	"LOTTIE": 3,
	"GIF": 4
};

export function sendStickerAsLink(sticker, channel) {
	const content = getStickerUrl(sticker);

	if (!Settings.state.sendDirectly) return insertText(content);

	try {
		sendMessageDirectly(content, channel.id);
	} catch {
		insertText(content);
		Toast.error("Could not send directly.");
	}
}

export function getStickerUrl(sticker) {
	const size = Settings.state.stickerSize || 160;
	if (!getStickerAssetUrl) return `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${size}&quality=lossless`;
	return getStickerAssetUrl(sticker, { size });
}

export function isAnimatedSticker(sticker) {
	return sticker.format_type !== StickerFormatEnum.PNG;
}

export function isStickerSendable(sticker, channel, user) {
	return getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE;
}

export function isLottieSticker(sticker) {
	return sticker["format_type"] === StickerFormatEnum.LOTTIE;
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
