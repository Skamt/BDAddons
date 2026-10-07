/**
 * @runAt idle
 * @name Search
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Search
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Search/Search.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "Search",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Search/Search.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Search",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
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

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
}

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var contextmenu_default = ContextMenu;

// src/Search/index.js
var Dispatcher = getModule((a) => a?.emitter?._events?.FOCUS_SEARCH, { searchExports: true });

function search(query) {
	Dispatcher.dispatch("SET_SEARCH_QUERY", {
		query,
		performSearch: false,
		focus: true,
		replace: true
	});
}
Plugin_default.onStart(() => {
	patch("user-context", (ret, { user, channel }) => {
		const channelId = SelectedChannelStore_default.getChannelId();
		if (!channelId) return;
		if (channel.isDM())
			return insertChild(
				ret,
				contextmenu_default.buildItem({
					label: "Search messages",
					action() {
						search(`from:${user.id}`);
					}
				}),
				0
			);
		insertChild(
			ret,
			contextmenu_default.buildItem({
				label: "Search",
				type: "submenu",
				items: [{
						label: "Messages in channel",
						action() {
							search(`in:${channel.id} from:${user.id}`);
						}
					},
					{
						label: "Messages in Server",
						action() {
							search(`from:${user.id}`);
						}
					}
				]
			}),
			0
		);
	});
});
module.exports = () => Plugin_default;
