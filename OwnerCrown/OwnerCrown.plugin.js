/**
 * @runAt idle
 * @name OwnerCrown
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/OwnerCrown
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/OwnerCrown/OwnerCrown.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "OwnerCrown",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/OwnerCrown/OwnerCrown.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/OwnerCrown",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		setTimeout(target.dispatchEvent(new Event("START")));
	},
	stop() {
		setTimeout(target.dispatchEvent(new Event("STOP")));
	}
};

// common/Utils/Object.js
function hasOwn(object, key) {
	return object && key && key in object;
}

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patch(type, object, key, callback) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var before = (...args) => patch("before", ...args);

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = /* @__PURE__ */ (() => getStore("GuildStore"))();

// src/OwnerCrown/index.js
var { MemberListItem } = getMangled(Filters.bySource("isOwner", "MEMBER_LIST_ITEM_AVATAR_DECORATION_PADDING"), {
	MemberListItem: (a) => typeof a === "object"
}) || {};
Plugin_default.onStart(() => {
	before(MemberListItem, "type", ({ args: [props] }) => {
		const { guildId, user, isOwner } = props;
		props.isOwner = isOwner || GuildStore_default.getGuild(guildId)?.ownerId === user?.id;
	});
});
module.exports = () => Plugin_default;
