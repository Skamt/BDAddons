import "./patches/*";
import "./dispatcher/*";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
