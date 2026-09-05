import { getByKeys, Filters, getDeclarationAndKey } from "@Webpack";
import { Patcher } from "@Api";
import { getNestedProp } from "@Utils";
import { classNameFactory } from "@Utils/css";
import Logger from "@Utils/Logger";
import React from "@React";
import Settings from "@Utils/Settings";
import { FocusLock, ComponentDispatch } from "@Discord/Modules";
import Plugin, { Events } from "@Utils/Plugin";

const BaseLayer = getDeclarationAndKey(
	Filters.bySource("this.renderArtisanalHack()"),
	Filters.byPrototypeKeys("animateIn"),
);

const Classes = getByKeys("animating", "baseLayer", "bg", "layer", "layers");
const cl = classNameFactory("","");

function Layer({ mode, baseLayer = false, ...props }) {
	const hidden = mode === "HIDDEN";
	const containerRef = React.useRef(null);

	React.useEffect(
		() => () => {
			ComponentDispatch.dispatch("LAYER_POP_START");
			ComponentDispatch.dispatch("LAYER_POP_COMPLETE");
		},
		[],
	);

	const node = (
		<div
			ref={containerRef}
			aria-hidden={hidden}
			className={cl({
				[Classes.layer]: true,
				[Classes.baseLayer]: baseLayer,
				"stop-animations": hidden,
			})}
			style={{ opacity: hidden ? 0 : undefined }}
			{...props}
		/>
	);

	return baseLayer ? node : <FocusLock containerRef={containerRef}>{node}</FocusLock>;
}

function prepLayer(props) {
	try {
		[FocusLock, ComponentDispatch, Classes.layer].forEach((e) => e.test);
	} catch {
		Logger.error("Failed to find some components");
		return props.children;
	}

	return <Layer {...props} />;
}

Plugin.on(Events.START, () => {
	const { module, key } = BaseLayer;
	if (!module || !key) return Logger.error("BaseLayer");

	const origin = module[key];

	function run() {
		if (!Settings.state.disableFade) {
			module[key] = origin;
		} else module[key] = prepLayer;
	}

	run();
	const unsub = Settings.subscribe(Settings.selectors.disableFade, run);

	Plugin.on(Events.STOP, () => {
		unsub();
		module[key] = origin;
	})
});
