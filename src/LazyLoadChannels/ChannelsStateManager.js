import { Data } from "@Api";

import Plugin, { Events } from "@Utils/Plugin";
const ChannelsStateManager = {
	init() {
		this.channels = new Set(Data.load("channels") || []);
		this.guilds = new Set(Data.load("guilds") || []);
		this.exceptions = new Set(Data.load("exceptions") || []);
	},
	add(key, target) {
		this[key].add(target);
		Data.save(key, this[key]);
	},
	remove(key, target) {
		this[key].delete(target);
		Data.save(key, this[key]);
	},
	has(key, target) {
		return this[key].has(target);
	},
	getChannelstate(guildId, channelId) {
		if ((this.guilds.has(guildId) && !this.exceptions.has(channelId)) || this.channels.has(channelId)) return true;
		return false;
	},
	toggelGuild(guildId) {
		if (this.guilds.has(guildId)) this.remove("guilds", guildId);
		else this.add("guilds", guildId);
	},
	toggelChannel(guildId, channelId) {
		if (this.guilds.has(guildId)) {
			if (!this.exceptions.has(channelId)) this.add("exceptions", channelId);
			else {
				this.remove("exceptions", channelId);
			}
		} else if (this.channels.has(channelId)) this.remove("channels", channelId);
		else this.add("channels", channelId);
	}
};

Plugin.once(Events.START, () => {
	ChannelsStateManager.init();
});

export default ChannelsStateManager;
