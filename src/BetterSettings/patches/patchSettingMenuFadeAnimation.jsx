import { waitForModule, Filters } from "@Webpack";
import { Patcher } from "@Api";
import { getObjectKey, getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource(`"data-mana-component":"layer-modal"`), {
		signal: controller.signal,
		raw: true,
	}).then(({ exports: exp }) => {
		const key = getObjectKey(exp, () => true);
		if (!key) return Logger.patchError("SettingsMenuFadeAnimation");

		Patcher.after(exp, key, (_, arg, ret) => {
			if (!Settings.state.disableFade) return;
			const target = getNestedProp(
				ret,
				"props.children.props.children.props.children.props.children.props",
			);
			if (!target) return;
			const unpatch = Patcher.after(target, "children", (_, arg, ret) => {
				unpatch();
				return <div {...ret.props} style={{}} />;
			});
		});
	});
	Plugin.once(Events.STOP, () => controller.abort());
});
