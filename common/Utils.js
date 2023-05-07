import { Patcher, getOwnerInstance } from "@Api";

import Dispatcher from "@Modules/Dispatcher";
import UserStore from "@Stores/UserStore";
import PendingReplyStore from "@Stores/PendingReplyStore";

export function getReply(channelId) {
	const reply = PendingReplyStore?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
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

export function copy(data) {
	DiscordNative.clipboard.copy(data);
}

export function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

export class BrokenAddon {
	stop() {}
	start() {
		BdApi.alert(config.info.name, "Plugin is broken, Notify the dev.");
	}
}

export class MissingZlibAddon {
	stop() {}
	start() {
		BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
			"Please download it from the officiel website",
			"https://betterdiscord.app/plugin/ZeresPluginLibrary"
		]);
	}
}

export function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, 'render', () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}

export const nop = () => {};

export function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

export class Disposable {
	constructor() {
		this.patches = [];
	}

	Dispose() {
		this.patches?.forEach(p => p?.());
		this.patches = [];
	}
}

export function sleep(delay) {
	return new Promise(done => setTimeout(() => done(), delay * 1000));
}

export function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


	return bytes.toFixed(dp) + ' ' + units[u];
}

export function parseSnowflake(snowflake){
	return snowflake / 4194304 + 1420070400000;
}