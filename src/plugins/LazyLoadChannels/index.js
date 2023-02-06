module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Data,
		Patcher,
		React,
		React: { useState },
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	const { DiscordModules: { Dispatcher } } = Api;

	// Modules
	const ChannelActions = DiscordModules.ChannelActions;
	const ChannelContent = DiscordModules.ChannelContent;
	const SwitchRow = DiscordModules.SwitchRow;

	// Constants
	const EVENTS = {
		THREAD_LIST_SYNC: "THREAD_LIST_SYNC",
		CHANNEL_SELECT: "CHANNEL_SELECT",
		CHANNEL_PRELOAD: "CHANNEL_PRELOAD",
	};

	// styles
	const css = require("styles.css");

	// Components
	const LazyLoader = require("components/LazyLoader.jsx");

	return class LazyLoadChannels extends Plugin {

		constructor() {
			super();
			this.channelSelect = this.channelSelect.bind(this);
		}

		patchChannelContent() {
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel: { type, id, guild_id, lastMessageId } }], returnValue) => {
				console.log(returnValue);
				// console.log("TRIGGERED");
				if (type === 11 && returnValue.props.children.props.messages.length <= 2) return returnValue;
				if (Data.load(id)) return returnValue;

				return React.createElement(LazyLoader, {
					channelId: id,
					guildId: guild_id,

					messageId: lastMessageId,
					original: returnValue
				});;
			});
		}
		channelSelect(e) {
			if (Data.load(e.channelId))
				ChannelActions.actions[EVENTS.CHANNEL_SELECT](e);
		}
		onStart() {
			try {
				DOM.addStyle(css);
				Dispatcher.subscribe("CHANNEL_SELECT", this.channelSelect);
				Object.keys(EVENTS).forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
				this.patchChannelContent();
			} catch (e) {
				Logger.err(e);
			}
		}

		onStop() {
			Dispatcher.unsubscribe("CHANNEL_SELECT", this.channelSelect);
			Object.keys(EVENTS).forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}