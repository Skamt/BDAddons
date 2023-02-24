new class RemoveTrackersfromURLS extends Disposable {
	constructor() {
		super();
		this.targets = ["spotify"];
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

	Init() {
		this.patches = [
			Patcher.before(MessageActions, "sendMessage", (_, [, message]) => {
				message.content = this.handleMessage(message.content);
			}),

			Patcher.before(Dispatcher, "dispatch", (_, [type, message]) => {
				if (type === "MESSAGE_CREATE")
					if (message.author.id !== DiscordModules.UserStore.getCurrentUser().id)
						message.content = this.handleMessage(message.content);
			})
		];
	}
}