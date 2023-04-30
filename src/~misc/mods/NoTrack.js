import { nop, Disposable } from "@Utils";
import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import DiscordUtils from "@Modules/DiscordUtils";
import Analytics from "@Modules/Analytics";
import Anchor from "@Modules/Anchor";
import MessageActions from "@Modules/MessageActions";
import Dispatcher from "@Modules/Dispatcher";

import UserStore from "@Stores/UserStore";

export default class NoTrack extends Disposable {
	constructor() {
		super();
		this.targets = ["spotify"];
		this.blockedEvents = ["EXPERIMENT_TRIGGER", "TRACK"];
	}

	urlRegex(name) {
		return new RegExp(`((?:https|http)\\:\\/\\/(?:.*\\.)?${name}\\..*\\/\\S+)`, 'g')
	}

	sanitizeUrls(content, filters) {
		filters.forEach((regex) => {
			content.match(regex)
				.forEach(url =>
					content = content.replace(url, url.split('?')[0])
				);
		})
		return content;
	}

	handleMessage(msgcontent) {
		const filters = [];
		for (const target of this.targets) {
			const regex = this.urlRegex(target);
			if (msgcontent.match(regex))
				filters.push(regex);
		}
		if (filters.length > 0)
			return this.sanitizeUrls(msgcontent, filters);
		return msgcontent;
	}

	once() {
		DiscordUtils.setObservedGamesCallback([], nop);
		DiscordUtils.setObservedGamesCallback = nop;
		Analytics.default.track = nop;
		this.once = nop;
	}

	Init() {
		this.once();
		if (Anchor)
			this.patches.push(Patcher.before(Anchor, "type", (_, args) => {
				args[0].href = this.handleMessage(args[0].href);
			}));
		else
			Logger.patch("NoTrack-Anchor");
		if (MessageActions)
			this.patches.push(Patcher.before(MessageActions, "sendMessage", (_, [, message]) => {
				message.content = this.handleMessage(message.content);
			}));
		else
			Logger.patch("NoTrack-MessageActions");
		if (Dispatcher)
			this.patches.push(Patcher.before(Dispatcher, "dispatch", (_, [{ type, message }]) => {
				if (this.blockedEvents.some(e => e === type)) return {};
				if (type === "MESSAGE_CREATE")
					if (message.author.id !== UserStore.getCurrentUser().id)
						message.content = this.handleMessage(message.content);
			}));
		else
			Logger.patch("NoTrack-Dispatcher");
	}
}