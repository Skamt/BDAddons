/**
 * original script
 * https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb
 * */

import "./styles";
import "./patches/*";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import "@/questsManager";

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;