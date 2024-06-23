/**
 * @name NoPing
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoPing
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js
 */

const config = {
	"info": {
		"name": "NoPing",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/NoPing",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const Api = new BdApi(config.info.name);
const DOM = Api.DOM;
const Data = Api.Data;
const Patcher = Api.Patcher;
const ContextMenu = Api.ContextMenu;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return {};
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return {};
	return { module, key };
}

const blacklist = new(class extends Set {
	commit() {
		Data.save("blacklist", Array.from(this));
	}

	add(...args) {
		super.add.apply(this, args);
		this.commit();
	}

	delete(...args) {
		super.delete.apply(this, args);
		this.commit();
	}

	toggle(id) {
		if (this.has(id)) this.delete(id);
		else this.add(id);
	}
})(Data.load("blacklist") || []);

const ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports: true });

const patchCreatePendingReply = () => {
	const { module, key } = ReplyFunctions;
	if (!module || !key) return Logger.patch("patchCreatePendingReply");

	Patcher.before(module, key, (_, [args]) => {
		if (blacklist.has(args.message.author.id)) {
			args.shouldMention = false;
		}
		args.showMentionToggle = true;
	});
};

const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'), { searchExports: false });

const patchSendMessage = () => {
	if (!MessageActions) return Logger.patch("patchSendMessage");
	Patcher.before(MessageActions, "_sendMessage", (_, args) => {
		const [, id] = args[1].content.match(/<@(\d+)>/) || [];
		if (!id) return;
		if (!blacklist.has(id)) return;
		args[2].flags = 4096;
	});
};

const patchContextMenus = () => {
	return [
		ContextMenu.patch("user-context", function(retVal, { user }) {

			if (!user.id) return;

			retVal.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Never ping",
					active: blacklist.has(user.id),
					action: () => blacklist.toggle(user.id)
				})
			);
		})
	];
};

const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

const PendingReplyStore = getModule(m => m._dispatchToken && m.getName() === "PendingReplyStore");

function replyToggle({ channelId }) {
	const { message, shouldMention } = PendingReplyStore.getPendingReply(channelId);
	if (!shouldMention) blacklist.add(message.author.id);
	else blacklist.delete(message.author.id);
}

class NoPing {
	start() {
		try {
			DOM.addStyle(css);
			Dispatcher.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
			patchCreatePendingReply();
			patchSendMessage();
			this.unpatchContextMenu = patchContextMenus();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
		Dispatcher.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);

		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}

module.exports = NoPing;

const css = ``;
