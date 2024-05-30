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
})(Data.load("blacklist"));

const ReplyFunctions = getModule(a => a.createPendingReply);

const patchCreatePendingReply = () => {
	if (!ReplyFunctions) return Logger.patch("patchCreatePendingReply");

	Patcher.before(ReplyFunctions, "createPendingReply", (_, [args]) => {
		if (blacklist.has(args.message.author.id)) {
			args.shouldMention = false;
		}
		args.showMentionToggle = true;
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
