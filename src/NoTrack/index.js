import "./patches/*";
import { nop } from "@Utils";
import { loop } from "@Utils/Array";
import Plugin from "@common/Plugin";
import { blockEvent, intercept } from "@common/Flux";
import { before } from "@common/Patcher";
import UserStore from "@Stores/UserStore";
import DiscordUtils from "@Modules/DiscordUtils";
import Analytics from "@Modules/Analytics";
import MessageActions from "@Modules/MessageActions";
import { getModule,Filters } from "@Webpack";

const Anchor = getModule(Filters.byKeys("Anchor"));


const targets = ["spotify"];
const blockedEvents = ["FINGERPRINT", "TRACK"];

function urlRegex(name) {
	return new RegExp(`((?:https|http)\\:\\/\\/(?:.*\\.)?${name}\\..*\\/\\S+)`, "g");
}

function sanitizeUrls(content, filters) {
	filters.forEach(regex => {
		content.match(regex).forEach(url => (content = content.replace(url, url.split("?")[0])));
	});
	return content;
}

function handleMessage(msgcontent) {
	const filters = [];
	for (const target of targets) {
		const regex = urlRegex(target);
		if (msgcontent.match(regex)) filters.push(regex);
	}
	if (filters.length > 0) return sanitizeUrls(msgcontent, filters);
	return msgcontent;
}

function once() {
	DiscordUtils.setObservedGamesCallback([], nop);
	DiscordUtils.setObservedGamesCallback = nop;
	DiscordUtils.submitLiveCrashReport = nop;
	Analytics.default.track = nop;
}

Plugin.onStart(once, { once: true });
Plugin.onStart(() => {
	before(Anchor, "Anchor", ({ args }) => (args[0].href = handleMessage(args[0].href)));
	before(MessageActions, "sendMessage", ({ args: [, message] }) => (message.content = handleMessage(message.content)));

	loop(blockedEvents, blockEvent);
	intercept("MESSAGE_CREATE", ({ type, message }) => {
		if (type === "MESSAGE_CREATE") if (message.author.id !== UserStore.getCurrentUser().id) message.content = handleMessage(message.content);
	});
});

module.exports = () => Plugin;
