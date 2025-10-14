import React, { useState, useEffect, useContext } from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ContextMenuStore from "@Stores/ContextMenuStore";
import LayerStore from "@Stores/LayerStore";

import { ModalActions } from "@Utils/Modals";
import { getMangled, Filters } from "@Webpack";

const { BasePopout } = getMangled(Filters.bySource("renderLayer", "POPOUT_PREVENT_CLOSE"), {
	BasePopout: a => a.contextType
});

function usePopoutListener() {
	const [hasPopout, setHasPopout] = useState(false);
	const { windowDispatch } = useContext(BasePopout.contextType);
	
	useEffect(() => {
		function show() {
			setHasPopout(true);
		}
		function hide() {
			setHasPopout(false);
		}

		windowDispatch.subscribe("POPOUT_SHOW", show);
		windowDispatch.subscribe("POPOUT_HIDE", hide);
		return () => {
			windowDispatch.unsubscribe("POPOUT_SHOW", show);
			windowDispatch.unsubscribe("POPOUT_HIDE", hide);
		};
	}, [windowDispatch]);

	return hasPopout;
}

export default function DragHandle() {
	const hasPopout = usePopoutListener();
	const hasAny = ModalActions.ModalStore(a => a.default?.length > 0 || a.popout?.length > 0);
	const hasLayers = useStateFromStores([LayerStore], () => LayerStore.hasLayers());
	const isOpen = useStateFromStores([ContextMenuStore], () => ContextMenuStore.isOpen());
	const style = { "width": "100%", "flex": "1 0 0" };

	if (!hasAny && !isOpen && !hasLayers && !hasPopout) style["-webkit-app-region"] = "drag";
	return <div style={style} />;
}
