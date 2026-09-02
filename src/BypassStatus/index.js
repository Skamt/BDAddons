// import "./styles";
import Flux from "@Utils/Flux";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import WindowStore from "@Stores/WindowStore";
import UserStore from "@Stores/UserStore";
import PresenceStore from "@Stores/PresenceStore";
import ChannelStore from "@Stores/ChannelStore";
import ChannelActionCreators from "@Stores/ChannelActionCreators";
import MessageStore from "@Stores/MessageStore";
import { ChannelUtils, transitionTo } from "@Discord/Modules";
import { getCurrentChannel } from "@Utils/Channel";
import SettingComponent from "./SettingComponent";
import PatchContextMenu from "./patchContextMenu";
import { playMessageNotificationSounce } from "@/utils";
import Plugin, { Events } from "@Utils/Plugin";
import React from "@React";

const SILENT_PING_FLAG = 1 << 12;

function showNotification(message, guildId) {
	try {
		const channel = ChannelStore.getChannel(message.channel_id);
		// const channelRegex = /<#(\d{19})>/g;
		// const userRegex = /<@(\d{18})>/g;

		// message.content = message.content.replace(channelRegex, (match, channelId) => {
		// 	return `#${ChannelStore.getChannel(channelId)?.name}`;
		// });

		// message.content = message.content.replace(userRegex, (match, userId) => {
		// 	return `@${UserStore.getUser(userId).globalName}`;
		// });

		BdApi.UI.showNotification({
			id: `BypassStatus-${Math.random().toString(36).slice(2)}`,
			title: `${message.author.globalName} ${guildId ? `(#${channel?.name}, ${ChannelStore.getChannel(channel?.parent_id)?.name})` : ""}`,
			// title: "Available Quests",
			// icon: UserStore.getUser(message.author.id).getAvatarURL(undefined, undefined, false),
			content: message.content,
			type: "info",
			duration: Number.POSITIVE_INFINITY,
			actions: [
				{
					label: "Jump to message",
					dontClose: !true,
					onClick() {
						transitionTo(`/channels/${guildId ?? "@me"}/${message.channel_id}/${message.id}`);
					},
				},
			],
		});

		if (Settings.state.notificationSound) playMessageNotificationSounce();
	} catch (error) {
		Logger.error("Failed to notify user: ", error);
	}
}

function shouldNotify(message, guildId, channelId, currentUser) {
	const isMentioned = message.mentions.some((user) => user.id === currentUser.id);
	if (!isMentioned && Settings.state.mentionOnly) return false;

	if (Settings.state.users.split(", ").includes(message.author.id)) {
		if (ChannelStore.getDMFromUserId(message.author.id) === channelId) return true;
		if (Settings.state.allowOutsideOfDms) return true;
	}

	const notifyGuild = Settings.state.guilds.split(", ").includes(guildId);
	const notifyChannel = Settings.state.channels.split(", ").includes(channelId);
	if (notifyGuild || notifyChannel) return true;
}

Plugin.on(Events.START, () => {
	Flux.init({
		async MESSAGE_CREATE({ message, guildId, channelId }) {
			try {
				const currentUser = UserStore.getCurrentUser();
				const userStatus = PresenceStore.getStatus(currentUser.id);
				const currentChannelId = getCurrentChannel()?.id ?? "0";
				if (
					message.state === "SENDING" ||
					message.content === "" ||
					message.author.id === currentUser.id ||
					(channelId === currentChannelId && WindowStore.isFocused()) ||
					userStatus !== Settings.state.statusToUse
				) {
					return;
				}
				if (Settings.state.respectSilentPings && message.flags & SILENT_PING_FLAG) {
					return;
				}

				if (shouldNotify(message, guildId, channelId, currentUser))
					showNotification(message, guildId);
			} catch (error) {
				Logger.error("Failed to handle message: ", error);
			}
		},
	});

	PatchContextMenu.init();
});

Plugin.on(Events.STOP, () => {
	Flux.dispose();
	PatchContextMenu.dispose();
});

Plugin.getSettingsPanel = () => <SettingComponent />;

module.exports = () => Plugin;
