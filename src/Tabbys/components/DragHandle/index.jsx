import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ContextMenuStore from "@Stores/ContextMenuStore";
import LayerStore from "@Stores/LayerStore";
import { SettingsButtonStore } from "@/components/SettingsButton";

export default function DragHandle() {
	const open = SettingsButtonStore(a => a.isOpen);
	const hasLayers = useStateFromStores([LayerStore], () => LayerStore.hasLayers());
	const isOpen = useStateFromStores([ContextMenuStore], () => ContextMenuStore.isOpen());
	const style = { "width": "100%", "flex": "1 0 0" };
	if (!isOpen && !hasLayers && !open) style["-webkit-app-region"] = "drag";
	return <div style={style} />;
}
