/**
 * @name NoPing
 * @description Let's you pick who not to ping
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoPing
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
	for (var name in all)
		__defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	}
	return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/NoPing/index.js
var index_exports = {};
__export(index_exports, {
	default: () => NoPing
});
module.exports = __toCommonJS(index_exports);

// config:@Config
var Config_default = {
	"info": {
		"name": "NoPing",
		"version": "1.0.0",
		"description": "Let's you pick who not to ping",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/NoPing",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// src/NoPing/blacklist.js
var blacklist_default = new class extends Set {
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
}(Data.load("blacklist") || []);

// src/NoPing/patches/patchCreatePendingReply.js
var ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports: true });
var patchCreatePendingReply_default = () => {
	const { module: module2, key } = ReplyFunctions;
	if (!module2 || !key) return Logger_default.patchError("patchCreatePendingReply");
	Patcher.before(module2, key, (_, [args]) => {
		if (blacklist_default.has(args.message.author.id)) {
			args.shouldMention = false;
		}
		args.showMentionToggle = true;
	});
};

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false });

// src/NoPing/patches/patchSendMessage.js
var patchSendMessage_default = () => {
	if (!MessageActions_default) return Logger_default.patchError("patchSendMessage");
	Patcher.before(MessageActions_default, "_sendMessage", (_, args) => {
		const [, id] = args[1].content.match(/<@(\d+)>/) || [];
		if (!id) return;
		if (!blacklist_default.has(id)) return;
		args[2].flags = 4096;
	});
};

// src/NoPing/patches/patchContextMenus.js
var patchContextMenus_default = () => {
	return [
		ContextMenu.patch("user-context", function(retVal, { user }) {
			if (!user.id) return;
			retVal.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Never ping",
					active: blacklist_default.has(user.id),
					action: () => blacklist_default.toggle(user.id)
				})
			);
		})
	];
};

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = getStore("PendingReplyStore");

// src/NoPing/index.js
function replyToggle({ channelId }) {
	const { message, shouldMention } = PendingReplyStore_default.getPendingReply(channelId);
	if (!shouldMention) blacklist_default.add(message.author.id);
	else blacklist_default.delete(message.author.id);
}
var NoPing = class {
	start() {
		try {
			DOM.addStyle(css);
			Dispatcher_default.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
			patchCreatePendingReply_default();
			patchSendMessage_default();
			this.unpatchContextMenu = patchContextMenus_default();
		} catch (e) {
			Logger_default.error(e);
		}
	}
	stop() {
		this.unpatchContextMenu?.forEach?.((p) => p());
		this.unpatchContextMenu = null;
		Dispatcher_default.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
};
