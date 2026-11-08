import "./patches/*";
import "./experiments";
import "./SettingComponent";
import Plugin from "@common/Plugin";
import ErrorBoundary from "@Components/ErrorBoundary";
import DiscordModules from "@Modules/all";
import * as modules from "@Discord/Modules";
import * as Utils from "@Utils";
import * as Webpack from "@Webpack";

import * as utils from "./utils";
import webpack from "./webpack";

if (console.context) console = console.context();

function init() {
	window.s = Object.assign(webpack, {
		Utils: {
			ErrorBoundary,
			...Utils,
			...utils
		},
		Webpack,
		DiscordModules: { DiscordModules, modules }
	});
}

Plugin.onStart(() => {
	init();
});

Plugin.onStop(() => {
	"s" in window && delete window.s;
});

module.exports = () => Plugin;
