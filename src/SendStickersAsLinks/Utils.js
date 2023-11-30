import { getModule, Filters } from "@Webpack";
import StickerFormatEnum from "@Enums/StickerFormatEnum";
import Settings from "@Utils/Settings";
import UserStore from "@Stores/UserStore";
import StickersStore from "@Stores/StickersStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import Toast from "@Utils/Toast";
import StickerSendability from "@Modules/StickerSendability";

const StickerMethods = getModule(Filters.byProps("getStickerAssetUrl"));
const { StickerSendability: StickersSendabilityEnum, getStickerSendability } = StickerSendability;

export function sendStickerAsLink(sticker, channel) {
	const content = getStickerUrl(sticker);

	if (!Settings.get("sendDirectly")) return insertText(content);

	try {
		sendMessageDirectly(channel, content);
	} catch {
		insertText(content);
		Toast.error("Could not send directly.");
	}
}

export function getStickerUrl(sticker){
	return StickerMethods.getStickerAssetUrl(sticker, { size: Settings.get("stickerSize") || 160 });
}

export function isAnimatedSticker(sticker) {
	return sticker["format_type"] !== StickerFormatEnum.PNG;
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
