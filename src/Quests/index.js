/*!
 * original script
 * https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb
 * */

import "./styles";
import "./patches/*";
import Plugin from "@common/Plugin";
import { Patcher } from "@Api";
import "@/questsManager";

Plugin.onStop(() => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;