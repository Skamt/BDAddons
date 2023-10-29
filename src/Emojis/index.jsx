import css from "./styles";
import { React, DOM, Patcher, getInternalInstance } from "@Api";
import Settings from "@Utils/Settings";
import { hasEmbedPerms } from "@Utils/Permissions";
import Toast from "@Utils/Toast";
import SettingComponent from "./components/SettingComponent";
import UserStore from "@Stores/UserStore";
import ChannelStore from "@Stores/ChannelStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
import patchGetEmojiUnavailableReason from "./patches/patchGetEmojiUnavailableReason";
import patchIsEmojiFiltered from "./patches/patchIsEmojiFiltered";

import { getPickerIntention, getEmojiWebpUrl, getEmojiGifUrl, isEmojiSendable, parseEmojiUrl } from "./Utils";

import STRINGS from "./Constants";

export default class Emojis {
	constructor() {
		this.emojiClickHandler = this.emojiClickHandler.bind(this);
	}

	getEmojiUrl(emoji, size) {
		if (Settings.get("sendEmojiAsWebp")) return getEmojiWebpUrl(emoji, size);
		if (emoji.animated) return getEmojiGifUrl(emoji, 4096);

		return parseEmojiUrl(emoji, size);
	}

	sendEmojiAsLink(emoji, channel) {
		const content = this.getEmojiUrl(emoji, Settings.get("emojiSize"));
		if (Settings.get("sendDirectly")) {
			try {
				return sendMessageDirectly(channel, content);
			} catch {
				Toast.error("Could not send directly.");
			}
		}
		insertText(content);
	}

	handleUnsendableEmoji(emoji, channel, user) {
		if (emoji.animated && !Settings.get("shouldSendAnimatedEmojis")) return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);
		if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions")) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

		this.sendEmojiAsLink(emoji, channel);
	}

	emojiHandler(emoji) {
		const user = UserStore.getCurrentUser();
		const intention = EmojiIntentionEnum.CHAT;
		const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
		if (!isEmojiSendable({ emoji, channel, intention })) this.handleUnsendableEmoji(emoji, channel, user);
	}

	emojiClickHandler(event) {
		if (event.button === 2) return;
		const [pickerIntention, picker] = getPickerIntention(event);
		if (pickerIntention !== EmojiIntentionEnum.CHAT) return;
		picker.classList.add("CHAT");
		const emojiInstance = getInternalInstance(event.target);
		const props = emojiInstance?.pendingProps;
		if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children) {
			this.emojiHandler(props.children.props.emoji);
		}
	}

	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchIsEmojiFiltered();
			patchGetEmojiUnavailableReason();
			document.addEventListener("mouseup", this.emojiClickHandler);
		} catch (e) {
			console.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		document.removeEventListener("mouseup", this.emojiClickHandler);
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
