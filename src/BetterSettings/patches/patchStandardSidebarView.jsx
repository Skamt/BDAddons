import { Filters, waitForModule } from "@Webpack";
import { Patcher } from "@Api";
import { getObjectKey, getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import React from "@React";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

const ServerSettings = Plugin.on(Events.START, async () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource("SCROLLABLE_CUSTOM"), {
		signal: controller.signal,
		raw: true,
	}).then(({ declarations }) => {
		const key = getObjectKey(declarations, Filters.byStrings("noticeRegionHiddenSidebar"));
		if (!key) return Logger.patchError("patchServerSettings");

		Patcher.after(declarations, key, (_, arg, ret) => {
			if (!Settings.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;

			ret.props.children = <div {...animatedDiv.props} />;
		});
	});
	Plugin.once(Events.STOP, () => controller.abort());
});
