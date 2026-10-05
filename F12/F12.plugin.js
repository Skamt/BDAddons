/**
 * @runAt idle
 * @name F12
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/F12
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/F12/F12.plugin.js
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
	// If the importer is in node compatibility mode or this is not an ESM
	// file that has been converted to a CommonJS file using a Babel-
	// compatible transform (i.e. "__esModule" has not been set), then set
	// "default" to the CommonJS "module.exports" for node compatibility.
	isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
	mod
));

// config:@Config
var Config_default = {
	"info": {
		"name": "F12",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/F12/F12.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/F12",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();

// src/F12/index.js
var import_electron = __toESM(require("electron"));

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
}

// src/F12/index.js
module.exports = () => ({
	stop() {},
	start() {
		this.stop = ContextMenu.patch("settings-menu", (ret) => {
			const MenuItem = BdApi.ContextMenu.buildItem({
				label: "Open Console",
				action() {
					import_electron.default.ipcRenderer.send("bd-toggle-devtools");
				}
			});
			insertChild(ret, MenuItem);
		});
	}
});
