import Plugin from "@common/Plugin";
import { Dispatcher } from "@Discord/Modules";
import Settings from "@Utils/Settings";
import { switchLeft, switchRight } from "@/Store/methods";

Plugin.onStart(() => {
	document.addEventListener("keydown", onKeyDown);
});

Plugin.onStop(() => {
	document.removeEventListener("keydown", onKeyDown);
});

function onKeyDown(e) {
	if (!Settings.state.tabSwitch) return;
	if (e.key !== "Tab" || !e.ctrlKey) return;

	e.stopPropagation();
	if (e.shiftKey) switchLeft();
	else switchRight();
}
