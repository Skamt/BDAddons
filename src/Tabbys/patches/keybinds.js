import Plugin from "@common/Plugin";
import Settings from "@Settings";
import { switchLeft, switchRight } from "@/Store/methods";

function onKeyDown(e) {
	if (!Settings.state.tabSwitch) return;
	if (e.key !== "Tab" || !e.ctrlKey) return;

	e.stopPropagation();
	if (e.shiftKey) switchLeft();
	else switchRight();
}

Plugin.onStart(() => document.addEventListener("keydown", onKeyDown));
Plugin.onStop(() => document.removeEventListener("keydown", onKeyDown));
